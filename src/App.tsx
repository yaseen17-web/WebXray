import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import {
  ShieldAlert,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Globe,
  Bug,
  Search,
  Shield,
  Zap,
} from 'lucide-react'
import { detectTechnologies, buildExploitLinks } from './lib/detector'
import { fetchCVEsForTech, getCVESearchUrl } from './lib/cve'
import type { Technology, CVEInfo, DetectionResult } from './lib/types'

interface TechWithCVEs extends Technology {
  cves?: CVEInfo[]
  loadingCves?: boolean
  exploitLinks?: ReturnType<typeof buildExploitLinks>
}

export default function App() {
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [techs, setTechs] = useState<TechWithCVEs[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [pageUrl, setPageUrl] = useState('')

  const scan = useCallback(async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setTechs([])

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id || !tab.url) throw new Error('No active tab')
      if (
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('about:')
      ) {
        throw new Error('Cannot scan browser internal pages')
      }

      setPageUrl(tab.url)

      const headerResp = await chrome.runtime.sendMessage({
        type: 'GET_HEADERS',
        tabId: tab.id,
      })
      const headers: Record<string, string> = headerResp?.headers || {}

      let pageData: any
      try {
        const resp = await chrome.tabs.sendMessage(tab.id, {
          type: 'COLLECT_PAGE_DATA',
        })
        if (!resp?.ok) throw new Error(resp?.error || 'Content script failed')
        pageData = resp.data
      } catch {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js'],
        })
        await new Promise((r) => setTimeout(r, 300))
        const resp = await chrome.tabs.sendMessage(tab.id, {
          type: 'COLLECT_PAGE_DATA',
        })
        if (!resp?.ok)
          throw new Error(resp?.error || 'Content script failed after inject')
        pageData = resp.data
      }

      const detected = detectTechnologies({
        html: pageData.html || '',
        scripts: pageData.scripts || [],
        headers,
        meta: pageData.meta || {},
        cookies: pageData.cookies || {},
        url: pageData.url || tab.url,
        globals: pageData.globals || {},
      })

      const detection: DetectionResult = {
        url: tab.url,
        technologies: detected,
        headers,
        scannedAt: new Date().toISOString(),
      }
      setResult(detection)

      const withLinks: TechWithCVEs[] = detected.map((t) => ({
        ...t,
        exploitLinks: buildExploitLinks(t),
        loadingCves: true,
        cves: [],
      }))
      setTechs(withLinks)

      const enriched = await Promise.all(
        withLinks.map(async (t, idx) => {
          await new Promise((r) => setTimeout(r, idx * 300))
          const cves = await fetchCVEsForTech(t, 5)
          return { ...t, cves, loadingCves: false }
        })
      )
      setTechs(enriched)
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    scan()
  }, [scan])

  const toggle = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const severityColor = (s?: string) => {
    if (!s) return '#94a3b8'
    const u = s.toUpperCase()
    if (u === 'CRITICAL') return '#ef4444'
    if (u === 'HIGH') return '#f97316'
    if (u === 'MEDIUM') return '#eab308'
    if (u === 'LOW') return '#22c55e'
    return '#94a3b8'
  }

  const getRiskBorder = (t: TechWithCVEs) => {
    const count = t.cves?.length || 0
    if (count >= 3) return '#ef4444'
    if (count >= 1) return '#f97316'
    return '#334155'
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>
            <ShieldAlert size={18} color="#22d3ee" />
          </div>
          <div>
            <h1 style={styles.title}>WebXray</h1>
            <p style={styles.subtitle}>SECURITY SCANNER</p>
          </div>
        </div>
        <button
          onClick={scan}
          disabled={loading}
          style={{
            ...styles.scanBtn,
            opacity: loading ? 0.65 : 1,
          }}
        >
          {loading ? <Loader2 size={14} className="spin" /> : <Zap size={14} />}
          {loading ? 'Scanning…' : 'Scan'}
        </button>
      </header>

      {/* URL bar */}
      {pageUrl && (
        <div style={styles.urlBar}>
          <Globe size={12} color="#22d3ee" />
          <span style={styles.urlText} title={pageUrl}>
            {pageUrl.replace(/^https?:\/\//, '')}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.error}>
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && !result && (
        <div style={styles.center}>
          <div style={styles.loaderRing}>
            <Loader2 size={28} className="spin" color="#22d3ee" />
          </div>
          <p style={styles.loadingText}>Scanning target…</p>
          <p style={styles.loadingSub}>Detecting stack & vulnerabilities</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          <div style={styles.stats}>
            <div style={styles.statsLeft}>
              <CheckCircle2 size={14} color="#22c55e" />
              <span style={styles.statsText}>
                {techs.length} technolog{techs.length === 1 ? 'y' : 'ies'} detected
              </span>
            </div>
            <span style={styles.time}>
              {new Date(result.scannedAt).toLocaleTimeString()}
            </span>
          </div>

          {techs.length === 0 && (
            <div style={styles.center}>
              <Shield size={32} color="#334155" />
              <p style={styles.emptyTitle}>No technologies found</p>
              <p style={styles.emptySub}>Try another target</p>
            </div>
          )}

          <div style={styles.list}>
            {techs.map((t) => {
              const isOpen = expanded[t.name]
              const hasCves = (t.cves?.length || 0) > 0
              const riskColor = getRiskBorder(t)

              return (
                <div
                  key={t.name}
                  style={{
                    ...styles.card,
                    borderLeft: `3px solid ${riskColor}`,
                  }}
                >
                  <button
                    style={styles.cardHeader}
                    onClick={() => toggle(t.name)}
                  >
                    <div style={styles.cardLeft}>
                      <div style={styles.techMain}>
                        <span style={styles.techName}>{t.name}</span>
                        {t.version && (
                          <span style={styles.version}>v{t.version}</span>
                        )}
                      </div>
                      <div style={styles.metaRow}>
                        <span style={styles.confidence}>{t.confidence}% match</span>
                        {t.categories.slice(0, 2).map((c) => (
                          <span key={c} style={styles.cat}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={styles.cardRight}>
                      {t.loadingCves && (
                        <Loader2 size={13} className="spin" color="#64748b" />
                      )}
                      {hasCves && (
                        <span
                          style={{
                            ...styles.cveBadge,
                            background:
                              (t.cves?.length || 0) >= 3
                                ? '#7f1d1d'
                                : '#9a3412',
                          }}
                        >
                          <Bug size={10} />
                          {t.cves!.length} CVE
                        </span>
                      )}
                      {isOpen ? (
                        <ChevronUp size={16} color="#94a3b8" />
                      ) : (
                        <ChevronDown size={16} color="#94a3b8" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div style={styles.details}>
                      {/* CVEs */}
                      <div style={styles.section}>
                        <div style={styles.sectionTitle}>
                          <Bug size={12} color="#f87171" />
                          Vulnerabilities
                        </div>

                        {t.loadingCves && (
                          <p style={styles.muted}>Fetching CVE data…</p>
                        )}

                        {!t.loadingCves &&
                          (!t.cves || t.cves.length === 0) && (
                            <p style={styles.muted}>
                              No known CVEs found.{' '}
                              <a
                                href={getCVESearchUrl(t)}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.link}
                              >
                                Search manually →
                              </a>
                            </p>
                          )}

                        {t.cves?.map((cve) => (
                          <div key={cve.id} style={styles.cveItem}>
                            <div style={styles.cveHead}>
                              <a
                                href={
                                  cve.references?.[0] ||
                                  `https://dbcve.org/cve/${cve.id}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                style={styles.cveId}
                              >
                                {cve.id}
                              </a>
                              {cve.severity && (
                                <span
                                  style={{
                                    ...styles.sev,
                                    background:
                                      severityColor(cve.severity) + '25',
                                    color: severityColor(cve.severity),
                                    border: `1px solid ${severityColor(
                                      cve.severity
                                    )}55`,
                                  }}
                                >
                                  {cve.severity}
                                  {cve.score != null ? ` ${cve.score}` : ''}
                                </span>
                              )}
                            </div>
                            <p style={styles.cveDesc}>{cve.description}</p>
                          </div>
                        ))}
                      </div>

                      {/* Exploit links */}
                      <div style={styles.section}>
                        <div style={styles.sectionTitle}>
                          <Search size={12} color="#22d3ee" />
                          Exploit Sources
                        </div>
                        <div style={styles.linkGrid}>
                          {t.exploitLinks?.map((l) => (
                            <a
                              key={l.source}
                              href={l.url}
                              target="_blank"
                              rel="noreferrer"
                              style={styles.linkBtn}
                            >
                              <ExternalLink size={11} />
                              {l.label}
                            </a>
                          ))}
                        </div>
                      </div>

                      {t.website && (
                        <a
                          href={t.website}
                          target="_blank"
                          rel="noreferrer"
                          style={{ ...styles.linkBtn, marginTop: 6 }}
                        >
                          Official documentation
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      <footer style={styles.footer}>
        WebXray · authorized testing only
      </footer>

      <style>{`
        .spin { animation: spin 0.75s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  container: {
    background: '#020617',
    color: '#e2e8f0',
    minHeight: '100%',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
    borderBottom: '1px solid #1e293b',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: 'linear-gradient(135deg, #083344 0%, #0e7490 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #22d3ee44',
    boxShadow: '0 0 12px #22d3ee22',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.03em',
    color: '#f1f5f9',
  },
  subtitle: {
    fontSize: 9,
    color: '#22d3ee',
    margin: 0,
    marginTop: 2,
    letterSpacing: '0.12em',
    fontWeight: 600,
  },
  scanBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    color: '#020617',
    border: 'none',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 0 16px #06b6d433',
  },
  urlBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 16px',
    background: '#0f172a',
    borderBottom: '1px solid #1e293b',
    fontSize: 11,
    color: '#94a3b8',
  },
  urlText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 340,
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    margin: 12,
    padding: '11px 13px',
    background: '#450a0a66',
    border: '1px solid #7f1d1d',
    borderRadius: 9,
    color: '#fca5a5',
    fontSize: 12,
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '52px 20px',
    gap: 6,
  },
  loaderRing: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#08334433',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #22d3ee33',
    marginBottom: 8,
  },
  loadingText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: 600,
    margin: 0,
  },
  loadingSub: {
    color: '#64748b',
    fontSize: 12,
    margin: 0,
  },
  emptyTitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 600,
    marginTop: 10,
  },
  emptySub: {
    color: '#475569',
    fontSize: 12,
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '11px 16px',
  },
  statsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  },
  statsText: {
    fontSize: 12.5,
    color: '#cbd5e1',
    fontWeight: 500,
  },
  time: {
    color: '#64748b',
    fontSize: 11,
  },
  list: {
    padding: '0 12px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 9,
  },
  card: {
    background: '#0f172a',
    borderRadius: 10,
    border: '1px solid #1e293b',
    overflow: 'hidden',
  },
  cardHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '13px 14px',
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
  },
  cardLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    flex: 1,
  },
  techMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  techName: {
    fontWeight: 700,
    fontSize: 14,
    color: '#f8fafc',
  },
  version: {
    fontSize: 11,
    background: '#083344',
    color: '#67e8f9',
    padding: '2px 8px',
    borderRadius: 5,
    fontWeight: 600,
    border: '1px solid #155e75',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  confidence: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 500,
  },
  cat: {
    fontSize: 10,
    background: '#1e293b',
    color: '#94a3b8',
    padding: '2px 7px',
    borderRadius: 4,
  },
  cardRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
    marginTop: 2,
  },
  cveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    padding: '3px 8px',
    borderRadius: 5,
    color: '#fecaca',
    fontWeight: 700,
  },
  details: {
    padding: '0 14px 14px',
    borderTop: '1px solid #1e293b',
    background: '#02061788',
  },
  section: {
    marginTop: 13,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    fontWeight: 700,
    color: '#94a3b8',
    marginBottom: 9,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  muted: {
    fontSize: 12,
    color: '#64748b',
  },
  link: {
    color: '#22d3ee',
  },
  cveItem: {
    background: '#020617',
    borderRadius: 8,
    padding: '10px 12px',
    marginBottom: 8,
    border: '1px solid #1e293b',
  },
  cveHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  cveId: {
    fontSize: 12.5,
    fontWeight: 700,
    color: '#22d3ee',
    textDecoration: 'none',
  },
  sev: {
    fontSize: 10,
    padding: '2px 7px',
    borderRadius: 4,
    fontWeight: 700,
  },
  cveDesc: {
    fontSize: 11.5,
    color: '#cbd5e1',
    lineHeight: 1.5,
    margin: 0,
  },
  linkGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  linkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    background: '#1e293b',
    color: '#e2e8f0',
    padding: '6px 10px',
    borderRadius: 6,
    textDecoration: 'none',
    border: '1px solid #334155',
    fontWeight: 500,
  },
  footer: {
    textAlign: 'center',
    fontSize: 10,
    color: '#475569',
    padding: '12px 0 14px',
    letterSpacing: '0.02em',
  },
}