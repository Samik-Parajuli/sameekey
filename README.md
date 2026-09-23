# Sameek Parajuli // Tactical Cybersecurity Portfolio (v3.0.0)

Elite cyberpunk / terminal portfolio for offensive security, penetration testing, and web exploitation research.

Hosted statically on GitHub Pages with zero external backend dependencies.

```
Portfoilioshit/
├── index.html                 # Tactical HUD mission control dashboard
├── style.css                  # Cyberpunk styling & 5-theme palette engine
├── script.js                  # CLI shell, audio synth, cyber toolkit, in-page reader
├── build.js                   # Compiles 31 writeups -> HTML pages + writeups-data.js
├── package.json               # Node build scripts
├── templates/
│   └── writeup-template.html  # Standalone writeup page template with PDF download
├── tools/
│   ├── convert_writeups.py    # Raw PDF/ODT to themed markdown converter
│   └── curate_meta.py         # Front-matter curator for all 31 writeups
├── writeups/
│   ├── *.md                   # 31 structured markdown walkthroughs
│   ├── *.html                 # 31 compiled standalone HTML pages
│   ├── *.pdf                  # Original verified PDF reports & walkthroughs
│   └── writeups-data.js       # Live search index and metadata
├── Images/
│   ├── profile.png            # Avatar
│   ├── thm_hacker_holidays_cert.png # Certificate of Completion
│   └── sapphire_league_rank1.png    # Verified Rank #1 Leaderboard Screenshot
└── RESUME/
    └── Samik_Parajuli_CV.pdf  # Up-to-date Curriculum Vitae
```

---

## Key Features

1. **31 Comprehensive Security Walkthroughs**:
   - Web App Exploitation (SQLi, Blind XSS, TOCTOU Race Conditions, Zip Slip RCE, Auth Bypass)
   - Active Directory & Privilege Escalation (Evil-WinRM, WMI Persistence, BITS jobs, Token Manipulation)
   - Cryptography & Steganography (Zero-width steg, SAS Token privilege auditing, Cipher decryption)
   - Network Security & Boot2Root (Nmap NSE, Evil-WinRM, RDP pivoting, iptables bypass)
   - Dual-view layout: **Card Grid View** vs **Compact Terminal List View** (`ls -la` style)
   - **In-Page Quick-Reader Modal**: Read any writeup without leaving the page, with copyable code snippets
   - **Direct PDF Downloads**: Download original verified reports for 28+ writeups!

2. **Verified Accreditations & Competitive Proof**:
   - **TryHackMe Hacker Holidays Certificate of Completion** (`THM-CVMBUOSYUB`) — 100% completion of the Byte Lotus 14-day rooting challenge.
   - **Sapphire League #1 Leaderboard Champion** — 480 points verified screenshot.
   - **TryBankMe External Black-Box Pentest Report** — Client-ready banking platform security assessment.

3. **Interactive Kali Linux CLI Terminal Modal**:
   - Open anytime with `` ` `` (backtick), `/`, or clicking `[CLI]` in the HUD.
   - Commands: `help`, `whoami`, `skills`, `ls`, `cat <slug>`, `certs`, `report`, `crack <hash>`, `nmap localhost`, `matrix`, `sfx on/off`, `theme <name>`, `clear`.
   - Command history (`Up`/`Down`) and tab-completion.

4. **Interactive Cyber Toolkit**:
   - **Multi-Decoder / Encoder**: Base64, Hexadecimal, URL, ROT13 with live conversion.
   - **Hash Identifier**: Instant signature detection (MD5, SHA-1, SHA-256, NTLM, bcrypt, etc.).
   - **Password Entropy Meter**: Character diversity, entropy bits, and estimated crack-time calculation.

5. **Web Audio API Procedural Synthesizer**:
   - Zero external audio files, 100% offline, procedural sound effects for hover, clicks, typing, and success chimes.
   - One-click mute/unmute toggle in the navbar or via hotkey `S`.

6. **5 Cyberpunk Themes**:
   - Blood Red / Kali Ops (Default)
   - Matrix Green
   - Cyber Cyan
   - Hacker Amber CRT
   - Stealth Light

---

## Build & Run

```bash
# Build writeups data & HTML pages
npm run build

# Watch for writeup updates
npm run watch

# Local dev server
npm run serve
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|:---:|---|
| `` ` `` or `~` | Toggle interactive Kali Linux CLI Terminal |
| `/` | Focus live writeup grep / search |
| `T` | Cycle through 5 cyberpunk color themes |
| `S` | Toggle procedural cyber sound effects on/off |
| `Esc` | Close any active modal (CLI, Reader, Lightbox) |