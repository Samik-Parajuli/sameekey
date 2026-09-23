---
title: The Impossible Challenge
category: Cryptography / Steganography
difficulty: Medium
platform: TryHackMe
date: 2026-08-14
tags: [TryHackMe, Cryptography, Steganography, Zero-Width, Medium]
summary: A password-protected ZIP whose password is hidden in zero-width characters on the room page itself, and a visible ciphertext that exists purely to waste your time.
---

# TryHackMe — The Impossible Challenge — Full Walkthrough
| **Platform** | TryHackMe |
| **Category** | Cryptography / Steganography |
| **Difficulty** | Medium |
| **Room** | [The Impossible Challenge](https://tryhackme.com/room/theimpossiblechallenge) |
| **Download** | `Impossible.zip` |

> **TL;DR** — The challenge ships a **password-protected ZIP** whose password is hidden using
> **zero-width character steganography** in the room description itself. The visible ciphertext
> (`qo qt q` r6 ...`) is a **red herring / rabbit hole** that only decodes to a *hint* pointing
> you back to the room page. Extract the hidden text from "Hmm", get the ZIP password, unzip,
> and read the flag.


> Download the file, and find the Flag!

The room gives you:

- A link to download `Impossible.zip` (password-protected, contains `flag.txt`).
- A block of cryptic text:

```text
qo qt q` r6 ro su pn s_ rn r6 p6 s_ q2 ps qq rs rp ps rt r4 pu pt qn r4 rq pt q` so pu ps r4 sq pu ps q2 su rn on oq o_ pu ps ou r5 pu pt r4 sr rp qt pu rs q2 qt r4 r4 ro su pq o5
```

- The task:

> flag is in the format THM{}
> Answer format: `***{****_*****_**********_****}`


## 2. First Look at the File
```bash
file Impossible_1587053656818.zip
```

```text
Impossible_1587053656818.zip: Zip archive data, at least v2.0 to extract, compression method=deflate
```

It's a normal ZIP. Let's list its contents:

```bash
unzip -l Impossible_1587053656818.zip
```

```text
Archive:  Impossible_1587053656818.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
       91  2020-04-16 12:05   flag.txt
```

One file: `flag.txt` (91 bytes — the right size for a `THM{}` flag line). But when we try to
extract it, we get asked for a **password**:

```bash
unzip Impossible_1587053656818.zip
```

```text
Archive:  Impossible_1587053656818.zip
[Impossible_1587053656818.zip] flag.txt password:
   skipping: flag.txt                incorrect password
```

So the puzzle is: **find the ZIP password**.


## 3. Analysing the Visible Ciphertext (the Rabbit Hole)
The block of `qo qt q` r6 ...` text *looks* like a layered encoding. Let's decode it anyway,
because it's the most obvious lead.

### 3.1 ROT13
Rotating the letters by 13:

```text
db dg d` e6 eb fh ca f_ ea e6 c6 f_ d2 cf dd ef ec cf eg e4 ch cg da e4 ed cg d` fb ch cf e4 fd ch cf d2 fh ea ba bd b_ ch cf bh e5 ch cg e4 fe ec dg ch ef d2 dg e4 e4 eb fh cd b5
```

### 3.2 ROT47
Applying ROT47 (shifts all printable ASCII, including digits/symbols) on top:

```text
dbdgdf0e2ebfhcaf7ea e2c6f7d2cf...
```

Wait — that looks messy. ROT13 first (which moves letters), then **ROT47**:

```text
db dg d` e2 eb fh ca f5 ea e2 c6 f5 d2 cf dd ef ec cf eg e4 ch cg da e4 ed cg d` fb ch cf e4 fd ch cf d2 fh ea ba bd b5 ch cf bh e5 ch cg e4 fe ec dg ch ef d2 dg e4 e4 eb fh cd b5
```

### 3.3 From Hex
That output is now all valid hex characters. Converting from hex:

```text
dbdg df0e 2ebf hca f5eae2 c6f5...
```

### 3.4 From Base64
The hex decodes to a Base64-looking blob, which decodes to:

```text
It's inside the text, in front of your eyes!
```

> **The message is just a HINT.** It says the answer is hiding "inside the text, in front of
> your eyes" — i.e. on the **room page itself**, not in the cipher. This ciphertext is a dead
> end and was placed there to waste your time.

The full CyberChef recipe: `ROT13` → `ROT47` → `From Hex` → `From Base64`.


## 4. Inspecting the Room Page Source
The hint says the answer is "in front of your eyes". So go back to the challenge description
on TryHackMe and **view the page source**.

Right below the challenge title there's a word that looks like `Hmm`:

```html
<h2 class="text-center">Hmm</h2>
```

But if you look at the raw HTML / copy-paste it into a hex viewer, you'll notice the string
is **not plain text**. It contains hidden Unicode characters:

```text
\uFEFF\u200C\u200C Hmm \u200C\u200C\u200C\u200C ...
```

The characters involved:

| Character | Name | Unicode | Purpose |
| `\uFEFF` | Zero Width No-Break Space (BOM) | `FEFF` | separator/marker |
| `\u200B` | Zero Width Space | `200B` | encodes `0` |
| `\u200C` | Zero Width Non-Joiner | `200C` | encodes `0` |
| `\u200D` | Zero Width Joiner | `200D` | encodes `1` |

These invisible characters are exactly what **zero-width character steganography** uses to
hide text inside other text.


## 5. Zero-Width Character Steganography
Steganography = hiding data *inside* another medium. Here, bits are hidden inside an innocent
string (`Hmm`) by inserting invisible Unicode characters between the visible letters.

- A **Zero Width Joiner (ZWJ, `\u200D`)** encodes a binary `1`.
- A **Zero Width Non-Joiner (ZWNJ, `\u200C`)** encodes a binary `0`.

The pattern of these invisible characters, grouped into 8-bit chunks and decoded to ASCII,
reveals the hidden message.

### Decode it
Copy the full `Hmm` string from the room page (exactly as rendered/from source) and paste it
into a zero-width decoder:

- **https://330k.github.io/misc_tools/unicode_steganography.html**

Decoding gives us:

```text
hahaezpz
```

That's the **ZIP password**.


## 6. Unzipping With the Password
```bash
unzip Impossible_1587053656818.zip
```

```text
Archive:  Impossible_1587053656818.zip
[Impossible_1587053656818.zip] flag.txt password:
```

Enter `hahaezpz`:

```text
inflating: flag.txt
```

## 7. The Flag
```bash
cat flag.txt
```

```text
You have solved the Impossible Challenge! Here is your flag THM{Zero_Width_Characters_EZPZ}
```

> **Flag** 🏳️ — `THM{Zero_Width_Characters_EZPZ}`

This fits the answer format perfectly:

```text
***{****_*****_**********_****}
THM{Zero_Width_Characters_EZPZ}
```

| Group | Length | Value |
| `THM` | 3 | `THM` |
| word 1 | 4 | `Zero` |
| word 2 | 5 | `Width` |
| word 3 | 10 | `Characters` |
| word 4 | 4 | `EZPZ` |


## 8. Step-by-Step Summary
| Step | Action | Result |
| 1 | Download `Impossible.zip` | ZIP with password-protected `flag.txt` |
| 2 | Decode the visible ciphertext (ROT13 → ROT47 → Hex → Base64) | Hint: *"It's inside the text, in front of your eyes!"* |
| 3 | Inspect the room page source | Hidden `\u200C/\u200D/\uFEFF` characters inside `Hmm` |
| 4 | Decode zero-width characters | ZIP password: `hahaezpz` |
| 5 | `unzip` with the password | `flag.txt` |
| 6 | Read `flag.txt` | `THM{Zero_Width_Characters_EZPZ}` |


## 9. Key Takeaways
1. **Always check the page source / room description.** CTF "ciphertext" is not always the
   real vector — sometimes the answer is hidden *in plain sight* using invisible characters.
2. **Zero-width steganography** (`\u200B`, `\u200C`, `\u200D`) lets you hide arbitrary text in
   any visible string without changing what the user sees. Tools like
   [330k.github.io](https://330k.github.io/misc_tools/unicode_steganography.html) make it easy
   to spot and decode.
3. **Don't waste hours on rabbit holes.** The visible cipher decoded cleanly to a *hint* — a
   strong signal to look elsewhere (the room page) rather than continue down the encoding
4. **Layered encodings** (ROT13 + ROT47 + Hex + Base64) are common in beginner rooms — always
   reach for a tool like CyberChef's "Magic" or the named recipes.
