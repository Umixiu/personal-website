const STORAGE_KEY = "portfolio-profile";
const BACKGROUND_KEY = "portfolio-background";

/* ===== Profile Persistence ===== */
function getDefaultProfile() {
  return typeof profile !== "undefined" ? structuredClone(profile) : {};
}

function loadProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Failed to load saved profile:", e);
  }
  return getDefaultProfile();
}

function saveProfile(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function resetProfile() {
  localStorage.removeItem(STORAGE_KEY);
}

let currentProfile = loadProfile();

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ===== Render Content ===== */
function renderContent() {
  const container = document.getElementById("dynamic-content");
  if (!container) return;

  const p = currentProfile;

  const educationHTML = (p.education || [])
    .map(
      (item) => `
      <div class="timeline-item">
        <p class="timeline-period">${escapeHTML(item.period)}</p>
        <h3 class="timeline-title">${escapeHTML(item.title)}</h3>
        <p class="timeline-sub">${escapeHTML(item.institution)}</p>
        <p class="timeline-desc">${escapeHTML(item.description)}</p>
      </div>`
    )
    .join("");

  const experienceHTML = (p.experience || [])
    .map(
      (item) => `
      <div class="timeline-item">
        ${
          item.freeform
            ? `<p class="timeline-freeform">${escapeHTML(item.title)}</p>`
            : `
              ${item.period ? `<p class="timeline-period">${escapeHTML(item.period)}</p>` : ""}
              ${item.title ? `<h3 class="timeline-title">${escapeHTML(item.title)}</h3>` : ""}
              ${item.company ? `<p class="timeline-sub">${escapeHTML(item.company)}</p>` : ""}
              ${item.description ? `<p class="timeline-desc">${escapeHTML(item.description)}</p>` : ""}
            `
        }
      </div>`
    )
    .join("");

  const skillsHTML = (p.skills || [])
    .map((skill) => `<span class="skill-tag">${escapeHTML(skill)}</span>`)
    .join("");

  const socialHTML = (p.contact?.social || [])
    .map(
      (link) =>
        `<a href="${escapeHTML(link.url)}" class="contact-link" target="_blank" rel="noopener noreferrer">${escapeHTML(link.label)}</a>`
    )
    .join("");

  container.innerHTML = `
    <section id="home" class="section">
      <p class="section-label">Portfolio</p>
      <h1 class="section-title">${escapeHTML(p.name || "")}</h1>
      <p class="section-subtitle">${escapeHTML(p.title || "")}</p>
    </section>

    <section id="about" class="section glass glass-card">
      <p class="section-label">About</p>
      <h2 class="section-title">About Me</h2>
      <p class="section-text">${escapeHTML(p.about || "")}</p>
    </section>

    <section id="education" class="section glass glass-card">
      <p class="section-label">Background</p>
      <h2 class="section-title">Education</h2>
      ${educationHTML}
    </section>

    <section id="experience" class="section glass glass-card">
      <p class="section-label">Career</p>
      <h2 class="section-title">Experience</h2>
      ${experienceHTML}
    </section>

    <section id="skills" class="section glass glass-card">
      <p class="section-label">Expertise</p>
      <h2 class="section-title">Skills</h2>
      <div class="skills-grid">${skillsHTML}</div>
    </section>

    <section id="contact" class="section glass glass-card">
      <p class="section-label">Get in Touch</p>
      <h2 class="section-title">Contact</h2>
      <div class="contact-list">
        <p class="contact-item">${escapeHTML(p.contact?.email || "")}</p>
        <p class="contact-item">${escapeHTML(p.contact?.location || "")}</p>
        <div>${socialHTML}</div>
      </div>
    </section>
  `;

  document.title = `${p.name || "Portfolio"} — Portfolio`;
}

/* ===== Content Editor ===== */
function buildEditForm() {
  const form = document.getElementById("edit-form");
  const p = currentProfile;

  const eduText = (p.education || [])
    .map((e) => `${e.period} | ${e.title} | ${e.institution} | ${e.description}`)
    .join("\n");

  const expText = (p.experience || [])
    .map((e) =>
      e.freeform ? e.title : `${e.period || ""} | ${e.title || ""} | ${e.company || ""} | ${e.description || ""}`
    )
    .join("\n");

  const socialText = (p.contact?.social || [])
    .map((s) => `${s.label} | ${s.url}`)
    .join("\n");

  form.innerHTML = `
    <div class="edit-group">
      <label for="edit-name">Name</label>
      <input type="text" id="edit-name" value="${escapeAttr(p.name || "")}" />
    </div>
    <div class="edit-group">
      <label for="edit-title">Title</label>
      <input type="text" id="edit-title" value="${escapeAttr(p.title || "")}" />
    </div>
    <div class="edit-group">
      <label for="edit-about">About Me</label>
      <textarea id="edit-about">${escapeHTML(p.about || "")}</textarea>
    </div>

    <p class="edit-section-title">Education</p>
    <div class="edit-group">
      <label for="edit-education">One entry per line: Period | Title | Institution | Description</label>
      <textarea id="edit-education" rows="4">${escapeHTML(eduText)}</textarea>
    </div>

    <p class="edit-section-title">Experience</p>
    <div class="edit-group">
      <label for="edit-experience">每行一条经历，可自由书写；如需分层展示，可按需使用 | 分隔内容。</label>
      <textarea id="edit-experience" rows="10">${escapeHTML(expText)}</textarea>
    </div>

    <p class="edit-section-title">Skills</p>
    <div class="edit-group">
      <label for="edit-skills">Comma separated</label>
      <input type="text" id="edit-skills" value="${escapeAttr((p.skills || []).join(", "))}" />
    </div>

    <p class="edit-section-title">Contact</p>
    <div class="edit-group">
      <label for="edit-email">Email</label>
      <input type="text" id="edit-email" value="${escapeAttr(p.contact?.email || "")}" />
    </div>
    <div class="edit-group">
      <label for="edit-location">Location</label>
      <input type="text" id="edit-location" value="${escapeAttr(p.contact?.location || "")}" />
    </div>
    <div class="edit-group">
      <label for="edit-social">Social links — one per line: Label | URL</label>
      <textarea id="edit-social" rows="3">${escapeHTML(socialText)}</textarea>
    </div>
  `;
}

function parseTimeline(text, type) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((s) => s.trim());
      if (type === "education") {
        return {
          period: parts[0] || "",
          title: parts[1] || "",
          institution: parts[2] || "",
          description: parts.slice(3).join(" | ") || "",
        };
      }

      if (parts.length === 1) {
        return { title: parts[0] || "", freeform: true };
      }

      return {
        period: parts[0] || "",
        title: parts[1] || "",
        company: parts[2] || "",
        description: parts.slice(3).join(" | ") || "",
      };
    });
}

function parseSocial(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((s) => s.trim());
      return { label: parts[0] || "", url: parts[1] || "" };
    });
}

function collectFormData() {
  return {
    name: document.getElementById("edit-name").value.trim(),
    title: document.getElementById("edit-title").value.trim(),
    about: document.getElementById("edit-about").value.trim(),
    education: parseTimeline(document.getElementById("edit-education").value, "education"),
    experience: parseTimeline(document.getElementById("edit-experience").value, "experience"),
    skills: document
      .getElementById("edit-skills")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    contact: {
      email: document.getElementById("edit-email").value.trim(),
      location: document.getElementById("edit-location").value.trim(),
      social: parseSocial(document.getElementById("edit-social").value),
    },
  };
}

function showToast(message) {
  let toast = document.querySelector(".edit-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "edit-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function exportContentJS(data) {
  const content = `const profile = ${JSON.stringify(data, null, 2)};\n`;
  const blob = new Blob([content], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "content.js";
  a.click();
  URL.revokeObjectURL(url);
}

function initContentEditor() {
  const editToggle = document.getElementById("edit-toggle");
  const editPanel = document.getElementById("edit-panel");
  const editOverlay = document.getElementById("edit-overlay");
  const editClose = document.getElementById("edit-close");
  const saveBtn = document.getElementById("save-content");
  const exportBtn = document.getElementById("export-content");
  const resetBtn = document.getElementById("reset-content");

  function openPanel() {
    buildEditForm();
    editPanel.hidden = false;
    editOverlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closePanel() {
    editPanel.hidden = true;
    editOverlay.hidden = true;
    document.body.style.overflow = "";
  }

  editToggle.addEventListener("click", openPanel);
  editClose.addEventListener("click", closePanel);
  editOverlay.addEventListener("click", closePanel);

  saveBtn.addEventListener("click", () => {
    currentProfile = collectFormData();
    saveProfile(currentProfile);
    renderContent();
    initScrollReveal();
    closePanel();
    showToast("Content saved!");
  });

  exportBtn.addEventListener("click", () => {
    const data = collectFormData();
    exportContentJS(data);
    showToast("content.js downloaded");
  });

  resetBtn.addEventListener("click", () => {
    if (!confirm("Reset all content to content.js defaults?")) return;
    resetProfile();
    currentProfile = getDefaultProfile();
    renderContent();
    initScrollReveal();
    closePanel();
    showToast("Reset to default");
  });
}

/* ===== Loading Screen ===== */
function initLoading() {
  const loadingScreen = document.getElementById("loading-screen");

  window.addEventListener("load", () => {
    setTimeout(() => {
      loadingScreen.classList.add("hidden");
      document.body.classList.add("loaded");
      initScrollReveal();
    }, 1200);
  });
}

/* ===== Scroll Progress ===== */
function initScrollProgress() {
  const progressBar = document.getElementById("scroll-progress");

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  });
}

/* ===== Scroll Reveal ===== */
function initScrollReveal() {
  const sections = document.querySelectorAll(".section");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  sections.forEach((section, index) => {
    section.classList.remove("visible");
    section.style.transitionDelay = `${index * 0.08}s`;
    observer.observe(section);
  });
}

/* ===== Navigation ===== */
function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-links a");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinksContainer = document.querySelector(".nav-links");
  const sections = () => document.querySelectorAll("section[id]");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
      navLinksContainer.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  navToggle.addEventListener("click", () => {
    const isOpen = navLinksContainer.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + 120;
    sections().forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  });
}

/* ===== Parallax Background ===== */
function initParallax() {
  const parallaxBg = document.getElementById("parallax-bg");
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  document.addEventListener("mousemove", (e) => {
    const xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
    const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;
    targetX = xRatio * 15;
    targetY = yRatio * 15;
  });

  function animate() {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;
    parallaxBg.style.transform = `translate(${currentX}px, ${currentY}px) scale(1.05)`;
    requestAnimationFrame(animate);
  }

  animate();
}

/* ===== Starfield Particles ===== */
function initStarfield() {
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  let stars = [];
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.5 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    stars.forEach((star) => {
      star.y -= star.speed;
      star.twinkle += 0.02;

      if (star.y < 0) {
        star.y = height;
        star.x = Math.random() * width;
      }

      const alpha = star.opacity * (0.6 + 0.4 * Math.sin(star.twinkle));
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
}

/* ===== Mouse Trail ===== */
function initMouseTrail() {
  const canvas = document.getElementById("mouse-trail");
  const ctx = canvas.getContext("2d");
  const particles = [];
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  document.addEventListener("mousemove", (e) => {
    for (let i = 0; i < 2; i++) {
      particles.push({
        x: e.clientX + (Math.random() - 0.5) * 10,
        y: e.clientY + (Math.random() - 0.5) * 10,
        size: Math.random() * 4 + 2,
        life: 1,
        decay: Math.random() * 0.02 + 0.015,
      });
    }
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      const trailColor = document.body.classList.contains("background-two")
        ? `rgba(65, 211, 202, ${p.life * 0.65})`
        : `rgba(65, 211, 202, ${p.life * 0.6})`;
      ctx.fillStyle = trailColor;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
}

/* ===== Music Toggle ===== */
function initMusicToggle() {
  const audio = document.getElementById("audio-player");
  const toggle = document.getElementById("music-toggle");
  const iconPlay = toggle.querySelector(".icon-play");
  const iconPause = toggle.querySelector(".icon-pause");

  audio.volume = 0.6;

  function setPlaying(isPlaying) {
    toggle.classList.toggle("playing", isPlaying);
    iconPlay.hidden = isPlaying;
    iconPause.hidden = !isPlaying;
    toggle.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music");
  }

  toggle.addEventListener("click", async () => {
    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (err) {
      console.warn("Playback failed:", err);
    }
  });

  audio.addEventListener("play", () => setPlaying(true));
  audio.addEventListener("pause", () => setPlaying(false));
  audio.addEventListener("ended", () => setPlaying(false));
}

/* ===== Background Toggle ===== */
function initBackgroundToggle() {
  const toggle = document.getElementById("background-toggle");
  if (!toggle) return;

  function setBackground(useSecondBackground) {
    document.body.classList.toggle("background-two", useSecondBackground);
    toggle.setAttribute("aria-pressed", String(useSecondBackground));
    toggle.setAttribute(
      "aria-label",
      useSecondBackground ? "Switch to first background" : "Switch to second background"
    );
    toggle.title = toggle.getAttribute("aria-label");
    toggle.querySelector("span").textContent = useSecondBackground ? "◑" : "◐";
  }

  setBackground(localStorage.getItem(BACKGROUND_KEY) === "two");

  toggle.addEventListener("click", () => {
    const useSecondBackground = !document.body.classList.contains("background-two");
    setBackground(useSecondBackground);
    localStorage.setItem(BACKGROUND_KEY, useSecondBackground ? "two" : "one");
  });
}

/* ===== Init ===== */
document.addEventListener("DOMContentLoaded", () => {
  renderContent();
  initLoading();
  initScrollProgress();
  initNavigation();
  initParallax();
  initStarfield();
  initMouseTrail();
  initMusicToggle();
  initBackgroundToggle();
  initContentEditor();
});
