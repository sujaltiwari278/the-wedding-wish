import crypto from "crypto";

/**
 * Generates a unique human-readable transaction reference
 * Format: WW-YYYYMMDD-XXXXXX (e.g. WW-20261121-7A9B3C)
 */
export function generateTransactionId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `WW-${year}${month}${day}-${randomHex}`;
}
