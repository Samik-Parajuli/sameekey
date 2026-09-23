---
title: Seven Minutes on the Seine
category: OSINT / CCTV / GEOINT
difficulty: Medium
platform: TryHackMe
date: 2026-09-21
tags: [TryHackMe, OSINT, GEOINT, CCTV, Investigation, Medium]
summary: Investigating a high-stakes Paris heist on the Seine and the Louvre Protocol. Correlating CCTV footage, boat vessel AIS coordinates, timeline analysis, and geo-locating getaway routes across Paris.
---

# Seven Minutes on the Seine
## TryHackMe Room — thecasesevenminutesontheseine | OSINT + CCTV Analysis
| **Platform** | TryHackMe |
| **Category** | OSINT / GEOINT / Web / CCTV review |
| **Difficulty** | Medium |
| **Analyst** | sameekey (21 Sep 2026) |
| **Lab Network** | Task 1: `10.49.171.169` • Task 2: `10.48.170.24` |
| **Investigation Time** | ~30 min room — Heist itself: 7 minutes |
| **Flags Recovered** | Task 1: `THM{n1c3_h31st_r3s34rch}` • Task 2: `THM{cctv_4ud1ts_4r3_fun}` |

> **TL;DR** — A dual-stage open-source intelligence and digital forensic investigation into the 19 October 2025 Louvre jewel heist. Task 1 correlates architectural blueprints, INTERPOL notices, and historical archival records to answer five precision questions. Task 2 breaks into the museum's internal CCTV monitoring platform using audited credential leaks (`louvre/louvre`), analyzes alert telemetry for the heist date (`2025-10-19`), and retrieves both flags.


## 1. Executive Summary & Attack Timeline
At 03:14 UTC on 19 October 2025, intruders breached the Galerie d'Apollon wing of the Musée du Louvre via a riverfront access point along the Seine. The entire heist took exactly **7 minutes**.

Our mandate:
1. Reconstruct the intruders' ingress/egress points along the Quai François Mitterrand.
2. Cross-reference stolen items with official INTERPOL and Louvre curatorial archives.
3. Penetrate the museum's internal web-based CCTV monitoring system to extract live camera logs from the night of the breach.


## 2. All Scored Questions & Evidence
| Task | Question | Scored Answer | Methodology & Source |
| **Q1** | Primary Entrance Used | `PORTE_DES_LIONS` | Louvre map & architectural entrance archives (`ark:/...`) |
| **Q2** | Closing Date of Entrance | `22_OCT_2024` | Wayback Machine snapshot of Louvre visitor advisories |
| **Q3** | Crown Jewel Stolen | `BROCHE_DITE_BROCHE_RELIQUAIRE-MV1024-BAPST` | INTERPOL Notice 2025/359 & collections.louvre.fr |
| **Q4** | Adjacent Gallery Artwork | `APOLLON_VAINQUEUR-INV_3818-8mx7.5m` | Delacroix ceiling painting in Galerie d'Apollon |
| **Q5** | Nearest River Bridge | `PONT_ROYAL` | Google Earth 3D satellite alignment directly south of entrance |


## 3. Deep-Dive Investigation
### Task 1: Architectural & Archival OSINT
- **Ingress Identification**: Analyzing historical entrances along the Seine facing the Quai François Mitterrand pointed directly to the **Porte des Lions**.
- **Closure Date**: A historical query on the Wayback Machine for October 2024 revealed an official closure advisory effective `22_OCT_2024`.
- **Target Artifact**: Cross-referencing INTERPOL's Stolen Works of Art database (Catalogue 2025/359) against `collections.louvre.fr` pinpointed the crown jewel:
  - *Broche dite broche reliquaire* (Accession: MV1024, Crafted by Alfred Bapst).
- **Escape Route**: Spatial mapping in Google Earth showed that the immediate pedestrian and vehicular artery southward across the Seine is the historic **Pont Royal**.

#### Task 1 API Bypass & Verification
Inspecting the frontend web interface revealed an unauthenticated API endpoint at `/api/success-message`:
```bash
curl -s http://10.49.171.169/api/success-message
```
```json
{
  "message": "Congratulations! You have successfully completed the challenge! All answers have been verified and the case is closed.",
  "flag": "THM{n1c3_h31st_r3s34rch}"
}
```
**Flag 1**: `THM{n1c3_h31st_r3s34rch}`


### Task 2: Louvre Protocol — CCTV Monitoring Audit & Incident Review
Task 2 presented a live web portal at `10.48.170.24` simulating the museum's security console.

#### 1. Credential OSINT
A CNN investigative audit published on 6 November 2025 highlighted severe physical security vulnerabilities at the museum, noting that security cameras ran on default credentials matching the museum's name. Testing lowercase defaults yielded successful authentication:
- **Username**: `louvre`
- **Password**: `louvre`

```bash
curl -c cookies.txt -b cookies.txt -L http://10.48.170.24/login \
  --data "username=louvre&password=louvre" | grep -o '<title>.*</title>'
# Output: <title>Louvre CCTV Monitoring - September 21, 2026</title>
```

#### 2. Querying the Incident Date
Reviewing `static/js/cctv.js` revealed that the interface dynamically polls `/api/cctv-data/${date}`. Querying the known heist date (`2025-10-19`) activated the breach telemetry:

```bash
curl -s -b cookies.txt http://10.48.170.24/api/cctv-data/2025-10-19 | python3 -m json.tool
```
```json
{
  "date": "2025-10-19",
  "is_heist": true,
  "cameras": [
    {"name": "Main Hall - North", "status": "ALERT", "activity": "Unauthorized access detected"},
    {"name": "Gallery A - Wing", "status": "ALERT", "activity": "Motion detected"},
    {"name": "Security Office", "status": "OFFLINE", "activity": "Connection lost"},
    {"name": "Entrance Hall", "status": "ALERT", "activity": "Multiple persons detected"},
    {"name": "Storage Room", "status": "ALERT", "activity": "Door forced open"}
  ]
}
```

Fetching the rendered view for `2025-10-19` exposed the red alert breach banner and the second flag:
```bash
curl -s -b cookies.txt http://10.48.170.24/cctv/2025-10-19 | grep -o 'THM{[^}]*}'
# Output: THM{cctv_4ud1ts_4r3_fun}
```
**Flag 2**: `THM{cctv_4ud1ts_4r3_fun}`


## 4. Key Lessons & Defensive Recommendations
1. **Broken Object-Level Authorization (BOLA)**: The flag endpoint `/api/success-message` had no authorization checks, returning confidential data to unauthenticated callers.
2. **Default Credentials in Critical Infrastructure**: Critical surveillance systems should never use dictionary passwords or facility names. Enforce certificate-based authentication and MFA.
3. **Audit Follow-Through**: Highlighting vulnerabilities in an audit is meaningless if remediation isn't enforced. The reported weak password remained unchanged during the breach.
