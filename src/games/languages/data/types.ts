/** Languages spoken in one country. */
export interface CountryLanguages {
  /** Language codes meeting the 5% rule (first or everyday home language of at least ~5% of the population). */
  main: readonly string[];
  /** Well-known languages below the cut: excluded from the answer and from distractors. */
  minor?: readonly string[];
}
