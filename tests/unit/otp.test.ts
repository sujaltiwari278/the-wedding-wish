import { describe, it, expect } from "vitest";
import {
  normalizeIndianMobile,
  generateOtp,
  hashOtp,
  verifyOtpHash,
  MAX_ATTEMPTS,
  OTP_EXPIRY_MS,
  RESEND_COOLDOWN_MS,
} from "@/lib/otp";

describe("OTP and Mobile Validation Helpers", () => {
  describe("normalizeIndianMobile", () => {
    it("accepts standard 10-digit mobile starting with 6-9", () => {
      const res = normalizeIndianMobile("9876543210");
      expect(res.isValid).toBe(true);
      expect(res.e164).toBe("+919876543210");
    });

    it("normalizes numbers with leading +91", () => {
      const res = normalizeIndianMobile("+91 98765 43210");
      expect(res.isValid).toBe(true);
      expect(res.e164).toBe("+919876543210");
    });

    it("normalizes numbers with leading 0 (STD trunk)", () => {
      const res = normalizeIndianMobile("09876543210");
      expect(res.isValid).toBe(true);
      expect(res.e164).toBe("+919876543210");
    });

    it("strips dashes and brackets", () => {
      const res = normalizeIndianMobile("(+91) 8123-456-789");
      expect(res.isValid).toBe(true);
      expect(res.e164).toBe("+918123456789");
    });

    it("rejects numbers not starting with 6, 7, 8, or 9", () => {
      const res = normalizeIndianMobile("5123456789");
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/must begin with 6, 7, 8, or 9/);
    });

    it("rejects invalid lengths", () => {
      expect(normalizeIndianMobile("98765").isValid).toBe(false);
      expect(normalizeIndianMobile("9876543210123").isValid).toBe(false);
      expect(normalizeIndianMobile("").isValid).toBe(false);
    });
  });

  describe("generateOtp", () => {
    it("generates a 6-digit numeric string", () => {
      for (let i = 0; i < 20; i++) {
        const otp = generateOtp();
        expect(otp).toHaveLength(6);
        expect(/^\d{6}$/.test(otp)).toBe(true);
        const num = parseInt(otp, 10);
        expect(num).toBeGreaterThanOrEqual(100000);
        expect(num).toBeLessThan(1000000);
      }
    });
  });

  describe("hashOtp and verifyOtpHash", () => {
    it("hashes and correctly verifies matching OTP and mobile", () => {
      const mobile = "+919876543210";
      const otp = "543210";
      const hash = hashOtp(otp, mobile);

      expect(hash).toHaveLength(64); // SHA-256 hex length
      expect(verifyOtpHash(otp, mobile, hash)).toBe(true);
    });

    it("fails verification for wrong OTP", () => {
      const mobile = "+919876543210";
      const hash = hashOtp("123456", mobile);
      expect(verifyOtpHash("654321", mobile, hash)).toBe(false);
    });

    it("fails verification if mobile number differs", () => {
      const hash = hashOtp("123456", "+919876543210");
      expect(verifyOtpHash("123456", "+919999999999", hash)).toBe(false);
    });
  });

  describe("Constants", () => {
    it("enforces security parameters", () => {
      expect(MAX_ATTEMPTS).toBe(5);
      expect(OTP_EXPIRY_MS).toBe(300000); // 5 min
      expect(RESEND_COOLDOWN_MS).toBe(30000); // 30 sec
    });
  });
});
