---
title: Water Bottle
category: Web
difficulty: Easy
platform: TryHackMe
date: 2026-08-12
tags: [TryHackMe, Web, Easy]
summary: The enumeration steps, the vulnerable component and the exploitation path on Water Bottle, in the order you actually do them.
---

```bash
Platform: TryHackMe  |  Category: OSINT  |  Difficulty: Easy – Medium  |  Room: waterbottle
```

## 1. Challenge Description
The scenario: after returning to my hometown, I needed a water refill from a station I frequently used until 2014, but I have forgotten its name and contact number. I only remember that the contact number is twelve digits and starts with 63922. While driving near Boni Avenue, a new water refilling establishment now stands where the original station used to be. The task is to find the name and contact number of the original water station.

```bash
Flag format: THM{station_name_in_lowercase_contact_number}
```

## 2. Analysing the Clues
The number prefix tells us a lot before we even search: •63922 = Philippines country code 63 + Globe Telecom mobile prefix 922 — so the full number is

```bash
63-922-XXX-XXXX.
```

•Location: Boni Avenue, Mandaluyong City, Metro Manila — the station was active until around

## 2014 and has since been replaced.
•The masked answer format (star count) hints: the name appears to be 8 characters and the number

## 3. Step-by-Step Investigation
### Step 1 — Anchor points on Google Maps
The room provides two Google Maps short links that pin down the exact location: Link What it shows Street View from April 2014 @ 14.57887, 121.0318302 — pin now reads “Water Refillin

```bash
maps.app.goo.gl/4H17ZWF5nccRRr2s8
```

Water JAM Water Refilling Station @ 14.578967, 121.032311 — the NEW station

```bash
maps.app.goo.gl/SiALJgGf29jjGJt69
```

Both coordinates are roughly 15 metres apart — essentially the same spot. Water JAM is the new establishment that replaced the original station.

### Step 2 — Recovering the 2014 imagery
Decoding the first Maps link redirect gives the Street View panoid and capture date:

```bash
panoid = NHB-mXd1toBgiIVOouSCkQ
date   = 20140401   (April 2014)
```

Using the Street View Pixels API to pull thumbnails from that panorama at different yaw angles (east, south-west) reveals a yellow and blue structure across the Boni Avenue median — matching Blue Cube Water Re-Filling Station at 425 Pulog cor. Boni Ave, Barangay Malamig (active circa 2012, per its Foursquare listing).

### Step 3 — Searching business directories
The 2014 era also left footprints in older directories (Waze, Cybo, Foursquare, contact.page, Scribd barangay lists). The candidates found:

Station Address Contact Matches? Water Market Refilling Station 19 Domingo M. Guevara, Mandaluyong 0922 874 6887 → 639228746887 12 digits, 63922  — but name has 12 chars Blue Cube Water Re-Filling 425 Pulog cor. Boni Ave, Malamig(02) 497 2712 (landline) 8-char name  — but no 63922 mobile Aquabest — Mandaluyong, Boni 31 Mayon St, Boni, Mandaluyong +63 922 872 1228 → 639228721228 12 digits  · 63922  · 8 chars  Grandeur Water Station 705 Boni Ave, Malamig (02) 533 4069 (landline) No matching mobile number

### Step 4 — Confirming the match: Aquabest
The Aquabest Boni branch contact page (contact.page) lists: •Address: Unit D, Villa Maria Apartment, 31 Mayon Street, Boni, Mandaluyong City

```bash
•Mobile: +63 922 872 1228→63-922-872-1228 = 12 digits starting with 63922
•Name aquabest = 8 characters
```

Aquabest is a long-running Philippine franchise (active well before 2014), and its Boni branch was later replaced by Water JAM at the same location — matching the challenge story perfectly.

## 4. The Flag
### THM{aquabest_639228721228}
## 5. Tools Used
Google Maps (short-link decoding + historical Street View) · Google Street View Pixels API · Waze live map · Foursquare venue listings · contact.page · Scribd (Kalokal Barangay Highway Hills directory) · Cybo · PuertoParrot

## 6. What Didn’t Work & Lessons Learned
•Water Market Refilling Station — phone format was perfect (639228746887) but the name is 12 characters, which does not fit the 8-character answer slot. •Blue Cube Water Re-Filling Station — correct name length and visible in the 2014 Street View, but only ever had a landline, no 63922 mobile number. •Count the stars in the masked answer format — TryHackMe often leaks the answer's length. •Directory sites like contact.page keep numbers complete in international format even when partially masked — always verify the full number. •Old Street View panoramas can be re-fetched by panoid/date via Google's thumbnail API. •A franchise brand may be gone from a location while the chain still exists — don't assume “still listed” means “still there.” Writeup generated for personal study purposes. Solve the room yourself before reading this — OSINT rooms are the most fun when you don’t peek.
