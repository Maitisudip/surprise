(function () {
  const cfg = window.BIRTHDAY_CONFIG || {};
  const params = new URLSearchParams(window.location.search);
  const isPreview = params.get("preview") === "1";

  // Elements
  const previewBadge = document.getElementById("preview-badge");
  const introStage = document.getElementById("intro-stage");
  const mainExperience = document.getElementById("main-experience");
  const envelopeBtn = document.getElementById("envelope-btn");
  const envelope = document.getElementById("envelope");
  const soundToggle = document.getElementById("sound-toggle");
  const soundIcon = document.getElementById("sound-icon");
  const soundLabel = document.getElementById("sound-label");
  const candles = Array.from(document.querySelectorAll(".candle"));
  const blowAllBtn = document.getElementById("blow-all-btn");
  const wishTitle = document.getElementById("wish-title");
  const wishSubtitle = document.getElementById("wish-subtitle");
  const cardsGrid = document.getElementById("cards-grid");
  const letterBody = document.getElementById("letter-body");
  const senderNameEl = document.getElementById("sender-name");
  const reactionButtons = Array.from(document.querySelectorAll(".reaction-btn"));
  const reactionFeedback = document.getElementById("reaction-feedback");

  if (isPreview) {
    previewBadge.classList.remove("hidden");
  }

  // ------------------------------------------------------------
  // 1. Hydrate Personalized Content from config.js
  // ------------------------------------------------------------
  const recipient = (cfg.recipientName || "Sutapa").trim();
  document.querySelectorAll("[data-recipient]").forEach((el) => {
    el.textContent = recipient;
  });

  const subtextEl = document.getElementById("headline-subtext");
  if (cfg.headlineSubtext && subtextEl) {
    subtextEl.textContent = cfg.headlineSubtext;
  }

  // Escape helper in case custom text contains quotes or angle brackets
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Render flip cards
  if (Array.isArray(cfg.cards) && cardsGrid) {
    cardsGrid.innerHTML = cfg.cards
      .map(
        (card, idx) => `
      <button class="flip-card" type="button" data-card-index="${idx}" aria-label="${escapeHtml(card.title)}">
        <div class="flip-card-inner">
          <div class="flip-face flip-front">
            <span class="card-badge">${escapeHtml(card.badge || "0" + (idx + 1))}</span>
            <h4 class="card-front-title">${escapeHtml(card.title)}</h4>
            <span class="card-hint">${escapeHtml(card.frontHint || "Tap to flip")} ✨</span>
          </div>
          <div class="flip-face flip-back">
            <div>
              <h4 class="card-back-title">${escapeHtml(card.title)}</h4>
              <p class="card-back-text">${escapeHtml(card.text)}</p>
            </div>
            <span class="card-hint">Tap to turn back</span>
          </div>
        </div>
      </button>
    `
      )
      .join("");
  }

  // Render letter paragraphs
  if (Array.isArray(cfg.letterParagraphs) && letterBody) {
    letterBody.innerHTML = cfg.letterParagraphs
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join("");
  }

  if (senderNameEl) {
    senderNameEl.textContent =
      (cfg.senderName && cfg.senderName.trim()) ||
      cfg.defaultSignOff ||
      "Someone who's really glad to know you";
  }

  // ------------------------------------------------------------
  // 2. Event & Visit Tracking (ntfy.sh, Web3Forms, Webhook, GA4)
  // ------------------------------------------------------------
  const totalCards = Array.isArray(cfg.cards) ? cfg.cards.length : 0;
  const firedEvents = new Set();
  const visitState = {
    startedAt: Date.now(),
    unwrapped: false,
    sectionsSeen: new Set(),
    cardsFlipped: new Set(),
    candlesBlown: false,
    letterRead: false,
    reaction: null,
    lastSummaryFingerprint: ""
  };

  // Load Google Analytics 4 dynamically if gaMeasurementId is set
  const gaId = (cfg.gaMeasurementId || "").trim();
  if (gaId && !isPreview) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId);
    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(gaScript);
  }

  function getVisitorSummary() {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const device = isMobile ? "Mobile" : "Desktop";
    const screen = `${window.innerWidth}x${window.innerHeight}`;
    const time = new Date().toLocaleString();
    return `${device} (${screen}) at ${time}`;
  }

  function formatDuration(ms) {
    const secs = Math.max(1, Math.round(ms / 1000));
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return mins > 0 ? `${mins}m ${rem}s` : `${rem}s`;
  }

  function sendNotification(eventTitle, details, useBeacon = false) {
    const fullMessage = `${details}\n${getVisitorSummary()}`;

    if (isPreview) {
      console.info("[Preview Mode] Event:", eventTitle, "\n" + fullMessage);
      return;
    }

    // A) ntfy.sh (instant push alert)
    const topic = (cfg.ntfyTopic || "").trim();
    if (topic) {
      const url = `https://ntfy.sh/${encodeURIComponent(topic)}?title=${encodeURIComponent(
        eventTitle
      )}`;
      if (useBeacon && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([fullMessage], { type: "text/plain" }));
      } else {
        fetch(url, {
          method: "POST",
          body: fullMessage,
          keepalive: true
        }).catch(() => {});
      }
    }

    // B) Web3Forms (email alert) — only send major events so inbox isn't flooded
    const web3Key = (cfg.web3formsAccessKey || "").trim();
    if (web3Key) {
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: web3Key,
          subject: eventTitle,
          from_name: `${recipient}'s Birthday Page`,
          message: fullMessage
        }),
        keepalive: true
      }).catch(() => {});
    }

    // C) Discord / Custom Webhook
    const webhookUrl = (cfg.webhookUrl || "").trim();
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `**${eventTitle}**\n${fullMessage}`,
          event: eventTitle,
          details: fullMessage
        }),
        keepalive: true
      }).catch(() => {});
    }
  }

  function trackEvent(eventName, title, details, options = {}) {
    const { once = true, gaParams = {}, useBeacon = false, skipEmail = false } = options;
    if (once && firedEvents.has(eventName)) return;
    firedEvents.add(eventName);

    if (typeof window.gtag === "function" && !isPreview) {
      window.gtag("event", eventName, {
        recipient,
        ...gaParams
      });
    }

    if (isPreview) {
      console.info(`[Preview Mode] Event "${eventName}":`, title, details);
      return;
    }

    if (skipEmail && !(cfg.ntfyTopic || "").trim() && !(cfg.webhookUrl || "").trim()) {
      return;
    }

    sendNotification(title, details, useBeacon);
  }

  function sendVisitSummary() {
    const fingerprint = [
      visitState.unwrapped,
      visitState.sectionsSeen.size,
      visitState.cardsFlipped.size,
      visitState.candlesBlown,
      visitState.letterRead,
      visitState.reaction || ""
    ].join("|");

    if (fingerprint === visitState.lastSummaryFingerprint) return;
    visitState.lastSummaryFingerprint = fingerprint;

    const sawAll = visitState.sectionsSeen.size >= 4;
    const summaryText = [
      `Time spent: ${formatDuration(Date.now() - visitState.startedAt)}`,
      `Unwrapped envelope: ${visitState.unwrapped ? "Yes" : "No"}`,
      `Sections viewed: ${visitState.sectionsSeen.size}/4${sawAll ? " (Saw everything!)" : ""}`,
      `Candles blown: ${visitState.candlesBlown ? "Yes" : "No"}`,
      `Cards flipped: ${visitState.cardsFlipped.size}/${totalCards}`,
      `Read letter: ${visitState.letterRead ? "Yes" : "In progress / skimmed"}`,
      `Reaction: ${visitState.reaction || "None yet"}`
    ].join("\n");

    trackEvent(
      "visit_summary_" + fingerprint,
      `📊 ${recipient}'s visit summary`,
      summaryText,
      {
        once: false,
        useBeacon: true,
        gaParams: {
          sections_seen: visitState.sectionsSeen.size,
          cards_flipped: visitState.cardsFlipped.size,
          candles_blown: visitState.candlesBlown,
          saw_all: sawAll
        }
      }
    );
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sendVisitSummary();
    }
  });
  window.addEventListener("pagehide", sendVisitSummary);

  // Ping once per browser session when the page loads
  if (!sessionStorage.getItem("bday_opened_ping")) {
    sessionStorage.setItem("bday_opened_ping", "1");
    trackEvent(
      "page_opened",
      `🎂 ${recipient} opened the birthday page!`,
      `${recipient} just opened the link.`
    );
  }

  // ------------------------------------------------------------
  // 3. Soft Music Box Melody (Web Audio API, no MP3 needed)
  // ------------------------------------------------------------
  let audioCtx = null;
  let isMuted = false;
  let melodyTimer = null;

  const NOTE_FREQ = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.0,
    A4: 440.0,
    Bb4: 466.16,
    C5: 523.25
  };

  // Gentle "Happy Birthday" melody [note, durationSec]
  const MELODY = [
    ["C4", 0.38], ["C4", 0.25], ["D4", 0.55], ["C4", 0.55], ["F4", 0.55], ["E4", 0.95],
    ["C4", 0.38], ["C4", 0.25], ["D4", 0.55], ["C4", 0.55], ["G4", 0.55], ["F4", 0.95],
    ["C4", 0.38], ["C4", 0.25], ["C5", 0.55], ["A4", 0.55], ["F4", 0.55], ["E4", 0.55], ["D4", 0.95],
    ["Bb4", 0.38], ["Bb4", 0.25], ["A4", 0.55], ["F4", 0.55], ["G4", 0.55], ["F4", 1.2]
  ];

  function playNote(freq, duration) {
    if (!audioCtx || isMuted) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  function startMelodyLoop() {
    if (melodyTimer) return;
    let index = 0;
    function step() {
      if (isMuted) {
        melodyTimer = setTimeout(step, 500);
        return;
      }
      const [note, dur] = MELODY[index];
      playNote(NOTE_FREQ[note], dur);
      index = (index + 1) % MELODY.length;
      const pause = index === 0 ? 1600 : dur * 920;
      melodyTimer = setTimeout(step, pause);
    }
    step();
  }

  soundToggle.addEventListener("click", () => {
    isMuted = !isMuted;
    soundIcon.textContent = isMuted ? "🔇" : "🎵";
    soundLabel.textContent = isMuted ? "Muted" : "Sound On";
  });

  // ------------------------------------------------------------
  // 4. Starfield & Confetti Engine
  // ------------------------------------------------------------
  const bgCanvas = document.getElementById("bg-canvas");
  const bgCtx = bgCanvas.getContext("2d");
  const confCanvas = document.getElementById("confetti-canvas");
  const confCtx = confCanvas.getContext("2d");

  let stars = [];
  let confettiPieces = [];

  function resizeCanvases() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    [bgCanvas, confCanvas].forEach((c) => {
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      const ctx = c.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    initStars();
  }

  function initStars() {
    const count = Math.min(95, Math.floor((window.innerWidth * window.innerHeight) / 14000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.015 + 0.005,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function launchConfetti(count = 110) {
    const colors = ["#f6c978", "#f29ca3", "#ffd6ba", "#fff4ec", "#d982b5"];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const velocity = Math.random() * 9 + 5;
      confettiPieces.push({
        x: window.innerWidth * (0.2 + Math.random() * 0.6),
        y: window.innerHeight * 0.55,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 2,
        w: Math.random() * 8 + 5,
        h: Math.random() * 5 + 3,
        color: colors[i % colors.length],
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        life: 1
      });
    }
  }

  function animate(time) {
    bgCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const s of stars) {
      const twinkle = 0.45 + 0.55 * Math.sin(time * s.speed * 0.1 + s.phase);
      bgCtx.beginPath();
      bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      bgCtx.fillStyle = `rgba(255, 238, 222, ${s.alpha * twinkle})`;
      bgCtx.fill();
    }

    if (confettiPieces.length > 0) {
      confCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      confettiPieces = confettiPieces.filter((p) => p.life > 0.02 && p.y < window.innerHeight + 40);
      for (const p of confettiPieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.vx *= 0.99;
        p.rot += p.vRot;
        p.life -= 0.007;

        confCtx.save();
        confCtx.translate(p.x, p.y);
        confCtx.rotate(p.rot);
        confCtx.globalAlpha = Math.max(0, p.life);
        confCtx.fillStyle = p.color;
        confCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        confCtx.restore();
      }
    } else {
      confCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resizeCanvases);
  resizeCanvases();
  requestAnimationFrame(animate);

  // ------------------------------------------------------------
  // 5. Envelope Unwrap Sequence
  // ------------------------------------------------------------
  let unwrapped = false;
  function unwrapSurprise() {
    if (unwrapped) return;
    unwrapped = true;

    envelope.classList.add("opened");
    launchConfetti(90);

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
        soundToggle.classList.remove("hidden");
        startMelodyLoop();
      }
    } catch (_) {}

    visitState.unwrapped = true;
    trackEvent(
      "envelope_unwrapped",
      `💌 ${recipient} unwrapped the envelope!`,
      `${recipient} tapped the wax seal and entered the birthday page.`
    );

    setTimeout(() => {
      introStage.classList.add("closing");
      setTimeout(() => {
        introStage.classList.add("hidden");
        mainExperience.classList.remove("hidden");
        observeReveals();
        window.scrollTo(0, 0);
      }, 650);
    }, 750);
  }

  envelopeBtn.addEventListener("click", unwrapSurprise);
  envelopeBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      unwrapSurprise();
    }
  });

  // ------------------------------------------------------------
  // 6. Scroll Reveal & Section View Observer
  // ------------------------------------------------------------
  const SECTION_EVENTS = {
    "cake-section": {
      key: "cake",
      title: `🍰 ${recipient} scrolled to the Birthday Cake`,
      detail: `${recipient} is viewing the cake & candles section.`
    },
    "cards-section": {
      key: "cards",
      title: `🃏 ${recipient} reached the Flip Cards`,
      detail: `${recipient} scrolled to the 4 birthday cards.`
    },
    "letter-section": {
      key: "letter",
      title: `✉️ ${recipient} reached your Birthday Letter`,
      detail: `${recipient} is looking at your letter.`
    },
    "reaction-section": {
      key: "reaction",
      title: `✨ ${recipient} reached the bottom section`,
      detail: `${recipient} scrolled all the way down to the reaction check-in.`
    }
  };

  let letterDwellTimer = null;

  function observeReveals() {
    const items = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    items.forEach((el) => revealObserver.observe(el));

    // Separate observer at higher visibility threshold to verify she actually saw each section
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const meta = SECTION_EVENTS[id];
          if (!meta) return;

          if (entry.isIntersecting) {
            visitState.sectionsSeen.add(meta.key);

            if (cfg.trackSectionViews !== false) {
              trackEvent(`section_${meta.key}_viewed`, meta.title, meta.detail, {
                gaParams: { section: meta.key }
              });
            }

            if (id === "letter-section" && !visitState.letterRead && !letterDwellTimer) {
              letterDwellTimer = setTimeout(() => {
                visitState.letterRead = true;
                trackEvent(
                  "letter_read",
                  `📖 ${recipient} read the birthday letter`,
                  `${recipient} stayed on the letter for 5+ seconds.`
                );
              }, 5000);
            }

            if (visitState.sectionsSeen.size === 4) {
              trackEvent(
                "saw_all_sections",
                `👀 ${recipient} saw everything on the page!`,
                `${recipient} viewed all 4 sections from top to bottom.`
              );
            }
          } else if (id === "letter-section" && letterDwellTimer && !visitState.letterRead) {
            clearTimeout(letterDwellTimer);
            letterDwellTimer = null;
          }
        });
      },
      { threshold: 0.35 }
    );

    Object.keys(SECTION_EVENTS).forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  // ------------------------------------------------------------
  // 7. Candle Blowing Interaction
  // ------------------------------------------------------------
  let blownCount = 0;

  function checkAllCandlesBlown() {
    blownCount = candles.filter((c) => c.classList.contains("blown")).length;
    if (blownCount === candles.length) {
      wishTitle.textContent = "Wish locked in ✨";
      wishSubtitle.textContent =
        "May this year bring you everything that makes you smile like nobody's watching.";
      blowAllBtn.textContent = "Happy Birthday, " + recipient + " 🎂";
      blowAllBtn.disabled = true;
      launchConfetti(140);
      visitState.candlesBlown = true;
      trackEvent(
        "candles_blown",
        `🕯️ ${recipient} blew out the candles!`,
        `${recipient} made a birthday wish and blew out all the candles.`
      );
    }
  }

  candles.forEach((candle) => {
    candle.addEventListener("click", () => {
      if (candle.classList.contains("blown")) return;
      candle.classList.add("blown");
      checkAllCandlesBlown();
    });
  });

  blowAllBtn.addEventListener("click", () => {
    candles.forEach((candle, idx) => {
      setTimeout(() => {
        candle.classList.add("blown");
        if (idx === candles.length - 1) {
          checkAllCandlesBlown();
        }
      }, idx * 140);
    });
  });

  // ------------------------------------------------------------
  // 8. Flip Cards Interaction
  // ------------------------------------------------------------
  if (cardsGrid) {
    cardsGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".flip-card");
      if (!card) return;
      const isNowFlipped = card.classList.toggle("flipped");
      const idx = card.getAttribute("data-card-index");
      if (isNowFlipped && idx !== null) {
        visitState.cardsFlipped.add(idx);
        const cardTitle =
          (cfg.cards && cfg.cards[Number(idx)] && cfg.cards[Number(idx)].title) ||
          `Card ${Number(idx) + 1}`;
        trackEvent(
          `card_flipped_${idx}`,
          `🃏 ${recipient} flipped "${cardTitle}"`,
          `${recipient} read card #${Number(idx) + 1} (${visitState.cardsFlipped.size}/${totalCards} flipped).`,
          { gaParams: { card_title: cardTitle, card_index: Number(idx) + 1 } }
        );
        if (totalCards > 0 && visitState.cardsFlipped.size === totalCards) {
          trackEvent(
            "all_cards_flipped",
            `🌟 ${recipient} flipped all ${totalCards} cards!`,
            `${recipient} opened every single flip card.`
          );
        }
      }
    });
  }

  // ------------------------------------------------------------
  // 9. Reaction Buttons
  // ------------------------------------------------------------
  reactionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      reactionButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      const reaction = btn.getAttribute("data-reaction");
      visitState.reaction = reaction;
      reactionFeedback.textContent = `Sent "${reaction}" into the universe ✨`;
      launchConfetti(85);
      trackEvent(
        `reaction_${reaction}`,
        `✨ ${recipient} tapped a reaction!`,
        `${recipient} picked: "${reaction}"`,
        { gaParams: { reaction } }
      );
    });
  });
})();
