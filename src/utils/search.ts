/**
 * Calculates a fuzzy search match score between a target text and a query.
 * Higher scores represent better matches. Returns 0 if there is no match.
 */
export function fuzzyScore(text: string, query: string): number {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return 0;
  if (normalizedText.includes(normalizedQuery)) return 200 + normalizedQuery.length;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const token of tokens) {
    if (normalizedText.includes(token)) score += 15;
  }

  let lastIndex = -1;
  for (const char of normalizedQuery) {
    lastIndex = normalizedText.indexOf(char, lastIndex + 1);
    if (lastIndex === -1) break;
    score += 1;
  }

  return score;
}

/**
 * Derives city and region from a Google Place address string.
 */
export function deriveAddressParts(address: string): { city: string; region: string } {
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  const city = parts.length > 0 ? parts[0] : 'Unknown';
  const region = parts.length > 1 ? parts[parts.length - 2] : 'Cameroon';
  return { city, region };
}
