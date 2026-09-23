---
title: Cache Me Outside
category: OSINT / Web
difficulty: Medium
platform: TryHackMe
date: 2026-08-08
tags: [TryHackMe, OSINT, Web, Medium]
summary: "OSINT-style investigation into a retired hacker's public trail, following metadata, social profiles and geolocation clues to the final answer."
---

# Walkthrough
Identify the retired hacker via Komoot · GitHub · email · Threads · geolocation page 1

# TryHackMe "Cache Me Outside" — OSINT Walkthrough
## Room Info
• **Room**: Cache Me Outside (OSINT / active OSINT, 60 min) • **Objective**: Identify a retired hacker ("ex hacker turned outdoorsman") and trace the trail he left across public profiles, exposed metadata, social media and geolocation clues. The trail ends at a tram station.

## Questions & Answers
# Question Answer 1 What is the retired `Jim Lee` hacker's full name? 2 What email address did he `jimleepro1@gmail.com` accidentally expose? 3 What is his phone number? `+40 743 321 239` 4 In which city is he `Timișoara` located? 5 Name of the tram station `Piața Gheorghe where he got off on the Domășneanu` 7th of May, 2026 ---
## The Trail
Leaked conversation screenshot (Discord)

```bash
        │
```

▼ Komoot profile ───► Jim Lee, GitHub link

```bash
        │
```

▼ GitHub jiml33t ───► jiml33t/jiml33t repo

```bash
        │
```

▼ Commit .p atch metadata ───► jimleepro1@gmail.com

```bash
        │
```

▼ Email autoresponder ───► +40 743 321 239

```bash
        │
```

▼ Username reuse → Threads @jiml33t (post 2026-05-07)

```bash
        │
```

▼ Photo geolocation (IRIGAȚII.RO billboard) ───► Calea Buziașului, Timișoara, Romania

```bash
        │
```

▼ Tram line 4/8/9 terminus near Auchan ───► Piața Gheorghe Domășneanu --- page 2

## Step 1 — The Conversation Screenshot
The room provides a screenshot of a leaked chat (WKM1337 ↔ JJ) at 2:45–2:50 am. The ex-hacker **JJ** says he's "done with all that scene", got into hiking/cycling, and shares his Komoot profile: JJ*_* 2:48am i use komoot, it's sick for logging routes and planning new ones. here's my profile if you wanna see my trails or follow me https://www.komoot.com/user/5667624959835 Starting point: https://www.komoot.com/user/5667624959835

## Step 2 — Komoot Profile (Q1: full name)
The Komoot profile reveals the person's identity and links out to GitHub: Jim Lee I'm an ex-hacker trying to turn my life around. Lately, I've been focusing on becoming m ore active, spending more time outdoors, and getting into running. I've also started my own comp any as part of building a better path for myself. github.com/jiml33t • **Q1 answer: Jim Lee** • Pivot: GitHub handle **jiml33t**

## Step 3 — GitHub Profile
github.com/jiml33t — profile metadata: bio:      Currently starting my security consulting firm | Ex-Hacker | Avid Runner company:  Jim Lee Security Consulting repos:    1  (jiml33t/jiml33t — the profile README repo) The only repo is jiml33t/jiml33t (75 forks — everyone who solved the room cloned it). The README is stock GitHub boilerplate ("Hi there I"), so nothing is visible in the file itself.

## Step 4 — Commit Metadata → Exposed Email (Q2)
Even though the README is empty, the **commit metadata** leaks the author identity. Appending .patch to the commit URL exposes the From: header: curl -s https://github.com/jiml33t/jiml33t/commit/7b2c8e0a540c36f2e09da5945066020621d6a059.patch Output: From 7b2c8e0a540c36f2e09da5945066020621d6a059 Mon Sep 17 00:00:00 2001 From: jimleepro1-cell <ji mleepro1@gmail.com> Date: Thu, 16 Apr 2026 03:27:19 -0400 Subject: [PATCH] Initial commit • **Q2 answer: jimleepro1@gmail.com** • Bonus find: the commit was authored under an **older account**, `jimleepro1-cell` — classic username/OPSEC slip. page 3

## Step 5 — Email Autoresponder → Phone Number (Q3)
This is the **active OSINT** part of the room (intentional, sanctioned by the challenge). Sending an email to jimleepro1@gmail.com triggers an **autoresponder** (the target configured an out-of-office because he's "preparing for a marathon"): Good day, I will be absent from the office while I prepare for a marathon. You can contact my o n my phone for anything urgent. Best Regards, JL 0x4A4C JIM LEE CYBERSECURITY CONSULTANT jiml eepro1@gmail.com L33T SECURITY PENTESTING · RED TEAM · CONSULTING The signature block ("L33T SECURITY", 0x4A4C = hex for "JL") confirms the identity, and the autoresponder leaks the mobile number in its contact line: • **Q3 answer: +40 743 321 239** (Romanian +40 number)

## Step 6 — Username Reuse → Threads Profile
Searching the handle jiml33t finds the same username reused on other platforms: **Instagram** (empty) and **Threads** (@jiml33t). The Threads profile has posts relevant to his new lifestyle (running/hiking). One post from **May 7, 2026** is the key:

```bash
> "Just finished my last run before the big day, hopping on the tram for my well-deserved coffee at my favourite
```

French supermarket." The post includes a road-side photo.

## Step 7 — Photo Geolocation (Q4: city)
Looking at the photo attached to the Threads post, there is a large sign on a building: IRIGAȚII.RO Searching that business: Irigatii.ro — Calea Buziașului nr. 13, Timișoara, Romania • A Romanian irrigation-equipment shop • The company describes its location as "at the end of tramway line 4" • The photo's architecture/street matches Calea BuziaIului in TimiIoara • **Q4 answer: TimiIoara** (Romania)

## Step 8 — Tram Station (Q5: 7th May 2026)
Combine the clues from the Threads post caption: page 4

1. **"hopping on the tram"** → he boarded near the IRIGAIII.RO location, which sits at the terminus of **tram line 4** (Calea BuziaIului / Calea Stan Vidrighin area) 2. **"my favourite French supermarket"** → **Auchan** (French retail chain) has a store on Calea BuziaIului nr. 11, TimiIoara, directly in that area 3. The tram stop serving the IRIGAIII.RO/Auchan area (tram lines 4, 8, 9) is: Piața Gheorghe Domășneanu (also listed as "Piața Gheorghe Domășneanu (Auchan)" / "Piața Gheorghe Domășneanu (Liviu Rebreanu - AEM)") • **Q5 answer: PiaIa Gheorghe DomIIneanu** ---

## Key OSINT Techniques Used
1. **Profile pivoting** — one platform (Komoot) links to another (GitHub), username jiml33t reused across GitHub/Instagram/Threads. 2. **Git commit metadata / .patch files** — even an empty README repo leaks the author's name + email from Git config. .patch files stay public even if content is deleted. 3. **Active OSINT via autoresponder** — emailing the discovered address triggers an out-of-office auto-reply that leaks the phone number. Only do this with authorization (the room's setup is sanctioned). 4. **Username/password reuse on old accounts** — jimleepro1-cell revealed an older handle. 5. **Image geolocation** — a billboard ("IRIGAIII.RO") in a photo maps to a physical business address. 6. **Correlating weak signals** — photo location + "French supermarket" + tram mention → transit maps → exact tram stop.

## Takeaway / OPSEC Lessons
• Use GitHub's **noreply email** (`<id>+<user>@users.noreply.github.com`) so commit metadata doesn't leak your real address. • Don't reuse the same handle everywhere — username reuse is the fastest way to connect identities. • Don't configure out-of-office auto-replies that include phone numbers. • Photos posted online leak geolocation via visible landmarks. ---

## Verification Notes
• Komoot profile, GitHub profile/API, and the `.patch` file were verified directly during this session. • The Threads post (`https://www.threads.com/@jiml33t/post/DYCg8B1iMAl`) is no longer publicly fetchable (JS-gated/removed), but its content — the caption about the tram + French supermarket and the IRIGAIII.RO billboard — is consistently documented by multiple independent writeups of this room, all converging on the same five answers. Writeup generated from the OSINT investigation session. All findings verified against live sources where possible. page 5
