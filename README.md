# WebXray

**Browser extension for pentesters** — detect web technologies, extract versions, surface related CVEs, and jump to exploit / advisory sources.

Like Wappalyzer, but focused on security testing.

![Chrome](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)

---

## Features

- **Technology fingerprinting** — detects CMS, frameworks, libraries, servers, CDNs, and more
- **Version extraction** — pulls versions where possible (WordPress, jQuery, Nginx, Apache, PHP, Next.js, etc.)
- **CVE lookup** — fetches related vulnerabilities from [dbcve.org](https://dbcve.org) (no API key required)
- **Exploit search links** — one-click search on:
  - Exploit-DB
  - Rapid7
  - NVD
  - CVE Details
  - Packet Storm
  - GitHub (PoCs / exploits)
- **Clean dark UI** — risk indicators, severity badges, expandable details
- **Manifest V3** — modern Chrome / Edge extension

---

## Install (Load Unpacked)

1. Download or clone this repository
2. Build the extension (see below) **or** use a pre-built `dist` if available
3. Open Chrome / Edge and go to `chrome://extensions`
4. Enable **Developer mode**
5. Click **Load unpacked**
6. Select the `dist` folder

Pin the extension and open any website to scan.

---

## Build from Source

### Requirements
- Node.js 20+
- npm

### Steps

```bash
# Clone
git clone https://github.com/yaseen17-web/WebXray.git
cd WebXray

# Install dependencies
npm install

# Build
npm run build
