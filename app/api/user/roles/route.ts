import { NextResponse } from "next/server";
import {
  getBearerToken,
  parseSelfSelectableRoles,
  verifyAccessToken,
} from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * Add or update user roles after registration
 * Requires authentication via Bearer token
 */
export async function POST(request: Request) {
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
    try {
      const decoded = verifyAccessToken(token);
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const roles = parseSelfSelectableRoles((body as { roles?: unknown }).roles);

    if (roles.length === 0) {
      return NextResponse.json(
        { error: "At least one valid role is required" },
        { status: 400 }
      );
    }

    // Delete existing roles and add new ones
    await prisma.userRole.deleteMany({
      where: { userId },
    });

    await prisma.userRole.createMany({
      data: roles.map(role => ({ userId, role })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      ok: true,
      roles,
      message: "Roles updated successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Get current user's roles
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

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      userId: decoded.userId,
      roles: decoded.roles,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
