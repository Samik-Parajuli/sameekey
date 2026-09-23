---
title: Have A Break
category: Web
difficulty: Easy
platform: TryHackMe
date: 2026-08-11
tags: [TryHackMe, Web, Easy]
summary: Quick enumeration on Have A Break, finding the weak spot in the application and exploiting it without overcomplicating things.
---

Case EC-2026-0847-CZ — ECTA Freight Crime Intelligence Division Cargo Theft Investigation Writeup — Nestlé / KITKAT Shipment (Italy → Poland) CZ Node — Final Investigative Report Date of report: 11 August 2026

## 1. Executive Summary
On 26 March 2026 a refrigerated HGV operated by TransEuro Logistics s.r.o. (Brno, CZ) departed a Nestlé production facility in Central Italy carrying 413,793 units of KITKAT confectionery (approx. 12 t) bound for Poland. The vehicle failed to complete scheduled check-ins en route and has not been located. Forensic analysis of the subpoenaed corporate records (Exhibit A, Exhibit B, and the TransEuro IT package) establishes that the theft was insider-facilitated: route-planning personnel leaked the operational file, and a late-working colleague anonymously reported the anomaly through a VPN-hosted journalist tip.

## 2. Answers (Overview)
# Question Answer 1 VPN service used to send the anonymous email Mullvad 2 Petrol station where the vehicle was last seen Kromęřížská 1281, 768 24 Hulín, Czechia 3 Suspicious action — route planning system, 25 Mar 2026 22:14:09 4 Employee ID of the anonymous email sender BR-0312 5 Employee ID responsible for leaking shipment detailsBR-0291 6 Leaker's full name Radovan Blšťák
## 3. Question 1 — VPN service used for the anonymous email
The message processor headers of exhibit_a.eml were read from bottom to top. The lowest ‘Received’ header exposes the real sending infrastructure:

```bash
Received: from [193.32.249.132] ([193.32.249.132])
    by smtp.gmail.com with ESMTPSA ... (TLS1_3)
    Thu, 27 Mar 2026 23:14:55 +0100 (CET)
```

WHOIS / IP-intelligence lookup for 193.32.249.132 returns ASN AS39351, netname NET-31173-193-32-249-0-24, owned by 31173 Services AB (Amsterdam, NL). 31173 Services AB is the hosting operator for Mullvad VPN exit nodes, which confirms the whistleblower anonymised the tip through the Mullvad service. Additional send metadata: the client used ‘K-9 Mail for Android’ (mobile), from GMail account notmyname2847@gmail.com.

## 4. Question 2 — Petrol station where the vehicle was last seen
Exhibit B (dashcam frame, timestamp 26.03.2026 22:31:07) shows a motorway service area on the D1 corridor. OCR of the image reveals:

```bash
• ORLEN branding on the building and price board
• Fuel board: Natural 95 — 36.90; Diesel; LPG 17.90
```

```bash
• Direction gantry: ‘Olomouc 27 km’ / ‘Brno 45 km’ (D1)
```

The briefing memo places the dashcam recovery near Hulín on the D1 corridor. Cross-referencing the D1 ORLEN station at that position identifies the site as Kromęřížská 1281, 768 24 Hulín, Czechia, an ORLEN (Benzina) station with 24h fuel and truck parking used as an overnight stop on the IT–PL corridor (consistent with the ORLEN service area referenced in the internal comms). The truck seen in the parking area at 22:31 on 26 March is consistent with the expected transit window after a morning departure from Central Italy.

## 5. Question 3 — Time of the suspicious action (25 March 2026)
Review of the subpoenaed access log (access_log.csv) for the night before departure (25 March 2026) reveals exactly one anomalous event — the only EXPORT action in the entire log, performed on the IT–PL route file at an odd hour:

```bash
2026-03-25, 22:14:09, BR-0291, ROUTE_IT_PL_Q1_2026.pdf, EXPORT
```

Exporting an operational route file at 22:14 the night before departure constitutes the ‘access to a file that had no reason to be touched at that hour’ described in Exhibit A. Answer: 22:14:09. Supporting anomaly: BR-0291 also received an AUTH_FAILED on the same file on 24 March at 07:11:03.

## 6. Question 4 — Employee ID of the anonymous email sender
The anonymous sender states they personally witnessed the irregular activity the night before departure. The access log shows BR-0312 (Dispatch Operator, Brno office) was genuinely working late on 25 March — editing DRIVER_SCHEDULE_WK13.xlsx at 23:41:17 — the same night BR-0291 performed the unusual export. BR-0312 therefore had direct visibility of the anomalous audit trail and, distrusting internal channels (a colleague had been compromised), reported it externally via Mullvad VPN using a mobile client (K-9 Mail for Android). Answer: BR-0312.

## 7. Question 5 & 6 — The leaker: employee ID and full name
Multiple corroborating indicators identify the leaker:

```bash
• EXPORT of ROUTE_IT_PL_Q1_2026.pdf on 2026-03-25 22:14:09 (access_log.csv)
• AUTH_FAILED on the same file on 2026-03-24 07:11:03 (access_log.csv)
• IT alert (BR-0255, 24 Mar): an external address kraliknovak09@gmail.com requested access
to the route-planning shared folder — blocked (comms_export.txt)
```

The personal GMail address kraliknovak09@gmail.com ties the account to the leaker. An account lookup (google-account OSINT) resolves the public profile attached to kraliknovak09@gmail.com to the name Radovan Blšťák, whose employee record (hometown Králice nad Oslavou) is consistent with the ‘Kralik’ element of the burner address — a classic personal-information opsec failure. Answer: employee ID BR-0291, name Radovan Blšťák.

## Appendix A — Evidence index
Source Detail Relevance ecta_memo.html.pdfCase EC-2026-0847-CZ; dashcam recovered near Hulín; transit corridor Route &geography of investigation exhibit_a.eml Send IP 193.32.249.132; K-9 Mail / Android; received 27 Mar 23:14 CET Sent via Mullvad VPN

exhibit_b.png ORLEN signage; Olomouc 27 km / Brno 45 km; 26.03.2026 22:31:07 Last sighting &mdash; ORLEN Hulín employees.csv BR-0291 = Route Planner, Králice nad Oslavou; BR-0312 = Dispatch Operator Personnel cross-reference access_log.csv 2026-03-25 22:14:09 BR-0291 EXPORT; 23:41:17 BR-0312 EDIT; 24 Mar AUTH_FAILED Anomalous access + witness comms_export.txt IT alert re: kraliknovak09@gmail.com blocked access request Personal-account tie to leaker

## Appendix B — Conclusion
The investigation concludes that the Nestlé / KITKAT heist was made possible by BR-0291 (Radovan Blšťák), a Route Planner who pulled and exported the Italy–Poland route file on the night of 25 March 2026 using his personal GMail account for unauthorised access, leaking the consignment details. BR-0312, working late, witnessed the export and reported the anomaly anonymously through the Mullvad VPN to Brno Regional News, giving law enforcement the investigative thread that exposed the insider.

- End of report —
