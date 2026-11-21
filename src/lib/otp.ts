import crypto from "crypto";

const OTP_SECRET = process.env.NEXTAUTH_SECRET || "wedding_wish_otp_secret_key";
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_ATTEMPTS = 5;

/**
 * Normalizes an Indian mobile number into standard E.164 format (+919876543210)
 * Validates that it starts with 6, 7, 8, or 9 and has 10 digits.
 */
export function normalizeIndianMobile(input: string): {
  isValid: boolean;
  e164: string;
  error?: string;
} {
  if (!input) {
    return { isValid: false, e164: "", error: "Mobile number is required" };
  }

  // Strip all non-digit characters
  let digits = input.replace(/\D/g, "");

  // Remove leading 0 if present (e.g. 09876543210)
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.substring(1);
  }

  // Remove leading 91 if 12 digits (e.g. 919876543210)
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.substring(2);
  }

  // Must now be exactly 10 digits starting with 6, 7, 8, or 9
  if (digits.length !== 10) {
    return {
      isValid: false,
      e164: "",
      error: "Indian mobile number must be exactly 10 digits",
    };
  }

  if (!/^[6-9]/.test(digits)) {
    return {
      isValid: false,
      e164: "",
      error: "Indian mobile numbers must begin with 6, 7, 8, or 9",
    };
  }

  return {
    isValid: true,
    e164: `+91${digits}`,
  };
}

/**
 * Generates a crypto-secure 6-digit random OTP
 */
export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hashes an OTP using SHA-256 with the app secret
 */
export function hashOtp(otp: string, mobileNumber: string): string {
  return crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${mobileNumber}:${otp}`)
    .digest("hex");
}

/**
 * Verifies an input OTP against the stored hash
 */
export function verifyOtpHash(
  otp: string,
  mobileNumber: string,
  storedHash: string
): boolean {
  const computedHash = hashOtp(otp, mobileNumber);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash, "utf-8"),
    Buffer.from(storedHash, "utf-8")
  );
}

export { OTP_EXPIRY_MS, RESEND_COOLDOWN_MS, MAX_ATTEMPTS };
