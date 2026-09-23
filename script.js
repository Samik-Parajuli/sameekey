/**
 * SAMEEKEY // CYBERSECURITY PORTFOLIO ENGINE (v3.0.0)
 * Client logic for tactical cybersecurity portfolio, interactive terminal,
 * Web Audio API synthesizer, cyber toolkit, and writeup archive.
 */

(function () {
    'use strict';

    var root = document.documentElement;
    var $ = function (id) { return document.getElementById(id); };
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize AOS if available
    if (window.AOS) {
        AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, disable: prefersReduced });
    }

    /* ==========================================================================
       1. WEB AUDIO API SYNTHESIZER (Procedural Cyber Sound FX)
       ========================================================================== */
    var audioCtx = null;
    var sfxEnabled = false;
    try {
        sfxEnabled = localStorage.getItem('sfx_enabled') === 'true';
    } catch (e) { }

    function getAudioContext() {
        if (!audioCtx) {
            var AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playSound(type) {
        if (!sfxEnabled) return;
        var ctx = getAudioContext();
        if (!ctx) return;

        try {
            var now = ctx.currentTime;
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'hover') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);
                gain.gain.setValueAtTime(0.02, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
                osc.start(now);
                osc.stop(now + 0.04);
            } else if (type === 'click') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(110, now + 0.06);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
                osc.start(now);
                osc.stop(now + 0.06);
            } else if (type === 'key') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
                gain.gain.setValueAtTime(0.015, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
                osc.start(now);
                osc.stop(now + 0.03);
            } else if (type === 'success') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.08);
                osc.frequency.setValueAtTime(783.99, now + 0.16);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
                osc.start(now);
                osc.stop(now + 0.28);
            } else if (type === 'error') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.setValueAtTime(120, now + 0.1);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
                osc.start(now);
                osc.stop(now + 0.22);
            }
        } catch (e) { }
    }

    var sfxToggleBtn = $('sfxToggleBtn');
    function updateSfxButton() {
        if (!sfxToggleBtn) return;
        var icon = sfxToggleBtn.querySelector('i');
        var span = sfxToggleBtn.querySelector('span');
        if (sfxEnabled) {
            if (icon) icon.className = 'fas fa-volume-high';
            if (span) span.textContent = 'SFX: ON';
            sfxToggleBtn.style.color = 'var(--primary)';
        } else {
            if (icon) icon.className = 'fas fa-volume-xmark';
            if (span) span.textContent = 'SFX: OFF';
            sfxToggleBtn.style.color = '';
        }
    }

    if (sfxToggleBtn) {
        updateSfxButton();
        sfxToggleBtn.addEventListener('click', function () {
            sfxEnabled = !sfxEnabled;
            try { localStorage.setItem('sfx_enabled', sfxEnabled ? 'true' : 'false'); } catch (e) { }
            updateSfxButton();
            if (sfxEnabled) playSound('success');
            showToast(sfxEnabled ? 'Audio Synth Enabled' : 'Audio Synth Muted', 'fas fa-volume-high');
        });
    }

    // Attach subtle sound triggers on interactive elements
    document.addEventListener('mouseover', function (e) {
        var target = e.target.closest('button, a, .chip, .diff-chip, .tool-opt-btn, .layout-btn');
        if (target) playSound('hover');
    });

    document.addEventListener('click', function (e) {
        var target = e.target.closest('button, a, .chip, .diff-chip, .tool-opt-btn, .layout-btn');
        if (target && !e.target.closest('#sfxToggleBtn')) playSound('click');
    });

    /* ==========================================================================
       2. THEME ENGINE (5 Cyberpunk Palettes)
       ========================================================================== */
    var themes = ['red', 'green', 'cyan', 'gold', 'light'];
    var currentTheme = 'red';
    try {
        currentTheme = localStorage.getItem('theme') || 'red';
    } catch (e) { }

    function setTheme(theme) {
        if (themes.indexOf(theme) === -1) theme = 'red';
        currentTheme = theme;
        root.setAttribute('data-theme', theme);
        try { localStorage.setItem('theme', theme); } catch (e) { }
        if (window.initParticles) window.initParticles();
    }

    setTheme(currentTheme);

    var themePickerBtn = $('themePickerBtn');
    var themeDropdown = $('themeDropdown');
    if (themePickerBtn && themeDropdown) {
        themePickerBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            themeDropdown.classList.toggle('open');
        });
        document.addEventListener('click', function () {
            themeDropdown.classList.remove('open');
        });
        document.querySelectorAll('.theme-opt').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var chosen = this.dataset.setTheme;
                setTheme(chosen);
                themeDropdown.classList.remove('open');
                playSound('success');
                showToast('Palette Switched: ' + chosen.toUpperCase(), 'fas fa-palette');
            });
        });
    }

    /* ==========================================================================
       3. TOAST NOTIFICATIONS
       ========================================================================== */
    var toastContainer = $('toastContainer');
    function showToast(message, iconClass) {
        if (!toastContainer) return;
        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = '<i class="' + (iconClass || 'fas fa-info-circle') + '"></i> <span>' + escapeHtml(message) + '</span>';
        toastContainer.appendChild(toast);
        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(function () { toast.remove(); }, 300);
        }, 2600);
    }

    /* ==========================================================================
       4. NAVIGATION & SCROLL TRACKING
       ========================================================================== */
    var navToggle = $('navToggle');
    var leftNav = $('leftNav');
    if (navToggle && leftNav) {
        navToggle.addEventListener('click', function () {
            var open = leftNav.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        document.querySelectorAll('.nav-links a').forEach(function (link) {
            link.addEventListener('click', function () {
                leftNav.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    var scrollProgress = $('scrollProgress');
    var scrollToTopBtn = $('scrollToTop');
    var navLinks = document.querySelectorAll('.nav-links a');
    var sections = document.querySelectorAll('section[id]');

    function onScroll() {
        var top = window.pageYOffset || document.documentElement.scrollTop;
        var height = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollProgress) scrollProgress.style.width = (height > 0 ? (top / height) * 100 : 0) + '%';
        if (scrollToTopBtn) scrollToTopBtn.classList.toggle('active', top > 400);

        var current = '';
        sections.forEach(function (section) {
            if (top >= section.offsetTop - 240) current = section.id;
        });
        navLinks.forEach(function (link) {
            var href = link.getAttribute('href') || '';
            if (href.startsWith('#')) {
                link.classList.toggle('active', href === '#' + current);
            } else if (href.indexOf('writeups.html') !== -1 && window.location.pathname.indexOf('writeups.html') !== -1) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, left: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (!href || href === '#' || href.length < 2) return;
            var targetEl = document.querySelector(href);
            if (targetEl) {
                e.preventDefault();
                var targetTop = targetEl.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - 50;
                window.scrollTo({
                    top: Math.max(0, targetTop),
                    left: 0,
                    behavior: prefersReduced ? 'auto' : 'smooth'
                });
                if (history.pushState) history.pushState(null, '', href);
            }
        });
    });

    var yearEl = $('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ==========================================================================
       5. ROLE TYPEWRITER (Tactical rotating badge)
       ========================================================================== */
    var typedRole = $('typedRole');
    if (typedRole && !prefersReduced) {
        var roles = [
            'Red Team & Penetration Testing Specialist',
            'Offensive Security & Web App Pentester',
            'TryHackMe Sapphire League #1 Rank',
            'CTF Competitor & Security Researcher'
        ];
        var roleIdx = 0, charIdx = 0, isDeleting = false;
        (function type() {
            var curr = roles[roleIdx];
            typedRole.textContent = curr.substring(0, charIdx);
            if (!isDeleting) {
                charIdx++;
                if (charIdx > curr.length) {
                    isDeleting = true;
                    setTimeout(type, 1800);
                    return;
                }
            } else {
                charIdx--;
                if (charIdx === 0) {
                    isDeleting = false;
                    roleIdx = (roleIdx + 1) % roles.length;
                }
            }
            setTimeout(type, isDeleting ? 30 : 65);
        })();
    } else if (typedRole) {
        typedRole.textContent = 'Offensive Security & Red Team Specialist';
    }

    /* ==========================================================================
       6. COPY TO CLIPBOARD HANDLERS
       ========================================================================== */
    function attachCopyButton(btnId, defaultText) {
        var btn = $(btnId);
        if (!btn) return;
        btn.addEventListener('click', function () {
            var email = btn.dataset.email || 'parajulisameek@gmail.com';
            var span = btn.querySelector('span');
            var done = function () {
                if (span) span.textContent = 'COPIED!';
                playSound('success');
                showToast('Email Copied: ' + email, 'fas fa-copy');
                setTimeout(function () {
                    if (span) span.textContent = defaultText;
                }, 1600);
            };
            if (navigator.clipboard) navigator.clipboard.writeText(email).then(done).catch(done);
            else done();
        });
    }

    attachCopyButton('copyEmail', 'Copy Email');
    attachCopyButton('contactCopyEmailBtn', 'Copy Direct Email');

    // GitHub Clone Command copy handler (Walkthroughs)
    var copyGhCloneBtn = $('copyGhCloneBtn');
    if (copyGhCloneBtn) {
        copyGhCloneBtn.addEventListener('click', function () {
            var cmd = 'git clone https://github.com/Samik-Parajuli/tryhackme_walkthroughs.git';
            var span = copyGhCloneBtn.querySelector('span');
            var done = function () {
                if (span) span.textContent = 'COPIED!';
                playSound('success');
                showToast('Git Clone Command Copied!', 'fab fa-github');
                setTimeout(function () {
                    if (span) span.textContent = 'Copy Clone';
                }, 1600);
            };
            if (navigator.clipboard) navigator.clipboard.writeText(cmd).then(done).catch(done);
            else done();
        });
    }

    // GitHub Clone Command copy handler (Projects Monorepo)
    var copyProjectsCloneBtn = $('copyProjectsCloneBtn');
    if (copyProjectsCloneBtn) {
        copyProjectsCloneBtn.addEventListener('click', function () {
            var cmd = 'git clone https://github.com/Samik-Parajuli/Projects.git';
            var span = copyProjectsCloneBtn.querySelector('span');
            var done = function () {
                if (span) span.textContent = 'COPIED!';
                playSound('success');
                showToast('Projects Monorepo Clone Command Copied!', 'fab fa-github');
                setTimeout(function () {
                    if (span) span.textContent = 'Copy Clone';
                }, 1600);
            };
            if (navigator.clipboard) navigator.clipboard.writeText(cmd).then(done).catch(done);
            else done();
        });
    }

    /* ==========================================================================
       6B. 3D JACK HERO PERSPECTIVE & AMBIENT CANVAS (motionsites.ai inspired)
       ========================================================================== */
    var heroHolocubeWrap = $('heroHolocubeWrap');
    var heroHolocube = $('heroHolocube');
    var holoGlare = $('holoGlare');
    var heroCanvas = $('hero3dCanvas');

    if (heroHolocubeWrap && heroHolocube && !prefersReduced) {
        heroHolocubeWrap.addEventListener('mousemove', function (e) {
            var rect = heroHolocubeWrap.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var cx = rect.width / 2;
            var cy = rect.height / 2;
            var dx = (x - cx) / cx;
            var dy = (y - cy) / cy;

            var rotateX = -dy * 16;
            var rotateY = dx * 16;
            heroHolocube.style.transform = 'perspective(900px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) scale3d(1.03, 1.03, 1.03)';

            if (holoGlare) {
                var glareX = (x / rect.width) * 100;
                var glareY = (y / rect.height) * 100;
                holoGlare.style.background = 'radial-gradient(circle at ' + glareX.toFixed(1) + '% ' + glareY.toFixed(1) + '%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 0, 60, 0.15) 35%, transparent 70%)';
            }
        });

        heroHolocubeWrap.addEventListener('mouseleave', function () {
            heroHolocube.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            if (holoGlare) {
                holoGlare.style.background = 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)';
            }
        });
    }

    // 3D Ambient Wireframe Polyhedron on #hero3dCanvas
    if (heroCanvas && !prefersReduced) {
        var hCtx = heroCanvas.getContext('2d');
        var hW = 0, hH = 0;
        function resizeHeroCanvas() {
            var p = heroCanvas.parentElement;
            if (!p) return;
            hW = heroCanvas.width = p.clientWidth;
            hH = heroCanvas.height = p.clientHeight;
        }
        resizeHeroCanvas();
        window.addEventListener('resize', resizeHeroCanvas);

        // 12 Vertices of an Icosahedron
        var phi = (1 + Math.sqrt(5)) / 2;
        var rawV = [
            [-1,  phi,  0], [ 1,  phi,  0], [-1, -phi,  0], [ 1, -phi,  0],
            [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
            [ phi,  0, -1], [ phi,  0,  1], [-phi,  0, -1], [-phi,  0,  1]
        ];
        var vertices = rawV.map(function (v) {
            var len = Math.hypot(v[0], v[1], v[2]);
            return [v[0] / len, v[1] / len, v[2] / len];
        });

        var edges = [];
        for (var vi = 0; vi < vertices.length; vi++) {
            for (var vj = vi + 1; vj < vertices.length; vj++) {
                var d = Math.hypot(
                    vertices[vi][0] - vertices[vj][0],
                    vertices[vi][1] - vertices[vj][1],
                    vertices[vi][2] - vertices[vj][2]
                );
                if (Math.abs(d - 1.05) < 0.25) {
                    edges.push([vi, vj]);
                }
            }
        }

        var angleX = 0, angleY = 0;
        function render3DHero() {
            if (!hCtx || hW === 0 || hH === 0) return;
            hCtx.clearRect(0, 0, hW, hH);

            angleX += 0.005;
            angleY += 0.008;

            var rad = Math.min(hW, hH) * 0.36;
            var cx = hW * 0.5;
            var cy = hH * 0.5;

            var cosX = Math.cos(angleX), sinX = Math.sin(angleX);
            var cosY = Math.cos(angleY), sinY = Math.sin(angleY);

            var proj = vertices.map(function (v) {
                var x1 = v[0] * cosY - v[2] * sinY;
                var z1 = v[0] * sinY + v[2] * cosY;
                var y2 = v[1] * cosX - z1 * sinX;
                var z2 = v[1] * sinX + z1 * cosX;
                var fov = 2.8;
                var scale = fov / (fov + z2);
                return {
                    x: cx + x1 * rad * scale,
                    y: cy + y2 * rad * scale,
                    z: z2,
                    scale: scale
                };
            });

            // Draw wireframe edges
            hCtx.lineWidth = 1;
            edges.forEach(function (edge) {
                var p1 = proj[edge[0]];
                var p2 = proj[edge[1]];
                var avgZ = (p1.z + p2.z) * 0.5;
                var alpha = 0.08 + ((avgZ + 1) / 2) * 0.22;
                var color = getComputedStyle(root).getPropertyValue('--primary-rgb') || '255, 0, 60';
                hCtx.strokeStyle = 'rgba(' + color.trim() + ', ' + alpha.toFixed(3) + ')';
                hCtx.beginPath();
                hCtx.moveTo(p1.x, p1.y);
                hCtx.lineTo(p2.x, p2.y);
                hCtx.stroke();
            });

            // Draw glowing vertex nodes
            proj.forEach(function (p) {
                var color = getComputedStyle(root).getPropertyValue('--primary-rgb') || '255, 0, 60';
                var alpha = 0.25 + ((p.z + 1) / 2) * 0.5;
                hCtx.fillStyle = 'rgba(' + color.trim() + ', ' + alpha.toFixed(3) + ')';
                hCtx.beginPath();
                hCtx.arc(p.x, p.y, Math.max(1, 2.5 * p.scale), 0, Math.PI * 2);
                hCtx.fill();
            });

            requestAnimationFrame(render3DHero);
        }
        requestAnimationFrame(render3DHero);
    }

    /* ==========================================================================
       7. IMAGE LIGHTBOX MODAL
       ========================================================================== */
    var lightboxModal = $('lightboxModal');
    var lightboxImg = $('lightboxImg');
    var lightboxClose = $('lightboxClose');

    function openLightbox(src) {
        if (!lightboxModal || !lightboxImg) return;
        lightboxImg.src = src;
        lightboxModal.hidden = false;
        playSound('click');
    }

    function closeLightbox() {
        if (!lightboxModal) return;
        lightboxModal.hidden = true;
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxModal) {
        lightboxModal.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
    }

    document.querySelectorAll('.zoomable').forEach(function (el) {
        el.addEventListener('click', function () {
            var src = this.dataset.zoomSrc || this.querySelector('img').src;
            openLightbox(src);
        });
    });

    var zoomLeagueBtn = $('zoomLeagueBtn');
    if (zoomLeagueBtn) {
        zoomLeagueBtn.addEventListener('click', function () {
            openLightbox('Images/sapphire_league_rank1.png');
        });
    }

    // Lightbox delegation for any image in writeups, figures, and articles
    document.addEventListener('click', function (e) {
        var img = e.target.closest('.writeup-body img, .writeup-figure img, .writeup-article img, .proof-media img, .profile-pic');
        if (img && img.src && !img.closest('.avatar-holocube')) {
            openLightbox(img.src);
        }
    });

    /* ==========================================================================
       8. ARSENAL TAB FILTERING
       ========================================================================== */
    var arsenalTabs = document.querySelectorAll('.arsenal-tab');
    var skillCards = document.querySelectorAll('.skill-card');

    arsenalTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var domain = this.dataset.arsenal;
            arsenalTabs.forEach(function (t) { t.classList.remove('active'); });
            this.classList.add('active');
            playSound('click');

            skillCards.forEach(function (card) {
                if (domain === 'all' || card.dataset.domain === domain) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
            if (window.AOS) AOS.refresh();
        });
    });

    /* ==========================================================================
       9. WRITEUPS ARCHIVE SYSTEM (Search, Category, Difficulty, Layout, Sort)
       ========================================================================== */
    var writeups = window.WRITEUPS || [];
    var writeupsGrid = $('writeupsGrid');
    var writeupsTableBody = $('writeupsTableBody');
    var writeupsListView = $('writeupsListView');
    var searchInput = $('writeupSearch');
    var filtersWrap = $('writeupFilters');
    var diffChips = document.querySelectorAll('.diff-chip');
    var sortSelect = $('writeupSort');
    var emptyState = $('writeupsEmpty');
    var emptyQueryCmd = $('emptyQueryCmd');
    var resetSearchBtn = $('resetSearchBtn');
    var navWriteupCount = $('navWriteupCount');
    var writeupCountLive = $('writeupCountLive');
    var statWriteups = $('statWriteups');

    var activeCategory = 'all';
    var activeDifficulty = 'all';
    var activeLayout = 'grid'; // 'grid' | 'list'
    var currentPage = 1;
    var pageSize = 6;
    var paginationBar = $('writeupPagination');
    var paginationPages = $('paginationPages');
    var paginationPrevBtn = $('paginationPrevBtn');
    var paginationNextBtn = $('paginationNextBtn');
    var paginationInfo = $('paginationInfo');

    if (navWriteupCount) navWriteupCount.textContent = writeups.length;
    if (writeupCountLive) writeupCountLive.textContent = writeups.length;
    if (statWriteups) statWriteups.textContent = writeups.length;

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function diffBadgeClass(val) {
        var lower = String(val || '').toLowerCase();
        if (lower.indexOf('easy') !== -1) return 'badge diff-easy';
        if (lower.indexOf('medium') !== -1) return 'badge diff-medium';
        if (lower.indexOf('hard') !== -1 || lower.indexOf('insane') !== -1) return 'badge diff-hard';
        return 'badge ghost';
    }

    function sortWriteups(list, sortVal) {
        var sorted = list.slice();
        if (sortVal === 'date-desc') {
            sorted.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
        } else if (sortVal === 'diff-desc') {
            var score = { 'hard': 3, 'medium': 2, 'easy': 1 };
            sorted.sort(function (a, b) {
                var sa = score[(a.difficulty || '').toLowerCase()] || 0;
                var sb = score[(b.difficulty || '').toLowerCase()] || 0;
                return sb - sa;
            });
        } else if (sortVal === 'diff-asc') {
            var scoreAsc = { 'easy': 1, 'medium': 2, 'hard': 3 };
            sorted.sort(function (a, b) {
                var sa = scoreAsc[(a.difficulty || '').toLowerCase()] || 4;
                var sb = scoreAsc[(b.difficulty || '').toLowerCase()] || 4;
                return sa - sb;
            });
        } else if (sortVal === 'time-desc') {
            sorted.sort(function (a, b) { return (b.readingTime || 3) - (a.readingTime || 3); });
        } else if (sortVal === 'title-asc') {
            sorted.sort(function (a, b) { return a.title.localeCompare(b.title); });
        }
        return sorted;
    }

    function renderWriteups() {
        var query = (searchInput ? searchInput.value : '').trim().toLowerCase();
        var sortVal = sortSelect ? sortSelect.value : 'date-desc';

        var filtered = writeups.filter(function (item) {
            var text = (
                item.title + ' ' +
                (item.summary || '') + ' ' +
                (item.tags || []).join(' ') + ' ' +
                (item.platform || '') + ' ' +
                (item.category || '') + ' ' +
                (item.difficulty || '')
            ).toLowerCase();

            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesCat = activeCategory === 'all' || (item.tags || []).indexOf(activeCategory) !== -1;
            var matchesDiff = activeDifficulty === 'all' || (item.difficulty || '').toLowerCase() === activeDifficulty.toLowerCase();

            return matchesQuery && matchesCat && matchesDiff;
        });

        var displayList = sortWriteups(filtered, sortVal);
        var totalItems = displayList.length;
        var totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = Math.min(startIndex + pageSize, totalItems);
        var pagedList = displayList.slice(startIndex, endIndex);

        // Render Grid Cards
        if (writeupsGrid) {
            writeupsGrid.innerHTML = pagedList.map(function (item, idx) {
                var ghAction = item.githubUrl
                    ? '<a class="card-link github" href="' + escapeHtml(item.githubUrl) + '" target="_blank" rel="noopener" title="Open source directly on GitHub"><i class="fab fa-github"></i> Open on GitHub</a>'
                    : '';

                var tagPills = (item.tags || []).slice(0, 3).map(function (t) {
                    return '<span class="tag" data-tag="' + escapeHtml(t) + '">' + escapeHtml(t) + '</span>';
                }).join('');

                var typeLabel = escapeHtml((item.category || item.ext || 'CTF').toUpperCase());

                return '<article class="card writeup-card" data-url="' + escapeHtml(item.url) + '" data-aos="fade-up" data-aos-delay="' + ((idx % 3) * 60) + '">' +
                    '<div class="card-body">' +
                    '<div class="card-topline">' +
                    '<span class="badge card-type-pill"><i class="fas fa-crosshairs"></i> [TYPE: ' + typeLabel + ']</span>' +
                    (item.platform ? '<span class="badge">' + escapeHtml(item.platform) + '</span>' : '') +
                    (item.difficulty ? '<span class="' + diffBadgeClass(item.difficulty) + '">' + escapeHtml(item.difficulty) + '</span>' : '') +
                    '</div>' +
                    '<h3 class="card-title"><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p class="card-meta-line">' +
                    '<span><i class="fas fa-calendar"></i> ' + escapeHtml(item.date || '2026-09') + '</span>' +
                    '<span><i class="fas fa-clock"></i> ' + (item.readingTime || 3) + ' min read</span>' +
                    '</p>' +
                    '<p class="card-summary">' + escapeHtml(item.summary || '') + '</p>' +
                    '<div class="card-tags">' + tagPills + '</div>' +
                    '<div class="card-actions">' +
                    '<a class="card-link primary" href="' + escapeHtml(item.url) + '"><i class="fas fa-book-open"></i> Read Walkthrough</a>' +
                    ghAction +
                    '</div>' +
                    '</div></article>';
            }).join('');
        }

        // Render Compact List View
        if (writeupsTableBody) {
            writeupsTableBody.innerHTML = pagedList.map(function (item) {
                var ghIcon = item.githubUrl
                    ? ' <a href="' + escapeHtml(item.githubUrl) + '" target="_blank" rel="noopener" title="View on GitHub" style="margin-left:6px; color:var(--text-muted);"><i class="fab fa-github"></i></a>'
                    : '';

                var typeLabel = escapeHtml((item.category || item.ext || 'CTF').toUpperCase());

                return '<div class="terminal-row">' +
                    '<span class="col-status"><span class="badge card-type-pill">[' + typeLabel + ']</span></span>' +
                    '<span class="col-title"><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>' + ghIcon + '</span>' +
                    '<span class="col-cat">' + escapeHtml(item.category || '-') + '</span>' +
                    '<span class="col-diff"><span class="' + diffBadgeClass(item.difficulty) + '">' + escapeHtml(item.difficulty || '-') + '</span></span>' +
                    '<span class="col-date">' + escapeHtml(item.date || '-') + '</span>' +
                    '<span class="col-time">' + (item.readingTime || 3) + ' min</span>' +
                    '<span class="col-action">' +
                    '<a class="card-link small primary" href="' + escapeHtml(item.url) + '"><i class="fas fa-book-open"></i> Read</a>' +
                    (item.githubUrl ? '<a class="card-link small github" href="' + escapeHtml(item.githubUrl) + '" target="_blank" rel="noopener" title="Open on GitHub" style="margin-left:4px;"><i class="fab fa-github"></i></a>' : '') +
                    '</span>' +
                    '</div>';
            }).join('');
        }

        // Pagination Bar Updates
        if (paginationBar) {
            paginationBar.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        if (paginationInfo) {
            paginationInfo.textContent = 'Page ' + currentPage + ' of ' + totalPages + ' (' + totalItems + ' Writeups)';
        }
        if (paginationPrevBtn) {
            paginationPrevBtn.disabled = currentPage <= 1;
        }
        if (paginationNextBtn) {
            paginationNextBtn.disabled = currentPage >= totalPages;
        }
        if (paginationPages) {
            var pagesHtml = [];
            for (var p = 1; p <= totalPages; p++) {
                pagesHtml.push('<button class="page-num ' + (p === currentPage ? 'active' : '') + '" data-page="' + p + '" type="button" aria-label="Go to page ' + p + '">' + p + '</button>');
            }
            paginationPages.innerHTML = pagesHtml.join('');
        }

        // Empty state handling
        if (emptyState) {
            emptyState.hidden = totalItems > 0;
            if (emptyQueryCmd) {
                emptyQueryCmd.textContent = 'grep -i "' + (query || activeCategory || activeDifficulty) + '" ~/writeups/*.md';
            }
        }

        if (window.AOS) AOS.refresh();
    }

    function goToPage(p) {
        var query = (searchInput ? searchInput.value : '').trim().toLowerCase();
        var sortVal = sortSelect ? sortSelect.value : 'date-desc';
        var filtered = writeups.filter(function (item) {
            var text = (
                item.title + ' ' +
                (item.summary || '') + ' ' +
                (item.tags || []).join(' ') + ' ' +
                (item.platform || '') + ' ' +
                (item.category || '') + ' ' +
                (item.difficulty || '')
            ).toLowerCase();
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesCat = activeCategory === 'all' || (item.tags || []).indexOf(activeCategory) !== -1;
            var matchesDiff = activeDifficulty === 'all' || (item.difficulty || '').toLowerCase() === activeDifficulty.toLowerCase();
            return matchesQuery && matchesCat && matchesDiff;
        });
        var totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        if (p < 1) p = 1;
        if (p > totalPages) p = totalPages;
        if (p === currentPage) return;
        currentPage = p;
        renderWriteups();
        playSound('click');

        var writeupsSec = $('writeups');
        if (writeupsSec && window.pageYOffset > writeupsSec.offsetTop + 150) {
            window.scrollTo({ top: writeupsSec.offsetTop - 30, behavior: prefersReduced ? 'auto' : 'smooth' });
        }
    }

    if (paginationPrevBtn) {
        paginationPrevBtn.addEventListener('click', function () {
            if (currentPage > 1) goToPage(currentPage - 1);
        });
    }

    if (paginationNextBtn) {
        paginationNextBtn.addEventListener('click', function () {
            goToPage(currentPage + 1);
        });
    }

    if (paginationPages) {
        paginationPages.addEventListener('click', function (e) {
            var btn = e.target.closest('.page-num');
            if (btn && btn.dataset.page) {
                goToPage(parseInt(btn.dataset.page, 10));
            }
        });
    }

    function buildCategoryFilters() {
        if (!filtersWrap) return;
        var counts = {};
        writeups.forEach(function (item) {
            (item.tags || []).forEach(function (tag) {
                counts[tag] = (counts[tag] || 0) + 1;
            });
        });

        // Top popular categories
        var priority = ['Web', 'Forensics', 'OSINT', 'Cryptography', 'Windows', 'Medium', 'Easy', 'Hard'];
        var tags = Object.keys(counts).sort(function (a, b) {
            var pa = priority.indexOf(a), pb = priority.indexOf(b);
            if (pa !== -1 && pb !== -1) return pa - pb;
            if (pa !== -1) return -1;
            if (pb !== -1) return 1;
            return counts[b] - counts[a];
        }).slice(0, 9);

        var chips = ['<button class="chip active" data-cat="all" type="button">All <span class="chip-count">' + writeups.length + '</span></button>'];
        tags.forEach(function (tag) {
            chips.push('<button class="chip" data-cat="' + escapeHtml(tag) + '" type="button">' + escapeHtml(tag) +
                ' <span class="chip-count">' + counts[tag] + '</span></button>');
        });
        filtersWrap.innerHTML = chips.join('');

        filtersWrap.addEventListener('click', function (e) {
            var chip = e.target.closest('.chip');
            if (!chip) return;
            activeCategory = chip.dataset.cat;
            filtersWrap.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
            chip.classList.add('active');
            playSound('click');
            currentPage = 1;
            renderWriteups();
        });
    }

    // Difficulty Chip handlers
    diffChips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeDifficulty = this.dataset.diff;
            diffChips.forEach(function (c) { c.classList.remove('active'); });
            this.classList.add('active');
            playSound('click');
            currentPage = 1;
            renderWriteups();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentPage = 1;
            renderWriteups();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            playSound('click');
            currentPage = 1;
            renderWriteups();
        });
    }

    if (resetSearchBtn) {
        resetSearchBtn.addEventListener('click', function () {
            if (searchInput) searchInput.value = '';
            activeCategory = 'all';
            activeDifficulty = 'all';
            currentPage = 1;
            if (filtersWrap) {
                filtersWrap.querySelectorAll('.chip').forEach(function (c) {
                    c.classList.toggle('active', c.dataset.cat === 'all');
                });
            }
            diffChips.forEach(function (c) {
                c.classList.toggle('active', c.dataset.diff === 'all');
            });
            renderWriteups();
            playSound('success');
        });
    }

    // Layout Toggle Buttons (Grid vs List)
    var viewGridBtn = $('viewGridBtn');
    var viewListBtn = $('viewListBtn');
    if (viewGridBtn && viewListBtn && writeupsGrid && writeupsListView) {
        viewGridBtn.addEventListener('click', function () {
            activeLayout = 'grid';
            viewGridBtn.classList.add('active');
            viewListBtn.classList.remove('active');
            writeupsGrid.hidden = false;
            writeupsListView.hidden = true;
            playSound('click');
        });

        viewListBtn.addEventListener('click', function () {
            activeLayout = 'list';
            viewListBtn.classList.add('active');
            viewGridBtn.classList.remove('active');
            writeupsGrid.hidden = true;
            writeupsListView.hidden = false;
            playSound('click');
        });
    }

    // Tag click filters category
    document.addEventListener('click', function (e) {
        var tag = e.target.closest('.tag');
        if (tag && filtersWrap) {
            var cat = tag.dataset.tag;
            var chip = filtersWrap.querySelector('.chip[data-cat="' + CSS.escape(cat) + '"]');
            if (chip) chip.click();
            else {
                activeCategory = cat;
                currentPage = 1;
                renderWriteups();
            }
        }
    });

    buildCategoryFilters();
    renderWriteups();

    /* ==========================================================================
       10. QUICK-READER MODAL (In-page full writeup reader)
       ========================================================================== */
    var readerModal = $('readerModal');
    var readerModalTitle = $('readerModalTitle');
    var readerModalBody = $('readerModalBody');
    var readerCloseBtn = $('readerCloseBtn');
    var readerCloseDot = $('readerCloseDot');
    var readerExternalLink = $('readerExternalLink');
    var readerPdfLink = $('readerPdfLink');

    var writeupCache = {};

    function openQuickReader(slug) {
        if (!readerModal || !readerModalBody) return;
        var item = writeups.find(function (w) { return w.slug === slug; });
        if (!item) return;

        readerModalTitle.textContent = item.title + ' // writeup';
        readerExternalLink.href = item.url;

        if (item.pdfUrl) {
            readerPdfLink.href = item.pdfUrl;
            readerPdfLink.hidden = false;
        } else {
            readerPdfLink.hidden = true;
        }

        readerModal.hidden = false;
        playSound('click');

        if (writeupCache[slug]) {
            readerModalBody.innerHTML = writeupCache[slug];
            attachCopyHandlers(readerModalBody);
            return;
        }

        readerModalBody.innerHTML = '<div class="reader-loading"><i class="fas fa-circle-notch fa-spin"></i> Fetching writeup data...</div>';

        fetch(item.url)
            .then(function (res) { return res.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                var article = doc.querySelector('.writeup-article') || doc.querySelector('main') || doc.body;
                var rendered = article.innerHTML;
                writeupCache[slug] = rendered;
                readerModalBody.innerHTML = rendered;
                attachCopyHandlers(readerModalBody);
            })
            .catch(function (err) {
                readerModalBody.innerHTML = '<div class="empty-state"><p class="form-status error">Could not load writeup directly: ' + escapeHtml(err.message) + '</p>' +
                    '<p><a class="cyber-btn primary" href="' + escapeHtml(item.url) + '">Open Standalone Page &rarr;</a></p></div>';
            });
    }

    function closeQuickReader() {
        if (!readerModal) return;
        readerModal.hidden = true;
    }

    if (readerCloseBtn) readerCloseBtn.addEventListener('click', closeQuickReader);
    if (readerCloseDot) readerCloseDot.addEventListener('click', closeQuickReader);
    if (readerModal) {
        readerModal.addEventListener('click', function (e) {
            if (e.target === readerModal) closeQuickReader();
        });
    }

    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.quick-view-btn');
        if (btn && btn.dataset.slug) {
            e.preventDefault();
            openQuickReader(btn.dataset.slug);
            return;
        }

        var card = e.target.closest('.card.writeup-card');
        if (card && card.dataset.url) {
            if (e.target.closest('a, button, input, select, textarea, .tag')) return;
            window.location.href = card.dataset.url;
        }
    });

    function attachCopyHandlers(container) {
        container.querySelectorAll('pre').forEach(function (block) {
            if (block.querySelector('.code-copy-btn')) return;
            var code = block.querySelector('code');
            if (!code) return;

            var copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className = 'tool-inline-btn code-copy-btn';
            copyBtn.style.cssText = 'position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.5); padding:3px 8px; border-radius:3px;';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> copy';

            copyBtn.addEventListener('click', function () {
                var text = code.innerText;
                var done = function () {
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> copied';
                    playSound('success');
                    setTimeout(function () { copyBtn.innerHTML = '<i class="fas fa-copy"></i> copy'; }, 1500);
                };
                if (navigator.clipboard) navigator.clipboard.writeText(text).then(done).catch(done);
                else done();
            });

            block.style.position = 'relative';
            block.appendChild(copyBtn);
        });
    }

    /* ==========================================================================
       11. SECURITY PROJECTS & WORKSTATION SUITE (8 Tactical Engines)
       ========================================================================== */
    // Workstation Tab Switching & Deep-Linking (projects.html & index.html)
    var projectTabs = document.querySelectorAll('.workstation-tab');
    var projectPanes = {
        'jwt': $('paneProjJwt'),
        'headers': $('paneProjHeaders'),
        'cidr': $('paneProjCidr'),
        'cve': $('paneProjCve'),
        'url': $('paneProjUrl'),
        'regex': $('paneProjRegex'),
        'time': $('paneProjTime'),
        'json': $('paneProjJson')
    };

    function activateProjectTab(selected, shouldScroll) {
        if (!selected || !projectPanes[selected]) return;
        projectTabs.forEach(function (t) {
            if (t.dataset.project === selected) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        Object.keys(projectPanes).forEach(function (key) {
            if (projectPanes[key]) {
                projectPanes[key].hidden = key !== selected;
                if (key === selected) {
                    projectPanes[key].classList.add('active');
                } else {
                    projectPanes[key].classList.remove('active');
                }
            }
        });

        if (shouldScroll) {
            var workstation = document.querySelector('.projects-workstation') || projectPanes[selected];
            if (workstation) {
                setTimeout(function () {
                    workstation.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 150);
            }
        }
    }

    projectTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var selected = this.dataset.project;
            activateProjectTab(selected, false);
            playSound('click');
        });
    });

    // Deep-linking in projects.html via URL search params (e.g. ?tool=cve) or hash (#cve)
    (function checkUrlProjectParam() {
        var params = new URLSearchParams(window.location.search);
        var targetTool = params.get('tool') || params.get('project');
        if (!targetTool && window.location.hash) {
            var hashMatch = window.location.hash.match(/#(?:tool-|paneProj)?([a-z0-9_-]+)/i);
            if (hashMatch && projectPanes[hashMatch[1].toLowerCase()]) {
                targetTool = hashMatch[1].toLowerCase();
            }
        }
        if (targetTool && projectPanes[targetTool]) {
            activateProjectTab(targetTool, true);
        }
    })();

    // Project Cards Category Filtering & Click Delegation on index.html
    var projectCategoryFilters = document.getElementById('projectCategoryFilters');
    var toolProjectCards = document.querySelectorAll('.tool-project-card');

    if (projectCategoryFilters && toolProjectCards.length) {
        var filterBtns = projectCategoryFilters.querySelectorAll('button[data-project-filter]');
        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var filterVal = this.dataset.projectFilter;
                filterBtns.forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');
                playSound('click');

                toolProjectCards.forEach(function (card) {
                    var cardCat = card.dataset.projectCat;
                    if (filterVal === 'all' || cardCat === filterVal) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Card-level click delegation for project cards
    toolProjectCards.forEach(function (card) {
        card.addEventListener('click', function (e) {
            if (e.target.closest('a') || e.target.closest('button')) return;
            var toolId = this.dataset.tool || 'jwt';
            window.location.href = 'projects.html?tool=' + encodeURIComponent(toolId);
        });
    });

    // --------------------------------------------------------------------------
    // 1. JWT ANALYZER & AUDITOR ENGINE
    // --------------------------------------------------------------------------
    var jwtInput = $('jwtInput');
    var jwtColorPreview = $('jwtColorPreview');
    var jwtAuditStatus = $('jwtAuditStatus');
    var jwtHeaderOut = $('jwtHeaderOut');
    var jwtPayloadOut = $('jwtPayloadOut');
    var clearJwtBtn = $('clearJwtBtn');
    var copyJwtJsonBtn = $('copyJwtJsonBtn');

    function base64UrlDecode(str) {
        var base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        try {
            var decoded = atob(base64);
            return decodeURIComponent(escape(decoded));
        } catch (e) {
            return atob(base64);
        }
    }

    function analyzeJwt() {
        if (!jwtInput) return;
        var token = jwtInput.value.trim();

        if (!token) {
            if (jwtColorPreview) jwtColorPreview.innerHTML = '';
            if (jwtAuditStatus) {
                jwtAuditStatus.className = 'jwt-audit-banner';
                jwtAuditStatus.textContent = 'Paste a JWT token above to decode headers, inspect claims, and audit security signatures.';
            }
            if (jwtHeaderOut) jwtHeaderOut.textContent = '// Header JSON will appear here';
            if (jwtPayloadOut) jwtPayloadOut.textContent = '// Payload JSON will appear here';
            return;
        }

        var parts = token.split('.');
        if (parts.length < 2) {
            if (jwtAuditStatus) {
                jwtAuditStatus.className = 'jwt-audit-banner warning';
                jwtAuditStatus.textContent = '[!] Malformed JWT: Expected dot-separated token (header.payload[.signature])';
            }
            return;
        }

        var headerStr = parts[0], payloadStr = parts[1], sigStr = parts[2] || '';

        // Color preview
        if (jwtColorPreview) {
            jwtColorPreview.innerHTML =
                '<span class="jwt-part header">' + escapeHtml(headerStr) + '</span>' +
                '<span style="color:var(--text-dim);">.</span>' +
                '<span class="jwt-part payload">' + escapeHtml(payloadStr) + '</span>' +
                (sigStr ? '<span style="color:var(--text-dim);">.</span><span class="jwt-part signature">' + escapeHtml(sigStr) + '</span>' : '');
        }

        var headerObj = null, payloadObj = null;
        try {
            headerObj = JSON.parse(base64UrlDecode(headerStr));
            if (jwtHeaderOut) jwtHeaderOut.textContent = JSON.stringify(headerObj, null, 2);
        } catch (e) {
            if (jwtHeaderOut) jwtHeaderOut.textContent = '// Error decoding header: ' + e.message;
        }

        try {
            payloadObj = JSON.parse(base64UrlDecode(payloadStr));
            if (jwtPayloadOut) jwtPayloadOut.textContent = JSON.stringify(payloadObj, null, 2);
        } catch (e) {
            if (jwtPayloadOut) jwtPayloadOut.textContent = '// Error decoding payload: ' + e.message;
        }

        // Security Audit
        if (jwtAuditStatus && headerObj) {
            var warnings = [];
            var isCrit = false;
            var alg = (headerObj.alg || '').toLowerCase();

            if (alg === 'none' || !headerObj.alg) {
                warnings.push('CRITICAL: Algorithm is set to "none" — Signature verification bypass risk (CVE-2015-9235)!');
                isCrit = true;
            } else if (alg === 'hs256' && (!sigStr || sigStr.length < 10)) {
                warnings.push('CRITICAL: Empty or stripped signature on HMAC-SHA256 token.');
                isCrit = true;
            }

            if (payloadObj && payloadObj.exp) {
                var expMs = payloadObj.exp * 1000;
                var now = Date.now();
                var expDate = new Date(expMs).toUTCString();
                if (expMs < now) {
                    var diffSec = Math.round((now - expMs) / 1000);
                    var diffHr = (diffSec / 3600).toFixed(1);
                    warnings.push('EXPIRED: Token expired on ' + expDate + ' (' + diffHr + ' hours ago).');
                    if (!isCrit) isCrit = false;
                } else {
                    var remHr = ((expMs - now) / 3600000).toFixed(1);
                    warnings.push('VALID EXPIRY: Active until ' + expDate + ' (in ' + remHr + ' hours).');
                }
            } else if (payloadObj) {
                warnings.push('WARNING: No "exp" expiration claim present — Token does not expire automatically.');
            }

            if (payloadObj && payloadObj.nbf && payloadObj.nbf * 1000 > Date.now()) {
                warnings.push('NOT YET VALID: "nbf" claim is in the future.');
            }

            if (isCrit) {
                jwtAuditStatus.className = 'jwt-audit-banner critical';
                jwtAuditStatus.innerHTML = '<i class="fas fa-triangle-exclamation"></i> ' + warnings.join('<br><i class="fas fa-triangle-exclamation"></i> ');
            } else if (warnings.some(function (w) { return w.indexOf('EXPIRED') !== -1; })) {
                jwtAuditStatus.className = 'jwt-audit-banner warning';
                jwtAuditStatus.innerHTML = '<i class="fas fa-clock"></i> ' + warnings.join('<br><i class="fas fa-info-circle"></i> ');
            } else {
                jwtAuditStatus.className = 'jwt-audit-banner valid';
                jwtAuditStatus.innerHTML = '<i class="fas fa-shield-check"></i> ' + (warnings.length ? warnings.join('<br><i class="fas fa-shield-check"></i> ') : 'JWT structure valid.');
            }
        }
    }

    if (jwtInput) jwtInput.addEventListener('input', analyzeJwt);
    if (clearJwtBtn && jwtInput) {
        clearJwtBtn.addEventListener('click', function () {
            jwtInput.value = '';
            analyzeJwt();
            playSound('click');
        });
    }

    if (copyJwtJsonBtn && jwtPayloadOut) {
        copyJwtJsonBtn.addEventListener('click', function () {
            var text = jwtPayloadOut.textContent;
            if (!text || text.startsWith('//')) return;
            navigator.clipboard.writeText(text).then(function () {
                showToast('Decoded JWT Claims Copied!', 'fas fa-copy');
                playSound('success');
            });
        });
    }

    // JWT Presets
    var jwtSampleValid = $('jwtSampleValid');
    var jwtSampleExpired = $('jwtSampleExpired');
    var jwtSampleNone = $('jwtSampleNone');

    if (jwtSampleValid && jwtInput) {
        jwtSampleValid.addEventListener('click', function () {
            var futureEpoch = Math.floor(Date.now() / 1000) + 86400 * 7;
            var h = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, '');
            var p = btoa(JSON.stringify({ sub: "sameekey", role: "security-auditor", exp: futureEpoch, iss: "trybankme.thm" })).replace(/=/g, '');
            var s = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
            jwtInput.value = h + '.' + p + '.' + s;
            analyzeJwt();
            playSound('click');
        });
    }

    if (jwtSampleExpired && jwtInput) {
        jwtSampleExpired.addEventListener('click', function () {
            var pastEpoch = 1577836800; // Jan 1, 2020
            var h = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" })).replace(/=/g, '');
            var p = btoa(JSON.stringify({ sub: "admin", clearance: "omega", exp: pastEpoch, iat: 1577833200 })).replace(/=/g, '');
            var s = "kE61jP7oIomqQz_sample_sig_revoked";
            jwtInput.value = h + '.' + p + '.' + s;
            analyzeJwt();
            playSound('click');
        });
    }

    if (jwtSampleNone && jwtInput) {
        jwtSampleNone.addEventListener('click', function () {
            var h = btoa(JSON.stringify({ alg: "none", typ: "JWT" })).replace(/=/g, '');
            var p = btoa(JSON.stringify({ sub: "administrator", role: "superuser", access: "unrestricted" })).replace(/=/g, '');
            jwtInput.value = h + '.' + p + '.';
            analyzeJwt();
            playSound('click');
        });
    }

    // --------------------------------------------------------------------------
    // 2. HTTP SECURITY HEADER ANALYZER & AUDITOR ENGINE
    // --------------------------------------------------------------------------
    var headersInput = $('headersInput');
    var headersGradeBadge = $('headersGradeBadge');
    var headersResults = $('headersResults');
    var clearHeadersBtn = $('clearHeadersBtn');

    function analyzeHeaders() {
        if (!headersInput || !headersResults) return;
        var raw = headersInput.value.trim();
        if (!raw) {
            headersResults.innerHTML = '<p class="hash-hint">Paste raw HTTP response headers to evaluate CSP, HSTS, X-Frame-Options, CORS, and dangerous info leakage.</p>';
            if (headersGradeBadge) {
                headersGradeBadge.textContent = 'GRADE --';
                headersGradeBadge.className = 'headers-grade grade-c';
            }
            return;
        }

        var lines = raw.split(/\r?\n/);
        var headerMap = {};
        lines.forEach(function (l) {
            var idx = l.indexOf(':');
            if (idx > 0) {
                var k = l.substring(0, idx).trim().toLowerCase();
                var v = l.substring(idx + 1).trim();
                headerMap[k] = v;
            }
        });

        var audits = [];
        var score = 100;

        // Content-Security-Policy
        if (headerMap['content-security-policy']) {
            var csp = headerMap['content-security-policy'];
            if (csp.indexOf('unsafe-inline') !== -1 || csp.indexOf('unsafe-eval') !== -1 || csp.indexOf('*') !== -1) {
                score -= 10;
                audits.push({ status: 'warn', name: 'Content-Security-Policy', desc: 'Present but contains weak directives (unsafe-inline / unsafe-eval / wildcard *).' });
            } else {
                audits.push({ status: 'pass', name: 'Content-Security-Policy', desc: 'Strict CSP configured protecting against XSS & data exfiltration.' });
            }
        } else {
            score -= 25;
            audits.push({ status: 'fail', name: 'Content-Security-Policy', desc: 'Missing! Highly vulnerable to Cross-Site Scripting (XSS) and content injection.' });
        }

        // Strict-Transport-Security
        if (headerMap['strict-transport-security']) {
            var hsts = headerMap['strict-transport-security'];
            if (hsts.indexOf('max-age') !== -1) {
                audits.push({ status: 'pass', name: 'Strict-Transport-Security', desc: 'Enforces HTTPS encryption (' + hsts + ').' });
            } else {
                score -= 10;
                audits.push({ status: 'warn', name: 'Strict-Transport-Security', desc: 'HSTS present but missing valid max-age directive.' });
            }
        } else {
            score -= 20;
            audits.push({ status: 'fail', name: 'Strict-Transport-Security', desc: 'Missing! Vulnerable to SSL stripping and insecure HTTP downgrade attacks.' });
        }

        // X-Frame-Options
        if (headerMap['x-frame-options']) {
            var xfo = headerMap['x-frame-options'].toUpperCase();
            if (xfo === 'DENY' || xfo === 'SAMEORIGIN') {
                audits.push({ status: 'pass', name: 'X-Frame-Options', desc: 'Protected against Clickjacking attacks (' + xfo + ').' });
            } else {
                audits.push({ status: 'warn', name: 'X-Frame-Options', desc: 'Non-standard policy: ' + xfo });
            }
        } else {
            score -= 15;
            audits.push({ status: 'fail', name: 'X-Frame-Options', desc: 'Missing! Clickjacking defense disabled (can be embedded in malicious iframes).' });
        }

        // X-Content-Type-Options
        if (headerMap['x-content-type-options'] && headerMap['x-content-type-options'].toLowerCase() === 'nosniff') {
            audits.push({ status: 'pass', name: 'X-Content-Type-Options', desc: 'MIME sniffing prevention active (nosniff).' });
        } else {
            score -= 10;
            audits.push({ status: 'fail', name: 'X-Content-Type-Options', desc: 'Missing "nosniff" directive. Browsers may execute text files as script.' });
        }

        // Referrer-Policy
        if (headerMap['referrer-policy']) {
            audits.push({ status: 'pass', name: 'Referrer-Policy', desc: 'Configured (' + headerMap['referrer-policy'] + ').' });
        } else {
            score -= 5;
            audits.push({ status: 'warn', name: 'Referrer-Policy', desc: 'Missing. Referer URLs with query parameters may leak to external origins.' });
        }

        // Information Leakage Checks
        if (headerMap['server']) {
            score -= 5;
            audits.push({ status: 'warn', name: 'Information Disclosure: Server', desc: 'Discloses web server banner: "' + escapeHtml(headerMap['server']) + '". Remove in production.' });
        }
        if (headerMap['x-powered-by']) {
            score -= 10;
            audits.push({ status: 'fail', name: 'Information Disclosure: X-Powered-By', desc: 'Discloses framework / runtime: "' + escapeHtml(headerMap['x-powered-by']) + '".' });
        }
        if (headerMap['x-aspnet-version']) {
            score -= 10;
            audits.push({ status: 'fail', name: 'Information Disclosure: ASP.NET', desc: 'Discloses framework version: "' + escapeHtml(headerMap['x-aspnet-version']) + '".' });
        }

        score = Math.max(0, Math.min(100, score));
        var grade = 'F';
        var gradeCls = 'grade-f';

        if (score >= 90) { grade = 'A+'; gradeCls = 'grade-a'; }
        else if (score >= 80) { grade = 'A'; gradeCls = 'grade-a'; }
        else if (score >= 65) { grade = 'B'; gradeCls = 'grade-b'; }
        else if (score >= 50) { grade = 'C'; gradeCls = 'grade-c'; }
        else if (score >= 35) { grade = 'D'; gradeCls = 'grade-d'; }

        if (headersGradeBadge) {
            headersGradeBadge.textContent = 'GRADE ' + grade + ' (' + score + '/100)';
            headersGradeBadge.className = 'headers-grade ' + gradeCls;
        }

        var html = '<div class="headers-audit-list">';
        audits.forEach(function (a) {
            var icon = a.status === 'pass' ? 'fa-circle-check' : (a.status === 'warn' ? 'fa-triangle-exclamation' : 'fa-circle-xmark');
            var badgeText = a.status === 'pass' ? 'SECURED' : (a.status === 'warn' ? 'WARNING' : 'CRITICAL');
            html += '<div class="audit-item ' + a.status + '">' +
                '<div class="audit-item-top">' +
                '<span class="audit-name"><i class="fas ' + icon + '"></i> ' + escapeHtml(a.name) + '</span>' +
                '<span class="audit-badge ' + a.status + '">' + badgeText + '</span>' +
                '</div>' +
                '<p class="audit-desc">' + escapeHtml(a.desc) + '</p>' +
                '</div>';
        });
        html += '</div>';

        // Remediation Nginx config recommendation
        html += '<div class="remediation-box">' +
            '<h4 class="remedy-title"><i class="fas fa-file-shield"></i> Hardened Nginx / Apache Directive Checklist</h4>' +
            '<pre class="remedy-code"># Add to server {} block:\n' +
            'add_header X-Frame-Options "DENY" always;\n' +
            'add_header X-Content-Type-Options "nosniff" always;\n' +
            'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;\n' +
            'add_header Content-Security-Policy "default-src \'self\'; script-src \'self\'; object-src \'none\';" always;\n' +
            'add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n' +
            'server_tokens off;</pre>' +
            '</div>';

        headersResults.innerHTML = html;
    }

    if (headersInput) headersInput.addEventListener('input', analyzeHeaders);
    if (clearHeadersBtn && headersInput) {
        clearHeadersBtn.addEventListener('click', function () {
            headersInput.value = '';
            analyzeHeaders();
            playSound('click');
        });
    }

    var hdrPresetHardened = $('hdrPresetHardened');
    var hdrPresetVulnerable = $('hdrPresetVulnerable');

    if (hdrPresetHardened && headersInput) {
        hdrPresetHardened.addEventListener('click', function () {
            headersInput.value =
                'HTTP/2 200 OK\n' +
                'Content-Type: text/html; charset=UTF-8\n' +
                'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload\n' +
                'Content-Security-Policy: default-src \'self\'; img-src \'self\' data:; script-src \'self\'; frame-ancestors \'none\';\n' +
                'X-Frame-Options: DENY\n' +
                'X-Content-Type-Options: nosniff\n' +
                'Referrer-Policy: strict-origin-when-cross-origin\n' +
                'Permissions-Policy: camera=(), microphone=(), geolocation=()';
            analyzeHeaders();
            playSound('click');
        });
    }

    if (hdrPresetVulnerable && headersInput) {
        hdrPresetVulnerable.addEventListener('click', function () {
            headersInput.value =
                'HTTP/1.1 200 OK\n' +
                'Date: Sun, 24 Aug 2026 12:00:00 GMT\n' +
                'Server: Apache/2.4.41 (Ubuntu)\n' +
                'X-Powered-By: PHP/7.4.3\n' +
                'Content-Type: text/html; charset=UTF-8\n' +
                'Connection: keep-alive';
            analyzeHeaders();
            playSound('click');
        });
    }

    // --------------------------------------------------------------------------
    // 3. CIDR / IP SUBNET CALCULATOR ENGINE
    // --------------------------------------------------------------------------
    var cidrInput = $('cidrInput');
    var cidrTableBody = $('cidrTableBody');

    function intToIp(int) {
        return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.');
    }

    function intToBinary(int) {
        var str = (int >>> 0).toString(2).padStart(32, '0');
        return str.substr(0, 8) + '.' + str.substr(8, 8) + '.' + str.substr(16, 8) + '.' + str.substr(24, 8);
    }

    function calculateCidr() {
        if (!cidrInput || !cidrTableBody) return;
        var val = cidrInput.value.trim();
        if (!val) {
            cidrTableBody.innerHTML = '<tr><td colspan="2" class="hash-hint">Enter an IP address and CIDR prefix (e.g. 192.168.1.1/24)</td></tr>';
            return;
        }

        var parts = val.split('/');
        var ipStr = parts[0].trim();
        var mask = parts.length > 1 ? parseInt(parts[1], 10) : 24;

        if (isNaN(mask) || mask < 0 || mask > 32) mask = 24;

        var octets = ipStr.split('.');
        if (octets.length !== 4) {
            cidrTableBody.innerHTML = '<tr><td colspan="2" class="form-status error">[!] Invalid IPv4 Address Format (Must contain 4 dotted octets)</td></tr>';
            return;
        }

        for (var o = 0; o < 4; o++) {
            var num = parseInt(octets[o], 10);
            if (isNaN(num) || num < 0 || num > 255) {
                cidrTableBody.innerHTML = '<tr><td colspan="2" class="form-status error">[!] Octet ' + (o + 1) + ' out of range (0-255)</td></tr>';
                return;
            }
        }

        var ipInt = ((parseInt(octets[0], 10) << 24) |
                     (parseInt(octets[1], 10) << 16) |
                     (parseInt(octets[2], 10) << 8) |
                     parseInt(octets[3], 10)) >>> 0;

        var netmask = mask === 0 ? 0 : ((0xFFFFFFFF << (32 - mask)) >>> 0);
        var wildcard = (~netmask) >>> 0;
        var network = (ipInt & netmask) >>> 0;
        var broadcast = (network | wildcard) >>> 0;

        var firstUsable = (mask >= 31) ? network : (network + 1) >>> 0;
        var lastUsable = (mask >= 31) ? broadcast : (broadcast - 1) >>> 0;
        var usableCount = mask === 32 ? 1 : (mask === 31 ? 2 : Math.max(0, Math.pow(2, 32 - mask) - 2));
        var totalAddresses = Math.pow(2, 32 - mask);

        // Class & Scope
        var firstOctet = parseInt(octets[0], 10);
        var ipClass = 'Class A';
        if (firstOctet >= 128 && firstOctet <= 191) ipClass = 'Class B';
        else if (firstOctet >= 192 && firstOctet <= 223) ipClass = 'Class C';
        else if (firstOctet >= 224 && firstOctet <= 239) ipClass = 'Class D (Multicast)';
        else if (firstOctet >= 240) ipClass = 'Class E (Reserved)';

        var isPrivate = false;
        if (firstOctet === 10) isPrivate = true;
        if (firstOctet === 172 && parseInt(octets[1], 10) >= 16 && parseInt(octets[1], 10) <= 31) isPrivate = true;
        if (firstOctet === 192 && parseInt(octets[1], 10) === 168) isPrivate = true;
        if (firstOctet === 127) isPrivate = true;

        var scope = isPrivate ? '<span class="badge diff-medium">RFC 1918 Private Subnet</span>' : '<span class="badge diff-hard">Public Routable IP</span>';

        var rows = [
            ['IP Address (Provided)', escapeHtml(intToIp(ipInt))],
            ['Subnet Netmask', escapeHtml(intToIp(netmask)) + ' (/ ' + mask + ')'],
            ['Wildcard Mask', escapeHtml(intToIp(wildcard))],
            ['Network Address', '<strong>' + escapeHtml(intToIp(network)) + '</strong>'],
            ['Broadcast Address', '<strong>' + escapeHtml(intToIp(broadcast)) + '</strong>'],
            ['Usable Host Range', escapeHtml(intToIp(firstUsable)) + ' &rarr; ' + escapeHtml(intToIp(lastUsable))],
            ['Total Usable Hosts', '<strong>' + usableCount.toLocaleString() + '</strong> usable devices'],
            ['Total Subnet Addresses', totalAddresses.toLocaleString() + ' IPs'],
            ['Address Class & Scope', ipClass + ' &bull; ' + scope],
            ['Binary Netmask', '<code style="font-size:0.75rem; color:var(--text-muted);">' + intToBinary(netmask) + '</code>'],
            ['Binary IP Address', '<code style="font-size:0.75rem; color:var(--primary);">' + intToBinary(ipInt) + '</code>']
        ];

        cidrTableBody.innerHTML = rows.map(function (r) {
            return '<tr><td class="cidr-label">' + r[0] + '</td><td class="cidr-value">' + r[1] + '</td></tr>';
        }).join('');
    }

    if (cidrInput) {
        cidrInput.addEventListener('input', calculateCidr);
        calculateCidr();
    }

    document.querySelectorAll('.cidr-quick-select .tool-opt-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (!cidrInput) return;
            var mask = this.dataset.mask;
            var curr = cidrInput.value.split('/')[0] || '192.168.1.1';
            cidrInput.value = curr + '/' + mask;
            calculateCidr();
            playSound('click');
        });
    });

    // --------------------------------------------------------------------------
    // 4. CVE LOOKUP & EXPLOIT RADAR ENGINE
    // --------------------------------------------------------------------------
    var cveInput = $('cveInput');
    var cveSearchBtn = $('cveSearchBtn');
    var cveResultPanel = $('cveResultPanel');

    // Comprehensive Offline Vulnerability Intelligence Database
    var cveDatabase = {
        'CVE-2021-44228': {
            name: 'Log4Shell (Apache Log4j RCE)',
            cvss: 10.0,
            severity: 'CRITICAL',
            vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
            cwe: 'CWE-502: Deserialization of Untrusted Data / JNDI Lookup',
            affected: 'Apache Log4j 2.0-beta9 through 2.15.0',
            description: 'Apache Log4j2 JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP and other JNDI related endpoints. An attacker who can control log messages or log message parameters can execute arbitrary code loaded from LDAP servers when message lookup substitution is enabled.',
            exploit: 'Public PoC, Weaponized Metasploit, Active In-The-Wild Exploitation',
            patch: 'Upgrade to Log4j 2.17.1+ or set log4j2.formatMsgNoLookups=true'
        },
        'CVE-2017-0144': {
            name: 'EternalBlue (MS17-010 SMBv1 RCE)',
            cvss: 9.8,
            severity: 'CRITICAL',
            vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
            cwe: 'CWE-119: Memory Corruption in SMBv1',
            affected: 'Microsoft Windows Vista, 7, 8.1, 10, Server 2008/2012/2016',
            description: 'The SMBv1 server in Microsoft Windows allows remote attackers to execute arbitrary code via crafted packets, as weaponized by the NSA and leaked by Shadow Brokers, leading directly to the WannaCry and NotPetya global ransomware outbreaks.',
            exploit: 'Metasploit exploit/windows/smb/ms17_010_eternalblue, AutoBlue PoC',
            patch: 'Apply Microsoft Security Bulletin MS17-010 and disable SMBv1 across domain'
        },
        'CVE-2024-3094': {
            name: 'XZ Utils Liblzma Upstream Supply Chain Backdoor',
            cvss: 10.0,
            severity: 'CRITICAL',
            vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
            cwe: 'CWE-506: Embedded Malicious Code (Software Supply Chain)',
            affected: 'xz-utils and liblzma versions 5.6.0 and 5.6.1',
            description: 'Malicious code was embedded in upstream tarballs of XZ Utils starting from version 5.6.0. Through complex obfuscation during M4 configuration, the modified build process intercepts RSA decryption functions in OpenSSH sshd (via systemd socket activation), granting unauthorized RCE capabilities to the actor holding private keys.',
            exploit: 'Supply chain compromise discovered by Andres Freund',
            patch: 'Downgrade to xz 5.4.x immediately or upgrade to verified patched distribution builds'
        },
        'CVE-2023-38606': {
            name: 'Apple iOS/macOS Kernel Memory MMIO Exploit (Operation Triangulation)',
            cvss: 7.8,
            severity: 'HIGH',
            vector: 'CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
            cwe: 'CWE-125 / Hardware Register Bypass',
            affected: 'iOS 15.7 through 16.5, macOS Ventura before 13.5',
            description: 'Zero-click iMessage exploit chain allowing attackers to bypass page table hardware security (Page Protection Layer / PPL) by writing to undocumented Apple A12-A16 SoC memory-mapped I/O (MMIO) hardware debugging registers.',
            exploit: 'Targeted zero-click spyware chain documented by Kaspersky Lab',
            patch: 'Update iOS to 16.6+ or 17.0+'
        },
        'CVE-2022-22965': {
            name: 'Spring4Shell (Spring Framework RCE)',
            cvss: 9.8,
            severity: 'CRITICAL',
            vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
            cwe: 'CWE-94: Improper Control of Generation of Code',
            affected: 'Spring Framework 5.3.0 to 5.3.17, 5.2.0 to 5.2.19 with JDK 9+',
            description: 'A Spring MVC or Spring WebFlux application running on JDK 9+ may be vulnerable to remote code execution via data binding. The specific exploit requires the application to run on Tomcat as a WAR deployment, manipulating classLoader AccessLogValve parameters.',
            exploit: 'Public PoC, Weaponized Metasploit module',
            patch: 'Upgrade to Spring Framework 5.3.18+ or 5.2.20+'
        },
        'CVE-2023-44487': {
            name: 'HTTP/2 Rapid Reset DDoS Vulnerability',
            cvss: 7.5,
            severity: 'HIGH',
            vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
            cwe: 'CWE-400: Uncontrolled Resource Consumption',
            affected: 'All HTTP/2 implementations (Nginx, Envoy, Apache, Cloudflare, AWS)',
            description: 'The HTTP/2 protocol allows a denial of service (server resource consumption) because request cancellation can reset many streams quickly with RST_STREAM frames before the server finishes processing, causing 398M+ RPS attacks.',
            exploit: 'Massive in-the-wild DDoS attacks observed by Cloudflare and Google',
            patch: 'Apply server-specific rate-limiting patches and disable rapid RST_STREAM bursts'
        },
        'CVE-2021-4034': {
            name: 'PwnKit (Polkit pkexec Local Privilege Escalation)',
            cvss: 7.8,
            severity: 'HIGH',
            vector: 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H',
            cwe: 'CWE-125 / CWE-787: Out-of-bounds Read & Write in pkexec',
            affected: 'Polkit pkexec present in default installations of Debian, Ubuntu, Fedora, CentOS since 2009',
            description: 'A memory corruption vulnerability in Polkits pkexec utility allows any unprivileged local user to obtain full root privileges on default installations of major Linux distributions.',
            exploit: 'Public 10-line C PoCs, widely weaponized across CTFs and red team ops',
            patch: 'Upgrade polkit package or chmod 0755 /usr/bin/pkexec'
        }
    };

    function searchCve(cveQuery) {
        if (!cveResultPanel) return;
        var query = (cveQuery || (cveInput ? cveInput.value : '')).trim().toUpperCase();
        if (!query) {
            cveResultPanel.innerHTML = '<p class="hash-hint">Enter a CVE identifier or keyword above (e.g. CVE-2021-44228 or Log4Shell).</p>';
            return;
        }

        // Check local database first
        var foundKey = null;
        Object.keys(cveDatabase).forEach(function (k) {
            if (k === query || cveDatabase[k].name.toUpperCase().indexOf(query) !== -1 || query.indexOf(k) !== -1) {
                foundKey = k;
            }
        });

        if (foundKey) {
            renderCveDetails(foundKey, cveDatabase[foundKey]);
            return;
        }

        // If formatted as CVE-YYYY-NNNN, attempt live public lookup with loading indicator
        if (/^CVE-\d{4}-\d{4,}$/.test(query)) {
            cveResultPanel.innerHTML = '<div style="padding:1.5rem; text-align:center;"><i class="fas fa-spinner fa-spin" style="font-size:1.8rem; color:var(--primary); margin-bottom:0.75rem;"></i><p>Querying upstream NIST NVD / MITRE CVE databases for ' + escapeHtml(query) + '...</p></div>';
            
            fetch('https://cveawg.mitre.org/api/cve/' + encodeURIComponent(query))
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (data && data.cveMetadata) {
                        var containers = data.containers || {};
                        var cna = containers.cna || {};
                        var title = (cna.title || query);
                        var descObj = (cna.descriptions || [])[0] || {};
                        var cvssObj = ((cna.metrics || [])[0] || {}).cvssV3_1 || {};

                        var cveData = {
                            name: title,
                            cvss: cvssObj.baseScore || 7.5,
                            severity: cvssObj.baseSeverity || 'HIGH',
                            vector: cvssObj.vectorString || 'N/A',
                            cwe: ((cna.problemTypes || [])[0] || {}).descriptions ? cna.problemTypes[0].descriptions[0].description : 'CWE-General',
                            affected: ((cna.affected || [])[0] || {}).product || 'Multiple components',
                            description: descObj.value || 'No detailed description provided by CNA.',
                            exploit: 'Check Exploit-DB, Metasploit, or GitHub advisories',
                            patch: 'Review official vendor advisories'
                        };
                        renderCveDetails(query, cveData);
                    } else {
                        renderCveNotFound(query);
                    }
                })
                .catch(function () {
                    renderCveNotFound(query);
                });
        } else {
            renderCveNotFound(query);
        }
    }

    function renderCveDetails(id, item) {
        var cvss = parseFloat(item.cvss) || 5.0;
        var cvssPercent = Math.min(100, Math.round((cvss / 10) * 100));
        var scoreClass = 'critical';
        if (cvss < 4.0) scoreClass = 'low';
        else if (cvss < 7.0) scoreClass = 'medium';
        else if (cvss < 9.0) scoreClass = 'high';

        var html = '<div class="cve-card">' +
            '<div class="cve-topline">' +
            '<span class="cve-id-badge">' + escapeHtml(id) + '</span>' +
            '<span class="cve-severity-pill ' + scoreClass + '">' + escapeHtml(item.severity) + ' (' + cvss.toFixed(1) + ')</span>' +
            '</div>' +
            '<h3 class="cve-name">' + escapeHtml(item.name) + '</h3>' +
            '<div class="cve-meter-bar">' +
            '<div class="cve-meter-fill ' + scoreClass + '" style="width:' + cvssPercent + '%;"></div>' +
            '</div>' +
            '<div class="cve-meta-grid">' +
            '<div class="cve-meta-item"><strong>CVSS Vector:</strong> <code>' + escapeHtml(item.vector) + '</code></div>' +
            '<div class="cve-meta-item"><strong>Taxonomy:</strong> ' + escapeHtml(item.cwe) + '</div>' +
            '<div class="cve-meta-item"><strong>Affected Targets:</strong> ' + escapeHtml(item.affected) + '</div>' +
            '<div class="cve-meta-item"><strong>Exploit Status:</strong> <span style="color:var(--primary);">' + escapeHtml(item.exploit) + '</span></div>' +
            '</div>' +
            '<div class="cve-desc-box"><p>' + escapeHtml(item.description) + '</p></div>' +
            '<div class="cve-patch-box"><i class="fas fa-shield-halved"></i> <strong>Remediation:</strong> ' + escapeHtml(item.patch) + '</div>' +
            '<div style="margin-top:1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">' +
            '<a href="https://nvd.nist.gov/vuln/detail/' + encodeURIComponent(id) + '" target="_blank" rel="noopener" class="card-link primary small"><i class="fas fa-external-link-alt"></i> NIST NVD Record</a>' +
            '<a href="https://www.exploit-db.com/search?cve=' + encodeURIComponent(id.replace('CVE-', '')) + '" target="_blank" rel="noopener" class="card-link small"><i class="fas fa-bug"></i> Exploit-DB Search</a>' +
            '</div>' +
            '</div>';

        cveResultPanel.innerHTML = html;
        playSound('success');
    }

    function renderCveNotFound(q) {
        cveResultPanel.innerHTML = '<div class="cve-not-found">' +
            '<p class="form-status error">[!] No local or upstream record returned for: "' + escapeHtml(q) + '"</p>' +
            '<p class="hash-hint">Try querying standard identifiers like <strong>CVE-2021-44228</strong>, <strong>CVE-2017-0144</strong>, <strong>CVE-2024-3094</strong>, or click the quick tags above.</p>' +
            '</div>';
        playSound('error');
    }

    if (cveSearchBtn) {
        cveSearchBtn.addEventListener('click', function () {
            searchCve();
        });
    }
    if (cveInput) {
        cveInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchCve();
            }
        });
    }

    document.querySelectorAll('.cve-quick-tags .cve-tag').forEach(function (tag) {
        tag.addEventListener('click', function () {
            var cve = this.dataset.cve;
            if (cveInput) cveInput.value = cve;
            searchCve(cve);
            playSound('click');
        });
    });

    // --------------------------------------------------------------------------
    // 5. SUBDOMAIN & URL RECON PARSER WITH SSRF MUTATION ENGINE
    // --------------------------------------------------------------------------
    var urlParserInput = $('urlParserInput');
    var urlPartsGrid = $('urlPartsGrid');
    var ssrfPayloadsList = $('ssrfPayloadsList');

    function parseUrl() {
        if (!urlParserInput || !urlPartsGrid) return;
        var rawUrl = urlParserInput.value.trim();
        if (!rawUrl) {
            urlPartsGrid.innerHTML = '<p class="hash-hint">Enter a full target URL above to break down hostname, subdomains, path, and parameters.</p>';
            if (ssrfPayloadsList) ssrfPayloadsList.innerHTML = '';
            return;
        }

        // Auto prepend protocol if user omitted
        var testUrl = rawUrl;
        if (!/^https?:\/\//i.test(testUrl)) testUrl = 'https://' + testUrl;

        var parsed = null;
        try {
            parsed = new URL(testUrl);
        } catch (e) {
            urlPartsGrid.innerHTML = '<p class="form-status error">[!] Invalid URL format: ' + escapeHtml(e.message) + '</p>';
            if (ssrfPayloadsList) ssrfPayloadsList.innerHTML = '';
            return;
        }

        var hostname = parsed.hostname;
        var hostParts = hostname.split('.');
        var rootDomain = hostParts.length >= 2 ? hostParts.slice(-2).join('.') : hostname;
        var subdomains = hostParts.length > 2 ? hostParts.slice(0, -2).join('.') : '(none)';

        // Query parameters
        var paramRows = [];
        parsed.searchParams.forEach(function (val, key) {
            paramRows.push('<tr><td><code>' + escapeHtml(key) + '</code></td><td>' + escapeHtml(val) + '</td></tr>');
        });

        var parts = [
            ['Protocol / Scheme', parsed.protocol.replace(':', '')],
            ['Full Hostname', hostname],
            ['Extracted Subdomain(s)', subdomains],
            ['Root Apex Domain', rootDomain],
            ['Port', parsed.port || (parsed.protocol === 'https:' ? '443 (default)' : '80 (default)')],
            ['Pathname', parsed.pathname || '/'],
            ['Search / Query', parsed.search || '(none)'],
            ['Hash / Fragment', parsed.hash || '(none)']
        ];

        var html = '<div class="url-components-table"><table class="cidr-results-table"><tbody>';
        parts.forEach(function (p) {
            html += '<tr><td class="cidr-label">' + p[0] + '</td><td class="cidr-value"><strong>' + escapeHtml(p[1]) + '</strong></td></tr>';
        });
        html += '</tbody></table></div>';

        if (paramRows.length) {
            html += '<div style="margin-top:1rem;"><h4 style="font-size:0.85rem; color:var(--text-bright); margin-bottom:0.5rem;"><i class="fas fa-list"></i> Query Parameters (' + paramRows.length + ')</h4>' +
                '<table class="cidr-results-table"><thead><tr><th>KEY</th><th>VALUE</th></tr></thead><tbody>' +
                paramRows.join('') + '</tbody></table></div>';
        }

        urlPartsGrid.innerHTML = html;

        // Generate Tactical SSRF / Open-Redirect Mutation Payloads
        if (ssrfPayloadsList) {
            var ssrfVectors = [
                { title: 'AWS EC2 IMDSv1 Metadata', payload: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/' },
                { title: 'GCP Metadata Server', payload: 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token' },
                { title: 'Localhost Decimal Bypass', payload: 'http://2130706433/' + (parsed.pathname.replace(/^\//, '') || '') },
                { title: 'Localhost Octal Bypass', payload: 'http://0177.0.0.1/' },
                { title: 'Localhost Hex Bypass', payload: 'http://0x7f000001/' },
                { title: 'IPv6 Loopback Short', payload: 'http://[::1]/' },
                { title: 'DNS Rebinding Localhook', payload: 'http://127.0.0.1.nip.io/' },
                { title: 'Double Slash Open-Redirect', payload: '//' + hostname + '@attacker.evil.com/' }
            ];

            var ssrfHtml = ssrfVectors.map(function (v) {
                return '<div class="ssrf-payload-item">' +
                    '<div class="ssrf-meta"><strong>' + escapeHtml(v.title) + '</strong><button class="tool-inline-btn copy-ssrf-btn" data-payload="' + escapeHtml(v.payload) + '" type="button"><i class="fas fa-copy"></i> Copy</button></div>' +
                    '<code class="ssrf-code">' + escapeHtml(v.payload) + '</code>' +
                    '</div>';
            }).join('');

            ssrfPayloadsList.innerHTML = ssrfHtml;

            ssrfPayloadsList.querySelectorAll('.copy-ssrf-btn').forEach(function (b) {
                b.addEventListener('click', function () {
                    var p = this.dataset.payload;
                    navigator.clipboard.writeText(p).then(function () {
                        showToast('SSRF Payload Copied!', 'fas fa-copy');
                        playSound('success');
                    });
                });
            });
        }
    }

    if (urlParserInput) {
        urlParserInput.addEventListener('input', parseUrl);
        parseUrl();
    }

    // --------------------------------------------------------------------------
    // 6. REGEX PATTERN EXTRACTOR ENGINE
    // --------------------------------------------------------------------------
    var regexPresets = document.querySelectorAll('#regexPresets .tool-opt-btn');
    var customRegexBar = $('customRegexBar');
    var customRegexInput = $('customRegexInput');
    var customRegexFlags = $('customRegexFlags');
    var regexInput = $('regexInput');
    var clearRegexBtn = $('clearRegexBtn');
    var regexMatchesOut = $('regexMatchesOut');
    var regexMatchCount = $('regexMatchCount');
    var copyRegexMatchesBtn = $('copyRegexMatchesBtn');
    var activeRegexKey = 'ipv4';

    var regexPatterns = {
        'ipv4': /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
        'email': /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        'url': /https?:\/\/[^\s"'<>\)]+/g,
        'md5': /\b[a-fA-F0-9]{32}\b/g,
        'sha256': /\b[a-fA-F0-9]{64}\b/g,
        'jwt': /\beyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g,
        'aws': /\bAKIA[0-9A-Z]{16}\b/g
    };

    function runRegexExtractor() {
        if (!regexInput || !regexMatchesOut) return;
        var text = regexInput.value;
        if (!text) {
            regexMatchesOut.innerHTML = '<p class="hash-hint">Paste log files, memory dumps, or code above to extract matching indicators.</p>';
            if (regexMatchCount) regexMatchCount.textContent = '0';
            return;
        }

        var regex = null;
        if (activeRegexKey === 'custom') {
            var pat = (customRegexInput ? customRegexInput.value : '').trim();
            var flags = (customRegexFlags ? customRegexFlags.value : 'g').trim() || 'g';
            if (!pat) {
                regexMatchesOut.innerHTML = '<p class="hash-hint">Enter your custom regex pattern above.</p>';
                return;
            }
            try {
                regex = new RegExp(pat, flags);
            } catch (e) {
                regexMatchesOut.innerHTML = '<p class="form-status error">[!] Invalid Regular Expression: ' + escapeHtml(e.message) + '</p>';
                return;
            }
        } else {
            regex = regexPatterns[activeRegexKey];
        }

        var matches = [];
        var m;
        // Reset lastIndex for stateful regex
        regex.lastIndex = 0;

        if (regex.global) {
            while ((m = regex.exec(text)) !== null) {
                if (m[0]) matches.push(m[0]);
                if (regex.lastIndex === m.index) regex.lastIndex++; // Prevent zero-width loop
                if (matches.length > 500) break; // Cap at 500
            }
        } else {
            m = regex.exec(text);
            if (m) matches.push(m[0]);
        }

        // Deduplicate while preserving order
        var unique = [];
        var seen = {};
        matches.forEach(function (item) {
            if (!seen[item]) {
                seen[item] = true;
                unique.push(item);
            }
        });

        if (regexMatchCount) regexMatchCount.textContent = unique.length;

        if (!unique.length) {
            regexMatchesOut.innerHTML = '<p class="form-status error">[!] 0 matches found for active pattern.</p>';
            return;
        }

        var html = '<div class="extracted-matches-list">';
        unique.forEach(function (match, idx) {
            html += '<div class="match-pill">' +
                '<span class="match-idx">#' + (idx + 1) + '</span>' +
                '<span class="match-text">' + escapeHtml(match) + '</span>' +
                '<button class="tool-inline-btn copy-single-match" data-val="' + escapeHtml(match) + '" type="button" title="Copy"><i class="fas fa-copy"></i></button>' +
                '</div>';
        });
        html += '</div>';

        regexMatchesOut.innerHTML = html;

        regexMatchesOut.querySelectorAll('.copy-single-match').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var v = this.dataset.val;
                navigator.clipboard.writeText(v).then(function () {
                    showToast('Match copied!', 'fas fa-copy');
                    playSound('success');
                });
            });
        });
    }

    if (regexInput) regexInput.addEventListener('input', runRegexExtractor);
    if (customRegexInput) customRegexInput.addEventListener('input', runRegexExtractor);
    if (customRegexFlags) customRegexFlags.addEventListener('input', runRegexExtractor);

    regexPresets.forEach(function (btn) {
        btn.addEventListener('click', function () {
            regexPresets.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            activeRegexKey = this.dataset.regex;
            if (customRegexBar) customRegexBar.hidden = activeRegexKey !== 'custom';
            playSound('click');
            runRegexExtractor();
        });
    });

    if (clearRegexBtn && regexInput) {
        clearRegexBtn.addEventListener('click', function () {
            regexInput.value = '';
            runRegexExtractor();
            playSound('click');
        });
    }

    if (copyRegexMatchesBtn && regexMatchesOut) {
        copyRegexMatchesBtn.addEventListener('click', function () {
            var items = regexMatchesOut.querySelectorAll('.match-text');
            if (!items.length) return;
            var list = [];
            items.forEach(function (it) { list.push(it.textContent); });
            navigator.clipboard.writeText(list.join('\n')).then(function () {
                showToast('All ' + list.length + ' matches copied!', 'fas fa-copy');
                playSound('success');
            });
        });
    }

    // --------------------------------------------------------------------------
    // 7. FORENSIC TIMESTAMP CONVERTER ENGINE (Unix, Windows FileTime, ISO)
    // --------------------------------------------------------------------------
    var timeInput = $('timeInput');
    var timeResultsGrid = $('timeResultsGrid');
    var timeNowBtn = $('timeNowBtn');
    var timeSampleWin = $('timeSampleWin');

    function convertTimestamp() {
        if (!timeInput || !timeResultsGrid) return;
        var raw = timeInput.value.trim();
        if (!raw) {
            timeResultsGrid.innerHTML = '<p class="hash-hint">Enter a Unix epoch, Windows 64-bit FileTime, or ISO 8601 date string above.</p>';
            return;
        }

        var d = null;
        var isWindowsFileTime = false;
        var isUnixSec = false;
        var isUnixMs = false;

        // Detect Windows FileTime (17-18 digits, e.g. 133373184000000000 = 100ns intervals since Jan 1, 1601)
        if (/^\d{17,19}$/.test(raw)) {
            try {
                var fileTimeBig = BigInt(raw);
                var epochDiff1601 = 116444736000000000n; // 100ns ticks between 1601-01-01 and 1970-01-01
                var unix100ns = fileTimeBig - epochDiff1601;
                var unixMs = Number(unix100ns / 10000n);
                d = new Date(unixMs);
                isWindowsFileTime = true;
            } catch (e) { }
        }

        // Unix Milliseconds (13 digits)
        if (!d && /^\d{13}$/.test(raw)) {
            d = new Date(parseInt(raw, 10));
            isUnixMs = true;
        }

        // Unix Seconds (10 digits)
        if (!d && /^\d{10}$/.test(raw)) {
            d = new Date(parseInt(raw, 10) * 1000);
            isUnixSec = true;
        }

        // ISO 8601 or standard string
        if (!d || isNaN(d.getTime())) {
            var parsedDate = new Date(raw);
            if (!isNaN(parsedDate.getTime())) {
                d = parsedDate;
            }
        }

        if (!d || isNaN(d.getTime())) {
            timeResultsGrid.innerHTML = '<p class="form-status error">[!] Unrecognized timestamp format. Enter 10-digit Unix (e.g. 1724457600), ISO-8601, or 18-digit Windows FileTime.</p>';
            return;
        }

        var unixSec = Math.floor(d.getTime() / 1000);
        var unixMsVal = d.getTime();

        // Calculate Windows FileTime
        var winFileTimeStr = 'N/A';
        try {
            var epochDiff1601 = 116444736000000000n;
            var current100ns = BigInt(unixMsVal) * 10000n + epochDiff1601;
            winFileTimeStr = current100ns.toString() + ' (0x' + current100ns.toString(16).toUpperCase() + ')';
        } catch (e) { }

        // Relative time delta
        var deltaSec = Math.round((Date.now() - unixMsVal) / 1000);
        var relStr = '';
        if (Math.abs(deltaSec) < 60) relStr = 'Just now';
        else if (deltaSec > 0) {
            var days = Math.floor(deltaSec / 86400);
            var hours = Math.floor((deltaSec % 86400) / 3600);
            relStr = days > 0 ? days + ' days, ' + hours + ' hours ago' : hours + ' hours ago';
        } else {
            var futDays = Math.floor(Math.abs(deltaSec) / 86400);
            relStr = futDays > 0 ? 'In ' + futDays + ' days' : 'In future';
        }

        var results = [
            ['ISO 8601 / UTC', d.toISOString()],
            ['UTC String', d.toUTCString()],
            ['Local Timezone', d.toString()],
            ['Unix Epoch (Seconds)', unixSec.toString()],
            ['Unix Epoch (Milliseconds)', unixMsVal.toString()],
            ['Windows 64-bit FileTime / AD', winFileTimeStr],
            ['Relative Timestamp', relStr]
        ];

        var html = '<table class="cidr-results-table"><tbody>';
        results.forEach(function (r) {
            html += '<tr><td class="cidr-label">' + r[0] + '</td><td class="cidr-value"><strong>' + escapeHtml(r[1]) + '</strong></td></tr>';
        });
        html += '</tbody></table>';

        timeResultsGrid.innerHTML = html;
    }

    if (timeInput) {
        timeInput.addEventListener('input', convertTimestamp);
        // Default to current epoch
        timeInput.value = Math.floor(Date.now() / 1000).toString();
        convertTimestamp();
    }

    if (timeNowBtn && timeInput) {
        timeNowBtn.addEventListener('click', function () {
            timeInput.value = Math.floor(Date.now() / 1000).toString();
            convertTimestamp();
            playSound('click');
        });
    }

    if (timeSampleWin && timeInput) {
        timeSampleWin.addEventListener('click', function () {
            // Windows FileTime sample from TryHackMe Clean Exit DFIR lab
            timeInput.value = '133373184000000000';
            convertTimestamp();
            playSound('click');
        });
    }

    // --------------------------------------------------------------------------
    // 8. JSON FORMATTER, SANITIZER & SYNTAX HIGHLIGHTER ENGINE
    // --------------------------------------------------------------------------
    var jsonInput = $('jsonInput');
    var jsonOutput = $('jsonOutput');
    var jsonStatusBanner = $('jsonStatusBanner');
    var clearJsonBtn = $('clearJsonBtn');
    var copyJsonBtn = $('copyJsonBtn');
    var jsonFormatBtn = $('jsonFormatBtn');
    var jsonFormat4Btn = $('jsonFormat4Btn');
    var jsonMinifyBtn = $('jsonMinifyBtn');
    var jsonSampleBtn = $('jsonSampleBtn');

    function formatJsonText(spaces) {
        if (!jsonInput || !jsonOutput) return;
        var text = jsonInput.value.trim();
        if (!text) {
            jsonOutput.textContent = '// Formatted JSON will appear here';
            if (jsonStatusBanner) {
                jsonStatusBanner.className = 'json-status-banner';
                jsonStatusBanner.textContent = 'Paste JSON above to beautify, minify, and inspect syntax.';
            }
            return;
        }

        try {
            var parsed = JSON.parse(text);
            var formatted = spaces === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, spaces);
            jsonOutput.textContent = formatted;

            if (jsonStatusBanner) {
                var sizeBytes = new Blob([formatted]).size;
                var keysCount = Array.isArray(parsed) ? parsed.length + ' items' : Object.keys(parsed).length + ' root keys';
                jsonStatusBanner.className = 'json-status-banner valid';
                jsonStatusBanner.innerHTML = '<i class="fas fa-circle-check"></i> [VALID JSON] Syntax valid &bull; ' + keysCount + ' &bull; ' + sizeBytes + ' bytes';
            }
            playSound('success');
        } catch (e) {
            if (jsonStatusBanner) {
                jsonStatusBanner.className = 'json-status-banner error';
                jsonStatusBanner.innerHTML = '<i class="fas fa-triangle-exclamation"></i> [PARSE ERROR] ' + escapeHtml(e.message);
            }
            jsonOutput.textContent = '// Parsing Failed:\n' + e.message;
            playSound('error');
        }
    }

    if (jsonFormatBtn) jsonFormatBtn.addEventListener('click', function () { formatJsonText(2); });
    if (jsonFormat4Btn) jsonFormat4Btn.addEventListener('click', function () { formatJsonText(4); });
    if (jsonMinifyBtn) jsonMinifyBtn.addEventListener('click', function () { formatJsonText(0); });

    if (jsonInput) {
        jsonInput.addEventListener('input', function () {
            formatJsonText(2);
        });
    }

    if (clearJsonBtn && jsonInput && jsonOutput) {
        clearJsonBtn.addEventListener('click', function () {
            jsonInput.value = '';
            formatJsonText(2);
            playSound('click');
        });
    }

    if (copyJsonBtn && jsonOutput) {
        copyJsonBtn.addEventListener('click', function () {
            var text = jsonOutput.textContent;
            if (!text || text.startsWith('//')) return;
            navigator.clipboard.writeText(text).then(function () {
                showToast('Formatted JSON Copied!', 'fas fa-copy');
                playSound('success');
            });
        });
    }

    if (jsonSampleBtn && jsonInput) {
        jsonSampleBtn.addEventListener('click', function () {
            jsonInput.value = '{"operation":"trybankme-assessment","target":"api.trybankme.thm","vuln":{"cwe":"CWE-362","type":"TOCTOU Race Condition","severity":"Critical"},"exploit_params":{"threads":16,"endpoint":"/api/v2/transfer","amount":1000000},"flags":["THM{race_condition_infinite_money}","THM{sqli_bypass_omega}"],"verified":true}';
            formatJsonText(2);
            playSound('click');
        });
    }

    /* ==========================================================================
       12. INTERACTIVE KALI CLI TERMINAL (Commands & Easter Eggs)
       ========================================================================== */
    var cliModal = $('cliModal');
    var cliInput = $('cliInput');
    var cliOutput = $('cliOutput');
    var cliCloseBtn = $('cliCloseBtn');
    var cliCloseDot = $('cliCloseDot');
    var cliLaunchBtn = $('cliLaunchBtn');
    var heroOpenCliBtn = $('heroOpenCliBtn');
    var viewResumeCliBtn = $('viewResumeCliBtn');

    var cliHistory = [];
    var cliHistoryIdx = -1;

    function openCli() {
        if (!cliModal) return;
        cliModal.hidden = false;
        if (cliInput) {
            cliInput.focus();
            cliInput.select();
        }
        playSound('click');
    }

    function closeCli() {
        if (!cliModal) return;
        cliModal.hidden = true;
    }

    if (cliLaunchBtn) cliLaunchBtn.addEventListener('click', openCli);
    if (heroOpenCliBtn) heroOpenCliBtn.addEventListener('click', openCli);
    if (cliCloseBtn) cliCloseBtn.addEventListener('click', closeCli);
    if (cliCloseDot) cliCloseDot.addEventListener('click', closeCli);
    if (cliModal) {
        cliModal.addEventListener('click', function (e) {
            if (e.target === cliModal) closeCli();
        });
    }

    function printCli(html) {
        if (!cliOutput) return;
        var div = document.createElement('div');
        div.className = 'cli-line';
        div.innerHTML = html;
        cliOutput.appendChild(div);
        var body = $('cliBody');
        if (body) body.scrollTop = body.scrollHeight;
    }

    function executeCommand(raw) {
        var cmd = raw.trim();
        if (!cmd) return;

        cliHistory.push(cmd);
        cliHistoryIdx = cliHistory.length;

        printCli('<span class="prompt-user">sameekey@kali</span><span class="prompt-sep">:</span><span class="prompt-path">~</span><span class="prompt-sym">$</span> ' + escapeHtml(cmd));

        var parts = cmd.split(/\s+/);
        var op = parts[0].toLowerCase();
        var arg = parts.slice(1).join(' ');

        switch (op) {
            case 'help':
                printCli(
                    'AVAILABLE COMMANDS:\n' +
                    '  whoami          - Operator dossier & bio\n' +
                    '  skills          - Offensive security capability matrix\n' +
                    '  projects        - List 8 security engineering workstations & GitHub repo\n' +
                    '  ls [writeups]   - List all 31 CTF writeups & reports\n' +
                    '  cat <slug>      - View writeup brief / open reader\n' +
                    '  certs           - View TryHackMe Hacker Holidays Certificate & Rank\n' +
                    '  report          - View TryBankMe Penetration Testing Assessment\n' +
                    '  crack <hash>    - Run simulated dictionary attack against hash\n' +
                    '  nmap <host>     - Simulated network port scan\n' +
                    '  matrix          - Toggle full-screen digital rain\n' +
                    '  theme <name>    - Change theme: red | green | cyan | gold | light\n' +
                    '  sfx <on|off>    - Toggle audio synthesizer\n' +
                    '  contact         - Comms channels & email\n' +
                    '  clear           - Clear terminal window\n' +
                    '  exit            - Close terminal modal'
                );
                playSound('success');
                break;

            case 'projects':
            case 'tools':
            case 'workstations':
                printCli(
                    '=== APPLIED SECURITY ENGINEERING PROJECTS & WORKSTATIONS ===\n' +
                    '1. JWT Analyzer            - Base64URL decode, alg none attack audit, exp validation\n' +
                    '2. Security Headers        - CSP, HSTS, XFO, CORS audit & grading (A+ to F)\n' +
                    '3. CIDR/IP Calculator      - Netmask, broadcast, usable host ranges, binary representation\n' +
                    '4. CVE Lookup & Radar      - CVSS v3.1 impact, vector strings & exploit references\n' +
                    '5. URL/Subdomain Parser    - Recon decomposition, query parameters, SSRF payloads\n' +
                    '6. Regex Extractor         - High-speed extraction for IPs, emails, hashes, JWTs, keys\n' +
                    '7. Timestamp Converter     - Unix s/ms, ISO 8601, Windows 64-bit FileTime epoch\n' +
                    '8. JSON Formatter          - Syntax highlighter, beautifier, minifier, linter\n\n' +
                    'Monorepo: https://github.com/Samik-Parajuli/Projects\n' +
                    'Tip: Visit projects.html or navigate to #projects on the home page.'
                );
                playSound('success');
                break;

            case 'whoami':
                printCli(
                    'OPERATOR: Sameek Parajuli (handle: sameekey)\n' +
                    'ROLE: Offensive Security & Penetration Testing Specialist\n' +
                    'STATUS: Active Offensive Security Operator // Red Team Researcher\n' +
                    'EDUCATION: Texas College of Management and IT (BSc Cybersec)\n' +
                    'LOCATION: Kathmandu, Nepal\n' +
                    'THM PROFILE: https://tryhackme.com/p/sameekey (Sapphire League #1)'
                );
                break;

            case 'skills':
                printCli(
                    '+-----------------------------+----------------------------------------------+\n' +
                    '| DOMAIN                      | HIGHLIGHTED TOOLS & TECHNIQUES               |\n' +
                    '+-----------------------------+----------------------------------------------+\n' +
                    '| Offensive & Web Pentest     | Burp Suite, SQLi, TOCTOU Race, XSS, Zip Slip |\n' +
                    '| Active Directory & Red Team | Kerberoasting, BloodHound, Mimikatz, AS-REP  |\n' +
                    '| Cryptography & Steg         | CyberChef, Hashcat, John, Zero-Width Steg    |\n' +
                    '| Infrastructure & Pivoting   | Nmap, Evil-WinRM, RDP Pivots, SOCKS5, Docker |\n' +
                    '| Tooling & Exploit Dev       | Python 3, Bash, PowerShell, Kali Linux       |\n' +
                    '+-----------------------------+----------------------------------------------+'
                );
                break;

            case 'ls':
                if (!arg || arg === 'writeups' || arg === '-la') {
                    var lines = writeups.map(function (w) {
                        return '  [' + (w.difficulty || 'Med').padEnd(6) + '] ' + w.slug + ' (' + (w.category || 'CTF') + ')';
                    }).join('\n');
                    printCli('TOTAL 31 WALKTHROUGHS:\n' + lines + '\nTip: Type "cat <slug>" to read any writeup.');
                } else {
                    printCli('ls: cannot access \'' + escapeHtml(arg) + '\': No such file or directory');
                }
                break;

            case 'cat':
                if (!arg) {
                    printCli('cat: missing file argument. Try: cat resume or cat <writeup-slug>');
                } else if (arg === 'resume' || arg === 'cv') {
                    printCli(
                        '=== SAMIK (SAMEEK) PARAJULI RESUME ===\n' +
                        'Education: BSc Cybersecurity @ Texas College of Management & IT\n' +
                        'Scoreboards: #1 Rank TryHackMe Sapphire League (480 pts)\n' +
                        'Certifications: Hacker Holidays 100% Completion (THM-CVMBUOSYUB)\n' +
                        'Pentest Case Studies: TryBankMe Banking Assessment (Critical Race Condition & SQLi)\n' +
                        'Download full PDF: RESUME/Samik_Parajuli_CV.pdf'
                    );
                } else {
                    var match = writeups.find(function (w) { return w.slug === arg || w.slug.indexOf(arg) !== -1; });
                    if (match) {
                        printCli(
                            'TITLE: ' + match.title + '\n' +
                            'CATEGORY: ' + match.category + ' | DIFFICULTY: ' + match.difficulty + '\n' +
                            'SUMMARY: ' + match.summary + '\n' +
                            'Opening reader modal...'
                        );
                        openQuickReader(match.slug);
                    } else {
                        printCli('cat: ' + escapeHtml(arg) + ': No such writeup found.');
                    }
                }
                break;

            case 'certs':
            case 'proof':
                printCli(
                    '=== VERIFIED CREDENTIALS ===\n' +
                    '1. TryHackMe: Hacker Holidays - The Byte Lotus Hotel\n' +
                    '   Certificate ID: THM-CVMBUOSYUB (14 rooms rooted, 100% complete)\n' +
                    '2. TryHackMe Sapphire League: Rank #1 Champion (480 points)\n' +
                    '3. TryBankMe: Black-Box Web Application Penetration Test Report'
                );
                break;

            case 'report':
                printCli('Opening TryBankMe Web Application Penetration Test Report...');
                openQuickReader('trybankme-penetration-test-report');
                break;

            case 'nmap':
                printCli(
                    'Starting Nmap 7.94 ( https://nmap.org ) at 2026-09-23 15:30 UTC\n' +
                    'Nmap scan report for portfolio.sameekey.internal (127.0.0.1)\n' +
                    'Host is up (0.00012s latency).\n' +
                    'PORT      STATE SERVICE    VERSION\n' +
                    '22/tcp    open  ssh        OpenSSH 9.3p1 (Debian)\n' +
                    '80/tcp    open  http       Nginx 1.24.0 (Portfolio Front-End)\n' +
                    '1337/tcp  open  ctf-flags  THM{cybersec_portfolio_31_pwned}\n' +
                    '31337/tcp open  elite-ops  Remote Shell Listener (Listening...)\n' +
                    'Service detection performed. 1 service recognized.'
                );
                playSound('success');
                break;

            case 'crack':
                if (!arg) {
                    printCli('crack: missing hash. Usage: crack <hash_string>');
                } else {
                    printCli('[*] Loading rockyou.txt dictionary (14,344,392 words)...');
                    printCli('[*] Initializing OpenCL GPU hash cracker engine...');
                    setTimeout(function () {
                        printCli('[+] Hash: ' + escapeHtml(arg));
                        if (arg.length === 32) {
                            printCli('[+] RECOVERED PLAINTEXT: "admin123!" [Time: 0.14s | 8.4 MH/s]');
                        } else {
                            printCli('[+] RECOVERED PLAINTEXT: "CyberSec2026!#" [Time: 0.28s | 12.1 MH/s]');
                        }
                        playSound('success');
                    }, 400);
                }
                break;

            case 'matrix':
                toggleMatrixRain();
                printCli('[*] Matrix digital rain toggled.');
                break;

            case 'theme':
                if (themes.indexOf(arg) !== -1) {
                    setTheme(arg);
                    printCli('[+] Theme switched to: ' + arg.toUpperCase());
                    playSound('success');
                } else {
                    printCli('Usage: theme <red|green|cyan|gold|light>');
                }
                break;

            case 'sfx':
                if (arg === 'on') {
                    sfxEnabled = true;
                    updateSfxButton();
                    printCli('[+] Audio Synth: ENABLED');
                    playSound('success');
                } else if (arg === 'off') {
                    sfxEnabled = false;
                    updateSfxButton();
                    printCli('[-] Audio Synth: MUTED');
                } else {
                    printCli('Usage: sfx on | sfx off');
                }
                break;

            case 'contact':
                printCli(
                    'CONTACT CHANNELS:\n' +
                    '  Email:     parajulisameek@gmail.com\n' +
                    '  LinkedIn:  https://www.linkedin.com/in/sameek-parajuli-753b9a30a/\n' +
                    '  GitHub:    https://github.com/Samik-Parajuli\n' +
                    '  THM:       https://tryhackme.com/p/sameekey'
                );
                break;

            case 'sudo':
                if (arg.indexOf('rm -rf') !== -1) {
                    printCli(
                        '[!] ROOT PRIVILEGE OVERRIDE DETECTED.\n' +
                        '[!] SYSTEM SELF-DESTRUCT PREVENTED.\n' +
                        'Nice try, hacker. Your incident will be reported to /dev/null ;)'
                    );
                    playSound('error');
                } else {
                    printCli('sudo: user sameekey is not in the sudoers file. This incident will be reported.');
                    playSound('error');
                }
                break;

            case 'clear':
                if (cliOutput) cliOutput.innerHTML = '';
                break;

            case 'exit':
            case 'quit':
                closeCli();
                break;

            default:
                printCli('bash: ' + escapeHtml(op) + ': command not found. Type "help" for command list.');
                playSound('error');
                break;
        }
    }

    if (cliInput) {
        cliInput.addEventListener('keydown', function (e) {
            playSound('key');
            if (e.key === 'Enter') {
                e.preventDefault();
                var text = cliInput.value;
                cliInput.value = '';
                executeCommand(text);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (cliHistory.length > 0 && cliHistoryIdx > 0) {
                    cliHistoryIdx--;
                    cliInput.value = cliHistory[cliHistoryIdx] || '';
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (cliHistoryIdx < cliHistory.length - 1) {
                    cliHistoryIdx++;
                    cliInput.value = cliHistory[cliHistoryIdx] || '';
                } else {
                    cliHistoryIdx = cliHistory.length;
                    cliInput.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                var val = cliInput.value.trim();
                var cmds = ['help', 'whoami', 'skills', 'ls', 'cat', 'certs', 'report', 'crack', 'nmap', 'matrix', 'theme', 'sfx', 'contact', 'clear'];
                var match = cmds.find(function (c) { return c.startsWith(val); });
                if (match) cliInput.value = match + ' ';
            }
        });
    }

    if (viewResumeCliBtn) {
        viewResumeCliBtn.addEventListener('click', function () {
            openCli();
            executeCommand('cat resume');
        });
    }

    /* ==========================================================================
       13. MATRIX DIGITAL RAIN (Canvas animation)
       ========================================================================== */
    var matrixCanvas = $('matrixCanvas');
    var matrixInterval = null;
    var matrixRunning = false;

    function toggleMatrixRain() {
        if (!matrixCanvas) return;
        matrixRunning = !matrixRunning;
        matrixCanvas.hidden = !matrixRunning;

        if (matrixRunning) {
            var ctx = matrixCanvas.getContext('2d');
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;

            var chars = '0123456789ABCDEF!@#$%^&*()-+=<>{}[]~|/\u30A2\u30A6\u30A8\u30AA\u30AB\u30AD\u30B1';
            var fontSize = 14;
            var columns = Math.floor(matrixCanvas.width / fontSize);
            var drops = [];
            for (var i = 0; i < columns; i++) drops[i] = 1;

            matrixInterval = setInterval(function () {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

                ctx.fillStyle = root.getAttribute('data-theme') === 'red' ? '#ff2b3d' : '#00ff66';
                ctx.font = fontSize + 'px monospace';

                for (var j = 0; j < drops.length; j++) {
                    var text = chars[Math.floor(Math.random() * chars.length)];
                    ctx.fillText(text, j * fontSize, drops[j] * fontSize);
                    if (drops[j] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
                        drops[j] = 0;
                    }
                    drops[j]++;
                }
            }, 33);
        } else {
            clearInterval(matrixInterval);
        }
    }

    /* ==========================================================================
       14. GLOBAL KEYBOARD SHORTCUTS
       ========================================================================== */
    window.addEventListener('keydown', function (e) {
        var isTyping = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '');

        if (e.key === 'Escape') {
            if (cliModal && !cliModal.hidden) closeCli();
            if (readerModal && !readerModal.hidden) closeQuickReader();
            if (lightboxModal && !lightboxModal.hidden) closeLightbox();
            if (isTyping && e.target.blur) e.target.blur();
            return;
        }

        if (isTyping) return;

        if (e.key === '`' || e.key === '~') {
            e.preventDefault();
            if (cliModal && !cliModal.hidden) closeCli();
            else openCli();
            return;
        }

        if (e.key === '/') {
            if (searchInput) {
                e.preventDefault();
                searchInput.focus();
                var s = $('writeups');
                if (s) s.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
            }
            return;
        }

        if (e.key === 't' || e.key === 'T') {
            var currIdx = themes.indexOf(currentTheme);
            var nextTheme = themes[(currIdx + 1) % themes.length];
            setTheme(nextTheme);
            playSound('click');
            showToast('Theme: ' + nextTheme.toUpperCase(), 'fas fa-palette');
            return;
        }

        if (e.key === 's' || e.key === 'S') {
            sfxEnabled = !sfxEnabled;
            try { localStorage.setItem('sfx_enabled', sfxEnabled ? 'true' : 'false'); } catch (err) { }
            updateSfxButton();
            if (sfxEnabled) playSound('success');
            showToast(sfxEnabled ? 'SFX: ON' : 'SFX: MUTED', 'fas fa-volume-high');
            return;
        }
    });

    /* ==========================================================================
       15. CONTACT FORM (Web3Forms Submit Handler & Local Mail Client Fallback)
       ========================================================================== */
    function openMailClientFallback() {
        var nameInput = $('name');
        var emailInput = $('email');
        var subjectInput = $('subjectField');
        var messageInput = $('message');

        var nameVal = (nameInput ? nameInput.value : '').trim();
        var emailVal = (emailInput ? emailInput.value : '').trim();
        var subjectVal = (subjectInput ? subjectInput.value : '').trim() || 'Cybersecurity Assessment / Opportunity';
        var messageVal = (messageInput ? messageInput.value : '').trim();

        var body = 'Sender: ' + (nameVal || 'Anonymous Operator') + '\n' +
                   'Email: ' + (emailVal || 'Not specified') + '\n\n' +
                   'Payload Message:\n' + (messageVal || '[No message entered]');

        var mailtoUrl = 'mailto:parajulisameek@gmail.com?subject=' + encodeURIComponent('[Portfolio Transmission] ' + subjectVal) +
                        '&body=' + encodeURIComponent(body);

        window.location.href = mailtoUrl;
        playSound('click');
        showToast('Opening default email client...', 'fas fa-envelope-open-text');
    }

    var mailAppBtn = $('mailAppBtn');
    if (mailAppBtn) {
        mailAppBtn.addEventListener('click', function () {
            openMailClientFallback();
        });
    }

    var contactForm = $('contactForm');
    if (contactForm) {
        var submitBtn = $('submitBtn');
        var formStatus = $('formStatus');

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var keyField = contactForm.querySelector('[name="access_key"]');
            var isPlaceholderKey = !keyField || !keyField.value || keyField.value === 'YOUR_WEB3FORMS_ACCESS_KEY';

            if (isPlaceholderKey) {
                if (formStatus) {
                    formStatus.innerHTML = '<span style="color:var(--primary); font-weight:700;"><i class="fas fa-satellite-dish"></i> Redirecting:</span> ' +
                                           'Web3Forms access key not yet entered in index.html. Launching your email client with message prepared...';
                    formStatus.className = 'form-status error';
                }
                playSound('alert');
                setTimeout(openMailClientFallback, 900);
                return;
            }

            var data = new FormData(contactForm);
            if (submitBtn) submitBtn.disabled = true;
            if (formStatus) {
                formStatus.textContent = '> Encrypting and transmitting payload...';
                formStatus.className = 'form-status';
            }

            fetch(contactForm.action, {
                method: 'POST',
                body: data,
                headers: { Accept: 'application/json' }
            })
                .then(function (res) { return res.json(); })
                .then(function (resData) {
                    if (resData.success) {
                        if (formStatus) {
                            formStatus.textContent = '[+] Transmission acknowledged. Sameek will decrypt and respond shortly.';
                            formStatus.className = 'form-status success';
                        }
                        playSound('success');
                        contactForm.reset();
                    } else {
                        throw new Error(resData.message || 'Submission rejected by remote endpoint');
                    }
                })
                .catch(function (err) {
                    if (formStatus) {
                        formStatus.innerHTML = '[!] Remote dispatch failure: ' + escapeHtml(err.message) + '. ' +
                            '<button type="button" class="card-link small" id="statusFallbackBtn" style="margin-left:8px; display:inline-flex;"><i class="fas fa-paper-plane"></i> Send via Email Client</button>';
                        formStatus.className = 'form-status error';
                        var fallbackBtn = $('statusFallbackBtn');
                        if (fallbackBtn) fallbackBtn.addEventListener('click', openMailClientFallback);
                    }
                    playSound('error');
                })
                .finally(function () {
                    if (submitBtn) submitBtn.disabled = false;
                });
        });
    }

    /* ==========================================================================
       16. BOOT SCREEN SIMULATION
       ========================================================================== */
    function runBoot() {
        var boot = $('boot');
        if (!boot) return;

        var dismissed = false;
        try { dismissed = sessionStorage.getItem('booted') === '1'; } catch (e) { }

        if (prefersReduced || dismissed) {
            boot.classList.add('boot--done');
            setTimeout(function () { boot.remove(); }, 100);
            return;
        }

        var log = $('bootLog');
        var bootSkipBtn = $('bootSkipBtn');
        var lines = [
            '[*] Initializing tactical cybersecurity shell...',
            '[*] Loading profile: sameekey (Sameek Parajuli)',
            '[*] Mounting verified credentials: THM Sapphire League #1',
            '[*] Indexing writeups library: 31 modules loaded',
            '[*] Initializing Web Audio API synthesizer...',
            '[*] Defense status: active. Systems operational.',
            '> READY // Press any key to continue...'
        ];
        var idx = 0;

        function step() {
            if (idx < lines.length) {
                if (log) log.textContent += (idx ? '\n' : '') + lines[idx];
                idx++;
                setTimeout(step, 110);
            } else {
                setTimeout(dismiss, 350);
            }
        }

        function dismiss() {
            boot.classList.add('boot--done');
            try { sessionStorage.setItem('booted', '1'); } catch (e) { }
            setTimeout(function () { boot.remove(); }, 400);
        }

        if (bootSkipBtn) bootSkipBtn.addEventListener('click', dismiss);
        boot.addEventListener('click', dismiss);
        window.addEventListener('keydown', dismiss, { once: true });
        step();
    }

    runBoot();

    /* ==========================================================================
       17. PARTICLES.JS INITIALIZATION
       ========================================================================== */
    window.initParticles = function () {
        if (!window.particlesJS || prefersReduced) return;
        var theme = root.getAttribute('data-theme') || 'red';
        var colorMap = {
            'red': '#ff2b3d',
            'green': '#00ff66',
            'cyan': '#00f5d4',
            'gold': '#ffb703',
            'light': '#c1121f'
        };
        var activeColor = colorMap[theme] || '#ff2b3d';

        particlesJS('particles-js', {
            particles: {
                number: { value: 65, density: { enable: true, value_area: 850 } },
                color: { value: activeColor },
                shape: { type: 'circle' },
                opacity: { value: 0.35, random: true },
                size: { value: 2.2, random: true },
                line_linked: { enable: true, distance: 140, color: activeColor, opacity: 0.2, width: 1 },
                move: { enable: true, speed: 1.4, direction: 'none', out_mode: 'out' }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'grab' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    grab: { distance: 130, line_linked: { opacity: 0.55 } },
                    push: { particles_nb: 3 }
                }
            },
            retina_detect: true
        });
    };

    window.initParticles();
})();