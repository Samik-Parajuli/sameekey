---
title: Breaking Crypto
category: Cryptography
difficulty: Medium
platform: TryHackMe
date: 2026-07-30
tags: [TryHackMe, Cryptography, Medium]
summary: "Hands-on with weak cryptographic implementations: identifying the cipher, recovering the key and scripting the decryption instead of brute forcing it."
---

# Cover Page
Documentation Version: 1.0

| Name | Version | Prepared By |

| --- | --- | --- |

| Breaking Crypto the Simple Way Walkthrough | 1.0 | Sameek Parajuli |

# Executive Summary
This document presents the walkthrough for the TryHackMe room Breaking Crypto the Simple Way. The objective of the room is to identify and exploit common cryptographic implementation weaknesses, including weak RSA encryption, exposed cryptographic secrets, and insecure JSON Web Token (JWT) implementations. The walkthrough demonstrates the exploitation process and the techniques used to obtain the required flags.

# Vulnerability Summary
| Vulnerability | Severity | Affected Component | Status |

| --- | --- | --- | --- |

| Weak RSA Key Generation | High | RSA Encryption | Exploited |

| Weak Encryption Implementation | Medium | Encryption Service | Exploited |

| Exposed API Key | Medium | Client-side Application | Exploited |

| JWT Role Manipulation | High | Authentication System | Exploited |

# Detail of Technical Findings
## Title:
Weak RSA Key Generation Leading to Plaintext Recovery

### Description
The application uses an RSA public key generated from weak prime numbers. Since the modulus can be factored, an attacker can reconstruct the private key and decrypt the encrypted message.

### Impact
- Sensitive encrypted information can be recovered.


- Attackers may forge encrypted messages.


- No direct impact.

### Recommendation
- Generate RSA keys using cryptographically secure random prime numbers.

- Use key sizes of at least 2048 bits.

- Periodically rotate cryptographic keys.

### Affected Component
RSA Encryption Service

### Severity
# Steps of Reproduction
### Step 1
Configure the target hostname.

### Step 2
Open the application using:

Verify that the application loads successfully.


### Step 3
Copy the RSA modulus (n) provided by the challenge. Use the recovered values to calculate the RSA private key and decrypt the ciphertext.

The decrypted output reveals the challenge flag.


## Title
Weak Encryption Key Disclosure

### Description
The application uses an insecure encryption implementation that allows the ciphertext to be decrypted once the key is identified.

### Impact
- Protected information becomes readable.


- Attackers can modify encrypted data.


### Recommendation
- Use strong encryption keys.

- Store keys securely.

- Never expose cryptographic secrets.

### Affected Component
Encryption Module

### Severity
# Steps of Reproduction
### Step 1
Locate the encrypted data provided by the application.


📷 Figure 5: Encrypted application data.

### Step 2
Decrypt the ciphertext using the provided key or script.

The plaintext contains the required flag.


📷 Figure 6: Terminal showing the decrypted flag.

## Title
Exposed API Key

### Description
The application exposes an API key through client-side requests.

### Impact
- Attackers gain unauthorized access to protected APIs.


- API requests can be forged.


- Possible service abuse.

### Recommendation
- Store API keys on the server.

- Never expose secrets in client-side code.

- Rotate compromised API keys.

### Affected Component
Client-side JavaScript

### Severity
# Steps of Reproduction
### Step 1
Open Developer Tools.

Navigate to the Network tab.

Refresh the application.

Inspect the responses.

Locate the exposed API key.


📷 Figure 7: Network tab displaying the exposed API key.

## Title
JWT Role Manipulation

### Description
The application trusts user-controlled JWT claims without properly validating authorization.

### Impact
- Unauthorized users gain access to protected information.


- Privilege escalation to administrator.


- Minimal impact.

### Recommendation
- Properly verify JWT signatures.

- Never trust client-controlled role values.

- Implement server-side authorization.

### Affected Component
Authentication System

### Severity
# Steps of Reproduction
### Step 1
Capture the JWT after logging into the application.


📷 Figure 8: Original JWT token.

### Step 2
Decode the JWT.

Modify the role value from:


Re-sign the token using the provided secret.

Replace the old JWT.

Refresh the application.

Administrator access is obtained.


📷 Figure 9: Modified JWT.

📷 Figure 10: Administrator dashboard.

# References
- TryHackMe – Breaking Crypto the Simple Way Writeup

- FactorDB

- JWT.io

# Conclusion
The room demonstrates how improper cryptographic implementations can completely undermine otherwise secure algorithms. Weak RSA key generation, insecure encryption practices, exposed secrets, and improper JWT validation all allow attackers to compromise sensitive data and escalate privileges. Following secure cryptographic practices and proper server-side validation significantly reduces the risk of these vulnerabilities.
