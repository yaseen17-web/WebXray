import type { Technology, CVEInfo } from './types';

/**
 * Fetch CVEs using dbcve.org (free, no API key, CORS enabled)
 */
export async function fetchCVEsForTech(
  tech: Technology,
  maxResults = 6
): Promise<CVEInfo[]> {
  try {
    const query = tech.version
      ? `${tech.name} ${tech.version}`
      : tech.name;

    const url = `https://dbcve.org/api/v1/cves/?q=${encodeURIComponent(query)}&limit=${maxResults}`;

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      console.warn('dbcve.org request failed', res.status);
      return [];
    }

    const json = await res.json();

    // Real response shape: { meta: {...}, data: [ ... ] }
    const items = json.data || [];

    return items.slice(0, maxResults).map((item: any): CVEInfo => {
      return {
        id: item.cve_id || 'Unknown',
        description: (item.description || 'No description available').slice(0, 280) +
          ((item.description?.length || 0) > 280 ? '…' : ''),
        severity: item.severity || undefined,
        score: item.cvss ?? undefined,
        published: item.published || undefined,
        references: item.url ? [item.url] : [],
      };
    });
  } catch (err) {
    console.warn('CVE fetch error', err);
    return [];
  }
}

export function getCVESearchUrl(tech: Technology): string {
  const q = encodeURIComponent(
    tech.version ? `${tech.name} ${tech.version}` : tech.name
  );
  return `https://nvd.nist.gov/vuln/search/results?form_type=Basic&results_type=overview&query=${q}&search_type=all`;
}