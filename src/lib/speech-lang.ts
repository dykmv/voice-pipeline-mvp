/**
 * Multilingual speech recognition helper.
 * Priority: browser language → fallback list (en, ru, el).
 */

const SUPPORTED_LANGS = ["en-US", "ru-RU", "el-GR"]

/** Normalize "ru" → "ru-RU", "en" → "en-US", etc. */
function normalizeLang(lang: string): string | null {
  const lower = lang.toLowerCase()
  return SUPPORTED_LANGS.find((s) => s.toLowerCase().startsWith(lower.slice(0, 2))) || null
}

/** Get ordered language list: browser prefs first, then remaining supported langs. */
export function getLanguagePriority(): string[] {
  const browserLangs = (navigator.languages || [navigator.language || "en-US"])
    .map(normalizeLang)
    .filter((l): l is string => l !== null)

  // Deduplicate, keep order
  const seen = new Set<string>()
  const result: string[] = []
  for (const lang of [...browserLangs, ...SUPPORTED_LANGS]) {
    if (!seen.has(lang)) {
      seen.add(lang)
      result.push(lang)
    }
  }
  return result
}

export const MIN_CONFIDENCE = 0.4
