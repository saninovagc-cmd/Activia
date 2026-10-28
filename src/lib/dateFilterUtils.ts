/**
 * Utilitaires pour le filtrage par Jour, Mois, Année sur les registres ACTIVIA
 */

export interface DateFilterCriteria {
  year: string;       // 'all' ou '2026', '2025', etc.
  month: string;      // 'all' ou '01', '02', ..., '12'
  exactDate: string;  // '' ou 'YYYY-MM-DD'
}

/**
 * Normalise une chaîne de date en composants { year, month, day }
 */
export function parseDateComponents(dateStr?: string | null): { year: string; month: string; day: string } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed || trimmed === '-' || trimmed === 'N/A') return null;

  // Format YYYY-MM-DD ou ISO
  const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    return {
      year: isoMatch[1],
      month: isoMatch[2].padStart(2, '0'),
      day: isoMatch[3].padStart(2, '0'),
    };
  }

  // Format DD/MM/YYYY ou DD-MM-YYYY
  const frMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (frMatch) {
    return {
      year: frMatch[3],
      month: frMatch[2].padStart(2, '0'),
      day: frMatch[1].padStart(2, '0'),
    };
  }

  // Fallback via Date.parse
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return {
      year: parsed.getFullYear().toString(),
      month: (parsed.getMonth() + 1).toString().padStart(2, '0'),
      day: parsed.getDate().toString().padStart(2, '0'),
    };
  }

  return null;
}

/**
 * Vérifie si une date correspond aux critères de filtre (Jour, Mois, Année)
 */
export function matchesDateFilter(dateStr?: string | null, criteria?: Partial<DateFilterCriteria>): boolean {
  if (!criteria) return true;
  const { year = 'all', month = 'all', exactDate = '' } = criteria;

  // Si aucun filtre n'est actif, tout est accepté
  if (year === 'all' && month === 'all' && !exactDate) {
    return true;
  }

  const comp = parseDateComponents(dateStr);
  if (!comp) return false;

  // Filtre par date exacte YYYY-MM-DD
  if (exactDate) {
    const exactComp = parseDateComponents(exactDate);
    if (exactComp) {
      if (
        comp.year !== exactComp.year ||
        comp.month !== exactComp.month ||
        comp.day !== exactComp.day
      ) {
        return false;
      }
    }
  }

  // Filtre par année
  if (year !== 'all') {
    if (comp.year !== year) return false;
  }

  // Filtre par mois
  if (month !== 'all') {
    if (comp.month !== month) return false;
  }

  return true;
}

/**
 * Extrait la liste des années uniques disponibles dans un ensemble d'éléments
 */
export function extractUniqueYears<T>(
  items: T[],
  getDateFn: (item: T) => string | undefined | null,
  fallbackYears = ['2026', '2025', '2024', '2023', '2022']
): string[] {
  const years = new Set<string>();
  items.forEach((item) => {
    const comp = parseDateComponents(getDateFn(item));
    if (comp && comp.year && comp.year.length === 4) {
      const yNum = parseInt(comp.year, 10);
      if (yNum >= 1990 && yNum <= 2035) {
        years.add(comp.year);
      }
    }
  });

  fallbackYears.forEach((y) => years.add(y));
  return Array.from(years).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
}
