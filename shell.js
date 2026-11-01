/* Score OS final preview — page shell (Canvas structure + Claude bento/a11y). */
(function () {
  const ARSENAL = [
    ["Credit Monitoring", "Real-time 3-bureau credit monitoring built in, so you and your clients always know the score.", "monitor"],
    ["Agency CRM", "Manage leads, clients, documents, and notes in one command center built for high-volume agencies.", "crm"],
    ["Marketing", "Built-in marketing tools to capture leads and turn them into signed, paying clients.", "mkt"],
    ["Free Website", "A professional, conversion-ready website included free — your agency online and taking leads in minutes.", "web"],
    ["3-Bureau Tracking", "Track disputes across Equifax, Experian, and TransUnion on one live scoreboard — no more spreadsheets.", "track"],
    ["AI Dispute Engine", "Maxine reads each credit report and drafts unique, non-templated letters the bureaus can't auto-reject.", "ai", true],
    ["White-Label Portal", "Your logo, your colors, your brand. Clients log into a premium portal that looks like you built it yourself.", "brand"],
    ["2-Way Messaging", "Secure two-way chat keeps every client conversation inside the platform, off your personal phone.", "msg"],
    ["Booking Calendar", "Let clients book consultations around the clock with a built-in scheduling calendar.", "cal"],
    ["Mentorship", "Learn from operators who've scaled — ongoing mentorship to help you grow your agency faster.", "mentor"],
    ["Community", "Join a private community of credit repair owners leveling up and sharing wins together.", "comm"],
    ["Training Videos", "A full library of training videos to onboard fast and master every play in the platform.", "train"],
    ["Support System", "A built-in support system so you're never stuck — real help exactly when you need it.", "support"],
    ["Tons of Automations", "Smart automations handle the busywork — follow-ups, progress updates, and reminders on autopilot.", "auto"],
  ];

  const ICONS = {
    ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="m9 15 2 2 4-4"/></svg>',
    default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"/></svg>',
  };

  const bento = document.getElementById("bento-grid");
  if (bento) {
    bento.innerHTML = ARSENAL.map(([title, desc, key, featured], i) => {
      const span = featured || title === "AI Dispute Engine" ? " span-2 lit" : "";
      const gold = title === "Mentorship" || title === "Community" ? " gold" : "";
      const mock = title === "AI Dispute Engine"
        ? `<div class="mock" aria-hidden="true">
            <div class="letter-line w45"></div>
            <div class="letter-line"></div>
            <div class="letter-line hl w80"></div>
            <div class="letter-line w60"></div>
            <div class="letter-foot">
              <span class="status"><i></i>DRAFT · AWAITING REVIEW</span>
              <span class="tags"><span>FCRA §611</span><span>Demo</span></span>
            </div>
          </div>`
        : "";
      return `<article class="tile${span} reveal" data-tile>
        <div class="tile-top">
          <span class="ico${gold}">${ICONS[key] || ICONS.default}</span>
          <span class="chip">${title === "AI Dispute Engine" ? "Human review" : "Live feature"}</span>
        </div>
        <h3>${title}</h3>
        <p>${desc}</p>
        ${mock}
      </article>`;
    }).join("");
  }

  const track = document.getElementById("chips-track");
  if (track) {
    const names = ARSENAL.map(([n]) => (n === "Tons of Automations" ? "Automations" : n));
    track.innerHTML = [...names, ...names].map((n) => `<span class="chip-pill">${n}</span>`).join("");
  }

  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // Claude-style cursor glow on bento tiles
  document.querySelectorAll("[data-tile]").forEach((tile) => {
    tile.addEventListener("pointermove", (e) => {
      const r = tile.getBoundingClientRect();
      tile.style.setProperty("--mx", `${e.clientX - r.left}px`);
      tile.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");
  if (reduce) {
    reveals.forEach((el) => el.classList.add("in"));
    document.querySelectorAll(".sky-col").forEach((c) => c.classList.add("on"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          if (e.target.id === "skyline" || e.target.classList.contains("skyline")) {
            e.target.querySelectorAll(".sky-col").forEach((col, i) => {
              setTimeout(() => col.classList.add("on"), i * 80);
            });
          }
          if (e.target.classList.contains("readiness")) {
            e.target.querySelectorAll(".meter span").forEach((m) => {
              m.style.transform = "scaleX(1)";
            });
          }
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
    const sky = document.getElementById("skyline");
    if (sky) io.observe(sky);
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }
})();
