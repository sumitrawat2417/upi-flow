import type { SplitResult } from '../../types';

/**
 * Generates a short random ID like "A72K"
 */
export function generateShortId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function generateQRId(): string {
  return `QR-${generateShortId()}`;
}

export function generateSessionId(): string {
  return `#${generateShortId()}`;
}

/**
 * Auto split: fills with `threshold` amounts, remainder last.
 */
export function autoSplit(total: number, threshold: number): number[] {
  if (total <= threshold) return [total];
  const chunks: number[] = [];
  let remaining = total;
  while (remaining > threshold) {
    chunks.push(threshold);
    remaining -= threshold;
  }
  if (remaining > 0) chunks.push(remaining);
  return chunks;
}

/**
 * Equal split: divide as evenly as possible.
 */
export function equalSplit(total: number, count: number): number[] {
  if (count <= 1) return [total];
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  const chunks = Array(count).fill(base);
  if (remainder > 0) chunks[chunks.length - 1] += remainder;
  return chunks;
}

/**
 * Main split resolver — returns all available strategies.
 */
export function computeSplits(total: number, threshold: number): SplitResult[] {
  const results: SplitResult[] = [];

  // Auto (threshold-based)
  const autoAmounts = autoSplit(total, threshold);
  results.push({ amounts: autoAmounts, mode: 'auto' });

  // Equal splits (2, 3 parts) — only if total > threshold
  if (total > threshold) {
    for (const parts of [2, 3]) {
      const amounts = equalSplit(total, parts);
      const isDuplicate = results.some(r => JSON.stringify(r.amounts) === JSON.stringify(amounts));
      if (!isDuplicate) {
        results.push({ amounts, mode: 'equal' });
      }
    }
  }

  return results;
}

/**
 * Validates that a custom split adds up to the total.
 */
export function validateCustomSplit(amounts: number[], total: number): boolean {
  return amounts.every(a => a > 0) && amounts.reduce((a, b) => a + b, 0) === total;
}

/**
 * Format amount as Indian locale string (no decimals for whole numbers)
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString('en-IN');
}
