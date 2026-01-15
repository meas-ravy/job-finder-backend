import { NextResponse } from "next/server";
import { createOTP } from "@/app/lib/otp";
import { sendOTP } from "@/app/lib/sms";

/**
 * Send OTP to phone number
 * POST /api/auth/send-otp
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const phone = (body as { phone?: unknown }).phone;

    if (typeof phone !== "string" || phone.length === 0) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.trim();
    if (normalizedPhone.length === 0) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Create and send OTP
    const otp = await createOTP(normalizedPhone);
    const providerResponse = await sendOTP(normalizedPhone, otp);

    // Don't return OTP in production - only for development
    const isDevelopment = process.env.NODE_ENV !== "production";

    return NextResponse.json({
      success: true,
      message: "OTP has been sent successfully",
      // Only return OTP in development
      ...(isDevelopment && { otp }), // Remove this in production!
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Handle rate limit errors
    if (message.includes("Too many")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
