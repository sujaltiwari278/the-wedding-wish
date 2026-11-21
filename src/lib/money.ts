/**
 * Money Helpers for The Wedding Wish
 * Rule: Store ALL monetary values as integer paise (1 Rupee = 100 Paise)
 * Display formatted values with Indian number grouping (e.g., ₹1,50,000)
 */

/**
 * Converts an amount in Rupees (can be decimal) to integer Paise
 */
export function rupeesToPaise(rupees: number): number {
  if (isNaN(rupees) || rupees < 0) return 0;
  return Math.round(rupees * 100);
}

/**
 * Converts an amount in integer Paise to Rupees
 */
export function paiseToRupees(paise: number): number {
  if (isNaN(paise) || paise < 0) return 0;
  return Math.floor(paise) / 100;
}

/**
 * Formats integer Paise into Indian Rupee display format
 * Example: 15000000 paise -> "₹1,50,000"
 */
export function formatIndianRupees(
  paise: number,
  options?: { showPaise?: boolean }
): string {
  const rupees = paiseToRupees(paise);
  const showFraction = options?.showPaise && rupees % 1 !== 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: showFraction ? 2 : 0,
    minimumFractionDigits: showFraction ? 2 : 0,
  }).format(rupees);
}

/**
 * Formats Rupee amounts (not paise) directly with Indian grouping
 * Example: 150000 -> "₹1,50,000"
 */
export function formatRupees(rupees: number): string {
  return formatIndianRupees(rupeesToPaise(rupees));
}

/**
 * Calculates percentage funded given collected and target amounts in paise
 */
export function calculateProgressPercentage(
  collectedPaise: number,
  targetPaise: number
): number {
  if (!targetPaise || targetPaise <= 0) return 0;
  const percentage = (collectedPaise / targetPaise) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage)));
}
