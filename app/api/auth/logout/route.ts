import { revokeRefreshToken } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    const refreshToken =
      body && typeof body === "object"
        ? (body as { refreshToken?: unknown }).refreshToken
        : undefined;

    if (typeof refreshToken !== "string" || refreshToken.length === 0) {
      return NextResponse.json(
        { error: "refreshToken is required" },
        { status: 400 }
      );
    }

    await revokeRefreshToken(refreshToken);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
