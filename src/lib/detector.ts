import type { Technology } from './types';

interface Rule {
  name: string;
  categories: string[];
  website?: string;
  cpe?: string;
  html?: RegExp | RegExp[];
  scripts?: RegExp | RegExp[];
  headers?: Record<string, RegExp | string>;
  meta?: Record<string, RegExp | string>;
  cookies?: Record<string, RegExp | string>;
  js?: Record<string, RegExp | string | boolean>;
  url?: RegExp | RegExp[];
  version?: {
    from?: 'html' | 'script' | 'header' | 'meta' | 'cookie';
    pattern: RegExp;
    group?: number;
  }[];
  confidence?: number;
}

const RULES: Rule[] = [
  // Web Servers
  {
    name: 'Nginx',
    categories: ['Web servers'],
    website: 'https://nginx.org',
    cpe: 'cpe:2.3:a:f5:nginx',
    headers: { server: /nginx/i },
    version: [{ from: 'header', pattern: /nginx\/([\d.]+)/i }],
  },
  {
    name: 'Apache HTTP Server',
    categories: ['Web servers'],
    website: 'https://httpd.apache.org',
    cpe: 'cpe:2.3:a:apache:http_server',
    headers: { server: /Apache/i },
    version: [{ from: 'header', pattern: /Apache\/([\d.]+)/i }],
  },
  {
    name: 'Microsoft IIS',
    categories: ['Web servers'],
    website: 'https://www.iis.net',
    cpe: 'cpe:2.3:a:microsoft:internet_information_services',
    headers: { server: /Microsoft-IIS/i },
    version: [{ from: 'header', pattern: /Microsoft-IIS\/([\d.]+)/i }],
  },
  {
    name: 'LiteSpeed',
    categories: ['Web servers'],
    headers: { server: /LiteSpeed/i },
  },

  // CMS
  {
    name: 'WordPress',
    categories: ['CMS', 'Blogs'],
    website: 'https://wordpress.org',
    cpe: 'cpe:2.3:a:wordpress:wordpress',
    html: [/wp-content\//i, /wp-includes\//i, /<meta[^>]+name=["']generator["'][^>]+WordPress/i],
    meta: { generator: /WordPress/i },
    scripts: [/wp-includes\/js\//i, /wp-emoji-release/i],
    version: [
      { from: 'meta', pattern: /WordPress\s+([\d.]+)/i },
      { from: 'html', pattern: /ver=([\d.]+)/i },
    ],
  },
  {
    name: 'Drupal',
    categories: ['CMS'],
    website: 'https://www.drupal.org',
    cpe: 'cpe:2.3:a:drupal:drupal',
    html: [/Drupal\.settings/i, /sites\/default\/files/i],
    meta: { generator: /Drupal/i },
    headers: { 'x-generator': /Drupal/i, 'x-drupal-cache': /.+/ },
    version: [{ from: 'meta', pattern: /Drupal\s+([\d.]+)/i }],
  },
  {
    name: 'Joomla',
    categories: ['CMS'],
    website: 'https://www.joomla.org',
    cpe: 'cpe:2.3:a:joomla:joomla',
    html: [/\/media\/jui\//i, /com_content/i],
    meta: { generator: /Joomla/i },
    version: [{ from: 'meta', pattern: /Joomla!\s*([\d.]+)/i }],
  },
  {
    name: 'Magento',
    categories: ['Ecommerce', 'CMS'],
    website: 'https://magento.com',
    cpe: 'cpe:2.3:a:magento:magento',
    html: [/Mage\.Cookies/i, /skin\/frontend\//i],
    cookies: { frontend: /.+/ },
  },
  {
    name: 'Shopify',
    categories: ['Ecommerce'],
    website: 'https://www.shopify.com',
    html: [/cdn\.shopify\.com/i, /Shopify\.theme/i],
    headers: { 'x-shopify-stage': /.+/ },
  },

  // JS Frameworks / Libraries
  {
    name: 'React',
    categories: ['JavaScript frameworks'],
    website: 'https://react.dev',
    html: [/data-reactroot/i, /data-reactid/i],
    js: { React: true, ReactDOM: true },
    scripts: [/react(-dom)?(\.min)?\.js/i, /react\.production\.min\.js/i],
  },
  {
    name: 'Next.js',
    categories: ['JavaScript frameworks', 'Web frameworks'],
    website: 'https://nextjs.org',
    html: [/__NEXT_DATA__/i, /_next\/static/i],
    headers: { 'x-powered-by': /Next\.js/i },
    version: [{ from: 'header', pattern: /Next\.js\s+([\d.]+)/i }],
  },
  {
    name: 'Vue.js',
    categories: ['JavaScript frameworks'],
    website: 'https://vuejs.org',
    html: [/data-v-[a-f0-9]+/i],
    js: { Vue: true },
    scripts: [/vue(\.min)?\.js/i, /vue\.runtime/i],
  },
  {
    name: 'Angular',
    categories: ['JavaScript frameworks'],
    website: 'https://angular.io',
    html: [/ng-version/i, /ng-app/i],
    js: { ng: true, angular: true },
    version: [{ from: 'html', pattern: /ng-version=["']([\d.]+)["']/i }],
  },
  {
    name: 'jQuery',
    categories: ['JavaScript libraries'],
    website: 'https://jquery.com',
    cpe: 'cpe:2.3:a:jquery:jquery',
    js: { jQuery: true, $: true },
    scripts: [/jquery[.-]?([\d.]+)?(\.min)?\.js/i],
    version: [
      { from: 'script', pattern: /jquery[.-]?([\d.]+)(\.min)?\.js/i },
      { from: 'html', pattern: /jquery[.-]?([\d.]+)(\.min)?\.js/i },
    ],
  },
  {
    name: 'Bootstrap',
    categories: ['UI frameworks'],
    website: 'https://getbootstrap.com',
    cpe: 'cpe:2.3:a:getbootstrap:bootstrap',
    html: [/bootstrap(\.min)?\.(css|js)/i],
    scripts: [/bootstrap(\.bundle)?(\.min)?\.js/i],
    version: [{ from: 'script', pattern: /bootstrap[.-]?([\d.]+)/i }],
  },

  // Backend / Languages
  {
    name: 'PHP',
    categories: ['Programming languages'],
    website: 'https://www.php.net',
    cpe: 'cpe:2.3:a:php:php',
    headers: { 'x-powered-by': /PHP/i },
    cookies: { PHPSESSID: /.+/ },
    version: [{ from: 'header', pattern: /PHP\/([\d.]+)/i }],
  },
  {
    name: 'ASP.NET',
    categories: ['Web frameworks'],
    website: 'https://dotnet.microsoft.com',
    cpe: 'cpe:2.3:a:microsoft:asp.net',
    headers: { 'x-aspnet-version': /.+/, 'x-powered-by': /ASP\.NET/i },
    cookies: { 'ASP.NET_SessionId': /.+/ },
  },
  {
    name: 'Express',
    categories: ['Web frameworks'],
    website: 'https://expressjs.com',
    headers: { 'x-powered-by': /Express/i },
  },
  {
    name: 'Laravel',
    categories: ['Web frameworks'],
    website: 'https://laravel.com',
    cookies: { laravel_session: /.+/ },
  },

  // CDN / Hosting
  {
    name: 'Google Analytics',
    categories: ['Analytics'],
    website: 'https://analytics.google.com',
    scripts: [/google-analytics\.com\/analytics\.js/i, /gtag\/js/i, /googletagmanager\.com/i],
  },
  {
    name: 'Cloudflare',
    categories: ['CDN', 'Security'],
    website: 'https://www.cloudflare.com',
    headers: { server: /cloudflare/i, 'cf-ray': /.+/ },
  },
  {
    name: 'Vercel',
    categories: ['PaaS'],
    headers: { server: /Vercel/i, 'x-vercel-id': /.+/ },
  },
  {
    name: 'Netlify',
    categories: ['PaaS'],
    headers: { server: /Netlify/i, 'x-nf-request-id': /.+/ },
  },
  {
    name: 'WooCommerce',
    categories: ['Ecommerce'],
    website: 'https://woocommerce.com',
    cpe: 'cpe:2.3:a:woocommerce:woocommerce',
    html: [/woocommerce/i, /wc-block/i],
  },
];

function matchAny(patterns: RegExp | RegExp[] | undefined, text: string): boolean {
  if (!patterns) return false;
  const arr = Array.isArray(patterns) ? patterns : [patterns];
  return arr.some((p) => p.test(text));
}

function extractVersion(
  rule: Rule,
  sources: {
    html: string;
    scripts: string[];
    headers: Record<string, string>;
    meta: Record<string, string>;
    cookies: Record<string, string>;
  }
): string | undefined {
  if (!rule.version) return undefined;
  for (const v of rule.version) {
    let text = '';
    if (v.from === 'html') text = sources.html;
    else if (v.from === 'script') text = sources.scripts.join('\n');
    else if (v.from === 'header')
      text = Object.entries(sources.headers)
        .map(([k, val]) => `${k}: ${val}`)
        .join('\n');
    else if (v.from === 'meta') text = Object.values(sources.meta).join('\n');
    else if (v.from === 'cookie')
      text = Object.entries(sources.cookies)
        .map(([k, val]) => `${k}=${val}`)
        .join('\n');
    else text = sources.html + sources.scripts.join('\n');

    const m = text.match(v.pattern);
    if (m) {
      const group = v.group ?? 1;
      return m[group]?.trim();
    }
  }
  return undefined;
}

export function detectTechnologies(input: {
  html: string;
  scripts: string[];
  headers: Record<string, string>;
  meta: Record<string, string>;
  cookies: Record<string, string>;
  url: string;
  globals?: Record<string, unknown>;
}): Technology[] {
  const results: Technology[] = [];
  const seen = new Set<string>();

  for (const rule of RULES) {
    let matched = false;
    let conf = rule.confidence ?? 80;

    if (rule.headers) {
      for (const [key, pattern] of Object.entries(rule.headers)) {
        const val = input.headers[key.toLowerCase()] || input.headers[key];
        if (val) {
          if (typeof pattern === 'string' ? val.includes(pattern) : pattern.test(val)) {
            matched = true;
            conf = Math.max(conf, 90);
          }
        }
      }
    }

    if (matchAny(rule.html, input.html)) matched = true;

    const scriptText = input.scripts.join('\n');
    if (matchAny(rule.scripts, scriptText)) matched = true;

    if (rule.meta) {
      for (const [key, pattern] of Object.entries(rule.meta)) {
        const val = input.meta[key.toLowerCase()] || input.meta[key];
        if (val && (typeof pattern === 'string' ? val.includes(pattern) : pattern.test(val))) {
          matched = true;
          conf = Math.max(conf, 95);
        }
      }
    }

    if (rule.cookies) {
      for (const [key, pattern] of Object.entries(rule.cookies)) {
        const val = input.cookies[key];
        if (val && (typeof pattern === 'string' ? true : pattern.test(val))) {
          matched = true;
        }
      }
    }

   if (rule.js && input.globals) {
  for (const [key, expected] of Object.entries(rule.js)) {
    if (key in input.globals) {
      if (
        expected === true ||
        (typeof expected !== 'boolean' &&
          expected instanceof RegExp &&
          expected.test(String(input.globals[key])))
      ) {
        matched = true;
        conf = Math.max(conf, 85);
      }
    }
  }
}
    if (matchAny(rule.url, input.url)) matched = true;

    if (matched && !seen.has(rule.name)) {
      seen.add(rule.name);
      const version = extractVersion(rule, input);
      results.push({
        name: rule.name,
        version,
        confidence: conf,
        categories: rule.categories,
        website: rule.website,
        cpe: rule.cpe,
      });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

export function buildExploitLinks(tech: Technology) {
  const q = encodeURIComponent(tech.version ? `${tech.name} ${tech.version}` : tech.name);
  const nameQ = encodeURIComponent(tech.name);
  return [
    {
      source: 'Exploit-DB',
      url: `https://www.exploit-db.com/search?q=${q}`,
      label: 'Search Exploit-DB',
    },
    {
      source: 'Rapid7',
      url: `https://www.rapid7.com/db/?q=${q}&type=nexpose`,
      label: 'Rapid7 Vulnerability DB',
    },
    {
      source: 'NVD',
      url: `https://nvd.nist.gov/vuln/search/results?form_type=Basic&results_type=overview&query=${q}&search_type=all`,
      label: 'NVD Search',
    },
    {
      source: 'CVE Details',
      url: `https://www.cvedetails.com/google-search-results.php?q=${q}`,
      label: 'CVE Details',
    },
    {
      source: 'Packet Storm',
      url: `https://packetstormsecurity.com/search/?q=${nameQ}`,
      label: 'Packet Storm',
    },
    {
      source: 'GitHub PoCs',
      url: `https://github.com/search?q=${q}+CVE+OR+exploit+OR+poc&type=repositories`,
      label: 'GitHub (PoC / Exploit)',
    },
  ];
}