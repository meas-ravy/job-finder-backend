import {
  issueTokensForUser,
  normalizeEmail,
  normalizePhone,
  parseSelfSelectableRoles,
} from "@/app/lib/auth";
import { hashPassword } from "@/app/lib/password";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const roles = parseSelfSelectableRoles((body as { roles?: unknown }).roles);
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
      },
      select: { id: true, email: true, phone: true },
    });

    if (roles.length > 0) {
      await prisma.userRole.createMany({
        data: roles.map((role: any) => ({ userId: user.id, role })),
        skipDuplicates: true,
      });
    }

    const tokens = await issueTokensForUser(user.id);

    return NextResponse.json(
      {
        user: { ...user, roles: tokens.roles },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      { status: 201 }
    );
  } catch (error) {
    const prismaCode = (error as { code?: unknown } | null)?.code;
    if (prismaCode === "P2002") {
      return NextResponse.json(
        { error: "Email or phone already in use" },
        { status: 409 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
