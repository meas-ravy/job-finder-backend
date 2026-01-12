import { prisma } from "./prisma";
import { sha256Base64Url } from "./auth";

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 3;
const MAX_OTP_REQUESTS_PER_HOUR = 3;

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

/**
 * Hash OTP for secure storage
 */
export function hashOTP(otp: string): string {
  return sha256Base64Url(otp);
}

/**
 * Verify OTP against hash
 */
export function verifyOTP(otp: string, hash: string): boolean {
  return hashOTP(otp) === hash;
}

/**
 * Check if phone number has exceeded rate limit
 */
export async function checkRateLimit(phone: string): Promise<boolean> {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const recentRequests = await prisma.phoneOtp.count({
    where: {
      phone,
      createdAt: {
        gte: oneHourAgo,
      },
    },
  });

  return recentRequests < MAX_OTP_REQUESTS_PER_HOUR;
}

/**
 * Create and store OTP for phone number
 */
export async function createOTP(phone: string): Promise<string> {
  // Check rate limit
  const withinLimit = await checkRateLimit(phone);
  if (!withinLimit) {
    throw new Error("Too many OTP requests. Please try again in an hour.");
  }

  // Generate OTP
  const otp = generateOTP();
  const otpHash = hashOTP(otp);

  // Set expiry time
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

  // Delete any existing unconsumed OTPs for this phone
  await prisma.phoneOtp.deleteMany({
    where: {
      phone,
      consumedAt: null,
    },
  });

  // Create new OTP record
  await prisma.phoneOtp.create({
    data: {
      phone,
      codeHash: otpHash,
      expiresAt,
    },
  });

  return otp;
}

/**
 * Verify OTP and mark as verified
 */
export async function verifyAndConsumeOTP(
  phone: string,
  otp: string
): Promise<boolean> {
  // Find unconsumed, non-expired OTP
  const otpRecord = await prisma.phoneOtp.findFirst({
    where: {
      phone,
      consumedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otpRecord) {
    return false;
  }

  // Check attempts
  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error(
      "Maximum verification attempts exceeded. Please request a new OTP."
    );
  }

  // Verify OTP
  const isValid = verifyOTP(otp, otpRecord.codeHash);

  if (!isValid) {
    // Increment attempts
    await prisma.phoneOtp.update({
      where: { id: otpRecord.id },
      data: { attempts: otpRecord.attempts + 1 },
    });
    return false;
  }

  // Mark as consumed
  await prisma.phoneOtp.update({
    where: { id: otpRecord.id },
    data: { consumedAt: new Date() },
  });

  return true;
}

/**
 * Clean up expired OTPs (can be run as a cron job)
 */
export async function cleanupExpiredOTPs(): Promise<void> {
  await prisma.phoneOtp.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}
