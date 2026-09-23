---
title: The Clean Exit
category: DFIR / Windows Forensics
difficulty: Medium
platform: TryHackMe
date: 2026-09-22
tags: [TryHackMe, DFIR, Windows, KAPE, Forensics, Medium]
summary: "DFIR insider threat investigation for GlobalTech Manufacturing. Uncovering Turner's exfiltration tradecraft across USB insertion, BITS transfer jobs, RDP lateral movement, SMB staging, and security event log tampering using KAPE triage."
---

# The Clean Exit
## TryHackMe DFIR — THM Security Services for GlobalTech Manufacturing — 100% Complete Walkthrough
| **Platform** | TryHackMe |
| **Category** | Digital Forensics & Incident Response (DFIR) |
| **Difficulty** | Medium |
| **Analyst** | sameekey (22 Sep 2026) |
| **Target Host** | `10.48.188.103` (`WKS-07` / DFIR Analysis Station) |
| **Forensic Artefacts** | KAPE Triage: `SYSTEM`, `SOFTWARE`, `NTUSER.DAT`, `UsrClass.dat`, `$MFT`, `$Extend\$J` (USN Journal) |
| **Score** | 10/10 Tasks Completed |

> **TL;DR** — An insider threat investigation tracking departing employee Alan Turner at GlobalTech Manufacturing. Turner attempted exfiltration via USB mass storage and background intelligent transfer (BITS), pivoted via RDP to an internal staging share, wiped his workstation event logs and MFT traces, but was caught dead to rights through low-level NTFS USN Journal (`$Extend\$J`) parsing and ShellBags recovery.


## 1. Case Briefing
The finance division at GlobalTech Manufacturing discovered that critical vendor contracts for Q3 were missing. Suspicion immediately fell on Alan Turner, a departing executive.

Our DFIR objective was to reconstruct Turner's actions on workstation `WKS-07` down to the exact second, identify all staging directories and exfiltration destinations, and determine how he attempted to cover his tracks.


## 2. All 10 Investigation Answers at a Glance
| Question | Investigation Metric | Answer | Primary Artefact & Method |
| **Q1** | USB Mass Storage Serial Number | `MSFT300123456789ABCDEF` | `SYSTEM\ControlSet001\Enum\USB\VID_152D&PID_0578` |
| **Q2** | USB Volume Label | `PERSONAL_BACKUP` | `SOFTWARE\Microsoft\Windows Search\VolumeInfoCache\E:` |
| **Q3** | Executable Run from USB | `exfiltool.exe` | `NTUSER.DAT\Explorer\UserAssist` (ROT13 decoded) |
| **Q4** | Malicious BITS Destination Domain | `evil-external.thm` | `Microsoft-Windows-Bits-Client%4Operational.evtx` |
| **Q5** | Exfiltration Archive Name | `FinanceDocs.zip` | BITS transfer job URL parameters |
| **Q6** | Internal Jump Host Pivot | `GTM-JUMP-01` | `NTUSER.DAT\Software\Microsoft\Terminal Server Client\Default` (MRU0) |
| **Q7** | Target Subdirectory Browsed | `VendorContracts_Q3` | `UsrClass.dat` parsed with ShellBagsExplorer |
| **Q8** | Timestamp of Last Interaction | `18:17:30` | ShellBags last-modified timestamp (UTC) |
| **Q9** | Final Network Staging Share | `\\192.168.86.172\Staging$` | Workstation network connectivity artifacts |
| **Q10** | Firewall Log Wipe Timestamp | `06:21:40 PM` | NTFS USN Journal (`$Extend\$J`) entry via `MFTECmd` |


## 3. Step-by-Step Forensic Reconstruction
### 1. USB Storage Artifacts (Q1, Q2, Q3)
Parsing the `SYSTEM` hive inside Registry Explorer revealed the vendor ID and serial number of the plugged storage device:
- **Path**: `ControlSet001\Enum\USB\VID_152D&PID_0578\MSFT300123456789ABCDEF`
- **DeviceDesc**: `USB Attached SCSI Mass Storage Device`

Mounting the `SOFTWARE` hive identified the assigned drive letter (`E:`) and the volume label:
- **Volume Label**: `PERSONAL_BACKUP` (plugged at `2026-07-12 18:04:58`)

To discover what executable was launched from drive `E:`, we examined the ROT13-encoded `UserAssist` keys within `NTUSER.DAT`:
```text
E:\Tools\exfiltool.exe — Executed at 18:06:12
```

### 2. The BITS Transfer Attempt (Q4, Q5)
When `exfiltool.exe` failed, Turner pivoted to a native Windows LOLBin: **Background Intelligent Transfer Service (BITS)**.

Extracting event logs from `Microsoft-Windows-Bits-Client%4Operational.evtx`:
```powershell
Get-WinEvent -Path '...\winevt\Logs\Microsoft-Windows-Bits-Client%4Operational.evtx' `
  | Select-Object TimeCreated, Message | Select-String -Pattern "evil"
```
The query surfaced a canceled job attempting to push `FinanceDocs.zip` to:
```text
https://evil-external.thm/upload/FinanceDocs.zip
```

### 3. Lateral Movement & ShellBags (Q6, Q7, Q8, Q9)
With direct external HTTP traffic blocked by the perimeter firewall, Turner initiated an RDP connection to an internal jump box:
- `MRU0` in `NTUSER.DAT\Software\Microsoft\Terminal Server Client\Default`: `GTM-JUMP-01`

Examining `UsrClass.dat` using ShellBagsExplorer revealed that Turner browsed to `C:\Users\aturner\Desktop\FinanceDocs\VendorContracts_Q3` at `18:17:30`. He staged the files to an internal hidden SMB share:
```text
\\192.168.86.172\Staging$
```

### 4. Anti-Forensics & The USN Journal (Q10)
Turner attempted to sanitize `WKS-07` by executing a cleanup script:
- Emptied the Recycle Bin via `Shift+Delete`.
- Cleared AppCompat and `RecentFileCache.bcf`.
- Deleted the Windows Firewall with Advanced Security event log.

A standard scan of `$MFT` yielded no results due to rapid MFT slot reuse across 250,000+ subsequent disk operations. However, the NTFS **USN Journal (`$Extend\$J`)** is strictly append-only and retains transaction records even after MFT entries are overwritten.

Running `MFTECmd` against the USN Journal:
```bash
MFTECmd.exe -f '...\WKS-07\C\$Extend\$J' -m '...\WKS-07\C\$MFT' --csv %USERPROFILE%\Desktop --csvf usnjrnl.csv
```
Filtering for `Firewall.evtx` pinpointed a `DataTruncation` (clear) operation:
```text
UpdateTimestamp: 2026-07-12 18:21:40.7658957
File Name: Microsoft-Windows-Windows Firewall With Advanced Security%4Firewall.evtx
Reason: DataOverwrite | DataTruncation
```
In 12-hour format: **`06:21:40 PM`**.


## 4. Key Takeaways
1. **Never Rely Solely on the `$MFT`**: When anti-forensics tools overwrite deleted MFT records, the NTFS `$Extend\$J` journal frequently preserves record creation, modification, and truncation reasons.
2. **UserAssist Reliability**: The Windows `UserAssist` registry subkey remains one of the fastest and most dependable methods to prove program execution directly from removable drives.
3. **Internal Pivots in Exfiltration**: Attackers often stage confidential data on internal jump boxes and hidden administrative shares (`$`) when egress points are monitored.
