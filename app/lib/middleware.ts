import { NextResponse } from "next/server";
import { getBearerToken, verifyAccessToken, type RoleName } from "./auth";

export interface AuthContext {
  userId: string;
  roles: RoleName[];
}

/**
 * Require authentication for a route
 * Returns user context or throws error
 */
export function requireAuth(request: Request): AuthContext {
  const token = getBearerToken(request);
  if (!token) {
    throw new Error("Authorization token required");
  }

  try {
    const decoded = verifyAccessToken(token);
    return {
      userId: decoded.userId,
      roles: decoded.roles,
    };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Require specific role(s) for a route
 * Returns user context or throws error
 */
export function requireRole(
  request: Request,
  allowedRoles: RoleName[]
): AuthContext {
  const auth = requireAuth(request);

  const hasRole = auth.roles.some(role => allowedRoles.includes(role));
  if (!hasRole) {
    throw new Error(
      `Forbidden: Requires one of these roles: ${allowedRoles.join(", ")}`
    );
  }

  return auth;
}

/**
 * Require admin role for a route
 * Returns user context or throws error
 */
export function requireAdmin(request: Request): AuthContext {
  return requireRole(request, ["Admin"]);
}

/**
 * Require recruiter role for a route
 * Returns user context or throws error
 */
export function requireRecruiter(request: Request): AuthContext {
  return requireRole(request, ["Recruiter", "Admin"]);
}

/**
 * Require job finder role for a route
 * Returns user context or throws error
 */
export function requireJobFinder(request: Request): AuthContext {
  return requireRole(request, ["Job_finder", "Admin"]);
}

/**
 * Require user to have at least one role
 * Returns user context or throws error
 */
export function requireHasRole(request: Request): AuthContext {
  const auth = requireAuth(request);

  if (auth.roles.length === 0) {
    throw new Error("Please select a role to continue");
  }

  return auth;
}

/**
 * Helper to handle auth errors and return proper responses
 */
export function handleAuthError(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : "Unknown error";

  if (message.includes("Authorization token required")) {
    return NextResponse.json({ error: message }, { status: 401 });
  }

  if (message.includes("Invalid or expired token")) {
    return NextResponse.json({ error: message }, { status: 401 });
  }

  if (message.includes("Forbidden") || message.includes("role")) {
    return NextResponse.json({ error: message }, { status: 403 });
  }

  return NextResponse.json({ error: message }, { status: 500 });
}
