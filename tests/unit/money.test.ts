import { describe, it, expect } from "vitest";
import {
  rupeesToPaise,
  paiseToRupees,
  formatIndianRupees,
  formatRupees,
  calculateProgressPercentage,
} from "@/lib/money";

describe("Money Utility Functions", () => {
  describe("rupeesToPaise", () => {
    it("converts whole rupees to integer paise correctly", () => {
      expect(rupeesToPaise(100)).toBe(10000);
      expect(rupeesToPaise(501)).toBe(50100);
      expect(rupeesToPaise(150000)).toBe(15000000);
    });

    it("handles decimal paise precision without floating-point artifacts", () => {
      expect(rupeesToPaise(10.5)).toBe(1050);
      expect(rupeesToPaise(99.99)).toBe(9999);
      expect(rupeesToPaise(0.01)).toBe(1);
    });

    it("returns 0 for negative, zero or NaN values", () => {
      expect(rupeesToPaise(0)).toBe(0);
      expect(rupeesToPaise(-50)).toBe(0);
      expect(rupeesToPaise(NaN)).toBe(0);
    });
  });

  describe("paiseToRupees", () => {
    it("converts paise to rupee amounts", () => {
      expect(paiseToRupees(10000)).toBe(100);
      expect(paiseToRupees(50100)).toBe(501);
      expect(paiseToRupees(15000000)).toBe(150000);
    });

    it("handles fractional rupee paise", () => {
      expect(paiseToRupees(1050)).toBe(10.5);
      expect(paiseToRupees(9999)).toBe(99.99);
      expect(paiseToRupees(1)).toBe(0.01);
    });

    it("returns 0 for negative or NaN values", () => {
      expect(paiseToRupees(0)).toBe(0);
      expect(paiseToRupees(-100)).toBe(0);
      expect(paiseToRupees(NaN)).toBe(0);
    });
  });

  describe("formatIndianRupees", () => {
    it("formats Indian grouping for thousands and lakhs", () => {
      // 1,50,000 Rupees = 15,000,000 Paise
      const formatted = formatIndianRupees(15000000);
      expect(formatted).toMatch(/1,50,000/);
      expect(formatted).toContain("₹");
    });

    it("formats small shagun amounts (₹501, ₹1,001, ₹2,001)", () => {
      expect(formatIndianRupees(50100)).toMatch(/501/);
      expect(formatIndianRupees(100100)).toMatch(/1,001/);
      expect(formatIndianRupees(200100)).toMatch(/2,001/);
    });

    it("formats 0 paise gracefully", () => {
      expect(formatIndianRupees(0)).toMatch(/₹\s*0/);
    });
  });

  describe("calculateProgressPercentage", () => {
    it("calculates accurate whole percentages", () => {
      expect(calculateProgressPercentage(50000, 100000)).toBe(50);
      expect(calculateProgressPercentage(75000, 100000)).toBe(75);
      expect(calculateProgressPercentage(100000, 100000)).toBe(100);
    });

    it("caps progress at 100%", () => {
      expect(calculateProgressPercentage(150000, 100000)).toBe(100);
      expect(calculateProgressPercentage(20000000, 10000000)).toBe(100);
    });

    it("handles zero target amount safely without dividing by zero", () => {
      expect(calculateProgressPercentage(1000, 0)).toBe(0);
      expect(calculateProgressPercentage(1000, -100)).toBe(0);
    });
  });
});
