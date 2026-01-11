import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { verifyPassword } from "@/app/lib/password";
import {
  issueTokensForUser,
  normalizeEmail,
  normalizePhone,
} from "@/app/lib/auth";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const email = normalizeEmail((body as { email?: unknown }).email);
    const phone = normalizePhone((body as { phone?: unknown }).phone);
    const password = (body as { password?: unknown }).password;

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length === 0) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const orConditions: Array<{ email?: string; phone?: string }> = [];
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });

    const user = await prisma.user.findFirst({
      where: { OR: orConditions },
      select: {
        id: true,
        email: true,
        phone: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const tokens = await issueTokensForUser(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        roles: tokens.roles,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
