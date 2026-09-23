---
title: Missing Person (OSINT)
category: OSINT
difficulty: Easy
platform: TryHackMe
date: 2026-08-07
tags: [TryHackMe, OSINT, Easy]
summary: Building a profile from public sources, correlating the data points that matter and tracking the target down using nothing but open information.
---

## OSINT INVESTIGATION WRITEUP
# TryHackMe — “Missing Person”
## Track the missing friend through photos & social media breadcrumbs · OSINT (Easy)
My friend went on holiday in 2025 and shared some photos, but I haven’t heard from him since. Can y Task osint-1767765507985.zip  &#8594;  food.jpg, MotoGP.jpg Evidence OSINT (Open Source Intelligence) Room type Easy Difficulty Answer 8 questions (event, restaurant, bar, DJ, cave, phone) Objective Sameekey Author 7 August 2026 Date This report documents every question, where the answer was found, and the exact techniques used to find it. Commands are shown without output so the investigation can be replayed. Page 1

# 1. Scenario & Evidence
A friend went on holiday in 2025, shared two photos, and then went silent. The last message received was: “Went to this cool MotoGP after party, and became friends with one of the local DJs who played that night. We’re going to visit a cave tomorrow.” The zip archive contains two JPEG files. The first step in any image-based OSINT investigation is extracting metadata with exiftool.

```bash
unzip osint-1767765507985.zip
exiftool food.jpg
exiftool MotoGP.jpg
strings food.jpg | grep 2025
```

Key metadata: food.jpg taken 2025:10:05 19:55:30 — MotoGP.jpg taken 2025:10:05 12:33:12. Both photos are from 5 October 2025. Page 2

# 2. Answers, Where & How They Were Found
## Q1. What is the commercial name of this circuit?
```bash
Answer:Pertamina Mandalika International Street Circuit
```

Where/How: The MotoGP.jpg photo shows the Grand Prix circuit. The EXIF date (5 Oct 2025) points to the 2025 MotoGP calendar; a reverse image search (Google Lens) on the photo geolocates it to the Pertamina Mandalika International Circuit in Lombok, Indonesia. The official event was the “Pertamina Grand Prix of Indonesia 2025”. The commercial name of the track is Pertamina Mandalika International Street Circuit. Answer format check: 9-9-13-6-7 letters = Pertamina / Mandalika / International / Street / Circuit. 

## Q2. When did the event take place?
```bash
Answer:03-05/10/2025
```

Where/How: EXIF confirms the friend was there on 05/10/2025 (race day). The 2025 MotoGP calendar shows the Pertamina Grand Prix of Indonesia ran 3–5 October 2025 at Mandalika (a 3-day race weekend). The event therefore took place 03-05/10/2025. Answer format check: 03-05 / 10 / 2025. 

## Q3. He told me he ate delicious Mexican food. What is the name of the restaurant?
```bash
Answer:Cantina Mexicana
```

Where/How: The food.jpg photo shows a colourful Mexican restaurant. Printed on the yellow table in the foreground of the image is the text “CANTINA MEXICANA”. A reverse image search confirms it as Cantina Mexicana, a popular Mexican restaurant in Kuta, Lombok (a MotoGP-week hotspot). Answer format check: 7-8 letters = Cantina / Mexicana. 

## Q4. At what time was this photo taken?
```bash
Answer:19:55:30
```

Where/How: exiftool on food.jpg returns Date/Time Original = 2025:10:05 19:55:30. (The MotoGP.jpg photo was taken at 12:33:12; the restaurant photo in question is the evening dinner shot at 19:55:30.) Answer format check: HH:MM:SS = 19:55:30. 

## Q5. What is the full address of the bar’s location?
```bash
Answer:Jl. Raya Kuta, Kuta, Kec. Pujut, Kabupaten Lombok Tengah, Nusa
Tenggara Bar.
```

Where/How: The final message points to a MotoGP after-party bar. The headline after-party was at Mandalika Beach Club, but the message says a local DJ played, and the answer format ruled out that line-up. Searching “MotoGP after party 5 October 2025 Lombok” surfaces Surfers Bar Kuta Lombok (advertised on Instagram/Facebook @surfersbar.lombok as the “biggest party after the MotoGP race, Sunday 5 October 2025”). Copying the venue from Google Maps gives the full administrative address Page 3

above. Answer format check: Jl.(2) Raya(4) Kuta(4), Kuta(4), Kec.(3) Pujut(5), Kabupaten(9) Lombok(6) Tengah(6), Nusa(4) Tenggara(8) Bar.(3). 

## Q6. What is the DJ’s stage name?
```bash
Answer:Bong Leleh
```

Where/How: Surfers Bar is owned by the local brothers Bong and Wona. Checking Surfers Bar’s social-media reels for the 5 Oct 2025 event reveals the local DJ who played that night: Bong Leleh. (The Mandalika Beach Club headliner “DJ Panda” was the wrong lead — not a local, and the format 2+5 did not match.) Answer format check: 4-5 letters = Bong / Leleh. 

## Q7. After digging into the DJ’s other online accounts, what cave does he take tourists to?
```bash
Answer:Gua Sumur
```

Where/How: The DJ’s personal Facebook page, @bongleleh, is titled “Gua Sumur Lombok” — linking the DJ to the cave he takes tourists to. Gua Sumur (“Well Cave”) is a well-known limestone cave near Mandalika, famous for its dramatic light effects. Answer format check: 3-5 letters = Gua / Sumur. 

## Q8. What number did the DJ list for his tour business?
```bash
Answer:085333137345
```

Where/How: The same Facebook profile (@bongleleh / “Gua Sumur Lombok”) lists a contact number for the cave-tour business: +62 853-3313-7345. Removing the country code (+62) leaves the 12-digit local number 085333137345. (Third-party aggregators such as Wanderlog list other numbers — e.g. 082339064733 — but those belong to different businesses.) Answer format check: 12 digits = 085333137345.  Page 4

# 3. Answers Summary Question Answer 1 Commercial name of the circuit
```bash
Pertamina Mandalika International Street Circuit
```

2 When did the event take place

```bash
03-05/10/2025
```

3 Name of the Mexican restaurant

```bash
Cantina Mexicana
```

4 Time the photo was taken

```bash
19:55:30
```

5 Full address of the bar

```bash
Jl. Raya Kuta, Kuta, Kec. Pujut, Kabupaten Lombok Tengah, Nus
```

6 DJ’s stage name

```bash
Bong Leleh
```

7 Cave he takes tourists to

```bash
Gua Sumur
```

8 Phone number for the tour business

```bash
085333137345
```

# 4. Key Techniques & Takeaways
•exiftool first on every provided image — timestamps (and GPS, when present) anchor the timeline (Q2, Q4). •Reverse image search (Google Lens) geolocates food, venues and landmarks (Q1, Q3). •Re-read the message: the word “bar” (not beach club) was the pivot that ruled out Mandalika Beach Club and led to Surfers Bar (Q5). •Social-media enumeration: event reels (@surfersbar.lombok) identified the local DJ, and his personal Facebook page (@bongleleh, titled “Gua Sumur Lombok”) tied the DJ to the cave and the tour-business phone number (Q6–Q8). •Use the answer formats: the character-count hint (e.g. 4+5 for the DJ name) immediately rules out wrong candidates such as “DJ Panda” (2+5). •Prefer primary sources: the correct phone number came from the DJ’s own Facebook profile, not from third-party aggregator sites. © 2026 Sameekey — TryHackMe “Missing Person” (OSINT) writeup. Page 5
