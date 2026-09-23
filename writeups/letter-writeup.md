---
title: Letter
category: OSINT / Forensics
difficulty: Easy
platform: TryHackMe
date: 2026-08-10
tags: [TryHackMe, OSINT, Forensics, Easy]
summary: An investigation that starts from a single artefact and builds out the picture piece by piece until the answer falls out.
---

### A water-damaged envelope, a torn newspaper clipping and a faded note hiding a 100-year-old story of courage at sea · OSINT (Easy)
Use the clues provided in the zip file to uncover the full name and age of the person mentioned Task in the note. Deliverables: the postal code of the delivery address on the envelope, and the flag in the format THM{Name_Surname_age}. Letter-1776082552563.zip → letter.png (envelope), Newspaper_clipping.png, Note.txt Evidence (handwritten note in French) OSINT (Open Source Intelligence) — Historical Research Room type Easy Difficulty Identify the addressee’s postal code and the full name + age of the hero mentioned in the note Objective Sameekey Author 10 August 2026 Date This report documents every clue, the reasoning chain, and the exact techniques used to solve the room. Commands are shown so the investigation can be replayed.

## 1. Scenario & Evidence
It is just another Monday morning on a mail delivery route when an unusual, battered envelope catches the postman’s eye — riddled with holes, the address barely legible. Inside: a faded newspaper clipping and a short handwritten note. Extraction:

```bash
unzip Letter-1776082552563.zip → letter.png, Newspaper_clipping.png, Note.txt
```

## 1.1 The handwritten note (Note.txt)
The note is written in French, signed “Audette”, and addressed to “Mon cher Édouard”. A translation of the key passage:

```bash
“Ton arrière-grand-père n’avait même pas l’âge de passer le permis quand il s’est distingué ce
jour-là. Le benjamin de l’équipe, et certainement pas le moins courageux.”
```

“Your great-grandfather wasn’t even old enough to get a driving licence when he distinguished himself that day. The youngest of the team, and certainly not the least brave.” Four decisive clues: the hero is Édouard’s great-grandfather; the event happened when he was under 18 (French driving age, then and now); he was the youngest member of a team (“le benjamin de l’équipe”); and the closing line

- “Il serait si fier de te voir sur l’eau à ton tour” (“he would be so proud to see you on the water too”) — points to a

maritime story.

## 1.2 The envelope (letter.png)
The envelope carries French postal markings (LETTRE VERTE, LA POSTE, FRANCE, 20g, POIDS MAX, DÉLAI 3 JOURS) and a handwritten destination. The blue-ink postal code is distorted by water damage — it looks like “53432”, but that must be rejected: department 53 is Mayenne, a completely landlocked department with no sea-rescue station at all. The writer’s sloppy cursive is actually 29760, the postal code of Penmarc’h (Finistère, Brittany), home of an SNSM (Société Nationale de Sauvetage en Mer) rescue station. ⇒Answer 1: 29760. TryHackMe - Letter (OSINT) - Investigation Writeup  |  Page 1

## 1.3 The newspaper clipping (Newspaper_clipping.png)
The masthead reads L’OUEST-ÉCLAIR, a French daily published in Rennes from 1899 to 1944. The price “200 centimes” and the surrounding headlines anchor the date: “Amundsen a-t-il atteint le pôle Nord?” (Roald Amundsen’s North Pole flight took off 21 May 1925) and “M. Herriot se déclare solidaire de M. Painlevé” (Paul Painlevé was French Prime Minister from April 1925). The torn main headline describes a catastrophe in the Finistère — two boats and two lifeboats — with sailors drowned. Combined with the Penmarc’h anchor, this identifies the event: the Penmarc’h Lifeboat Disaster of 23 May 1925, when two SNSM rescue boats capsized in a freak storm while trying to save fishermen; 27 men died.

## 2. Answers, Where & How They Were Found Q1. What is the postal code of the delivery address on the envelope?
Answer:29760 Where/How: The envelope’s scribbled code was read as “53432”, but geographic sanity-checking ruled it out (dept. 53 = Mayenne, landlocked). The letter is addressed to the SNSM station; the note’s maritime theme and the newspaper’s Finistère catastrophe point to Penmarc’h, whose postal code is 29760. “2 9 7 6 0” is precisely the distorted handwriting on the envelope. 

## Q2. What is the flag?
Answer:THM{Yves-Marie_Gourlaouen_15} Where/How: Historical records of the 23 May 1925 Penmarc’h disaster list the crews of the two lifeboats. Searching the archives for the youngest rescuer (“le benjamin de l’équipe”, too young for a driving licence) surfaces Yves-Marie Gourlaouen — a 15-year-old mousse (cabin boy) who went out into the deadly storm and was awarded a silver medal for bravery. The note’s clues match perfectly: under 18, youngest of the team, heroism on the water. Applying the required format (only the first letter of each part capitalised, hyphenated names keep both capitals, as in the example THM{Pierre-Henry_Lagaffe_23}) gives the flag. 

## 3. Answers Summary
# Question Answer What is the postal code of the delivery address on the 1 29760 envelope? 2 What is the flag? THM{Yves-Marie_Gourlaouen_15}
## 4. Key Techniques & Takeaways
- Translate and dissect the note first — it is the strongest filter: under-18, youngest of the team, maritime theme (“sur


- Date the clipping by its secondary headlines — Amundsen’s 21 May 1925 flight and the Herriot/Painlevé

government pin the newspaper to late May 1925, decades before OCR is even needed.

- Cross-verify the postal code geographically — a landlocked department (53) cannot host an SNSM sea-rescue

station; 29760 (Penmarc’h, dept. 29) fits the story.

- Search historical archives in French (“sauvetage Penmarc’h 1925”) and look for a roster with ages — “le benjamin”

points to the youngest named participant, the 15-year-old mousse Yves-Marie Gourlaouen. TryHackMe - Letter (OSINT) - Investigation Writeup  |  Page 2

- Respect the flag format exactly — hyphenated names keep both initial capitals (Yves-Marie), surname capitalised,

age appended: THM{Yves-Marie_Gourlaouen_15}.

```bash
© 2026 Sameekey — TryHackMe “Letter” (OSINT) writeup. Intended for educational purposes only.
```

TryHackMe - Letter (OSINT) - Investigation Writeup  |  Page 3
