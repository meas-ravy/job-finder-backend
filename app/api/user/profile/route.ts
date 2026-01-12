import { NextResponse } from "next/server";
import { getBearerToken, verifyAccessToken } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * Get current user profile
 * Requires authentication via Bearer token
 */
export async function GET(request: Request) {
  try {
    // Get and verify access token
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    let userId: string;
    let roles: string[];
    try {
      const decoded = verifyAccessToken(token);
      userId = decoded.userId;
      roles = decoded.roles;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...user,
        roles,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
