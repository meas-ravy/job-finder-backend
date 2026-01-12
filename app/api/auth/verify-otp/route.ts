import { NextResponse } from "next/server";
import { verifyAndConsumeOTP } from "@/app/lib/otp";
import { prisma } from "@/app/lib/prisma";
import { issueTokensForUser } from "@/app/lib/auth";

/**
 * Verify OTP and auto-login/register user
 * POST /api/auth/verify-otp
 * 
 * This endpoint:
 * - Verifies the OTP code
 * - If user exists: logs them in
 * - If user doesn't exist: creates account and logs them in
 * - Returns tokens (user needs to select role if new user)
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const phone = (body as { phone?: unknown }).phone;
    const otp = (body as { otp?: unknown }).otp;

    if (typeof phone !== "string" || phone.length === 0) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (typeof otp !== "string" || otp.length === 0) {
      return NextResponse.json(
        { error: "OTP code is required" },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.trim();

    // Verify OTP
    const isValid = await verifyAndConsumeOTP(normalizedPhone, otp);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code" },
        { status: 401 }
      );
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      select: {
        id: true,
        phone: true,
        createdAt: true,
      },
    });

    const isNewUser = !user;

    if (isNewUser) {
      // Create new user (no password, no email)
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
        },
        select: {
          id: true,
          phone: true,
          createdAt: true,
        },
      });
    }

    // Issue tokens
    const tokens = await issueTokensForUser(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        roles: tokens.roles,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isNewUser, // Important: tells mobile app if user needs to select role
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Handle specific errors
    if (message.includes("Maximum verification attempts")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
