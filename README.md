# WebXray

**Browser extension for pentesters** — detect web technologies, extract versions, surface related CVEs, and jump to exploit / advisory sources.

Focused on security testing.

---

## Easy Install (No Build Required)

1. Go to the latest release:  
   **[Download WebXray v1.0.0](https://github.com/yaseen17-web/WebXray/releases/tag/v1.0.0)**
2. Download **`WebXray-v1.0.0.zip`**
3. Extract the zip to any folder
4. Open Chrome → `chrome://extensions`
5. Enable **Developer mode** (top right)
6. Click **Load unpacked**
7. Select the extracted folder

Done. No Node.js or build step needed.

---

## Features

- **Technology fingerprinting** — CMS, frameworks, libraries, servers, CDNs, and more
- **Version extraction** — WordPress, jQuery, Nginx, Apache, PHP, Next.js, etc.
- **CVE lookup** — related vulnerabilities via [dbcve.org](https://dbcve.org)
- **Exploit search links** — Exploit-DB, Rapid7, NVD, CVE Details, Packet Storm, GitHub PoCs
- **Clean dark UI** — risk indicators and severity badges
- **Manifest V3** — works on Chrome and Edge

---

## Build from Source (Optional)

```bash
git clone https://github.com/yaseen17-web/WebXray.git
cd WebXray
npm install
npm run build
