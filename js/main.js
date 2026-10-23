(() => {
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const toast = document.querySelector("[data-toast]");
  let toastTimer;

  const setHeaderState = () => header.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", setHeaderState, { passive: true });
  setHeaderState();

  const closeMenu = () => {
    menuButton.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "メニューを開く");
    mobileNav.classList.remove("open");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.classList.toggle("open");
    mobileNav.classList.toggle("open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.classList.contains("open")) {
      closeMenu();
      menuButton.focus();
    }
  });
  window.matchMedia("(min-width: 1280px)").addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3500);
  };

  mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  const agreement = document.querySelector("[data-agreement]");
  const submitButton = document.querySelector("[data-submit]");
  agreement?.addEventListener("change", () => {
    submitButton.disabled = !agreement.checked;
  });

  document.querySelector("[data-contact-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("このフォームはデモです。お問い合わせ内容は送信されません。");
  });

  // Each listing owns its controls, items, and result count.
  document.querySelectorAll("[data-listing]").forEach((listing) => {
    const buttons = listing.querySelectorAll("[data-filter]");
    const search = listing.querySelector("[data-search]");
    const year = listing.querySelector("[data-year]");
    const items = [...listing.querySelectorAll("[data-item]")];
    const status = listing.querySelector("[data-results]");
    const empty = listing.querySelector("[data-empty]");
    let category = "all";
    const update = () => {
      const query = (search?.value || "").trim().normalize("NFKC").toLocaleLowerCase("ja");
      let count = 0;
      items.forEach((item) => {
        const matches = (category === "all" || item.dataset.category === category)
          && (!year?.value || item.dataset.year === year.value)
          && (!query || item.textContent.normalize("NFKC").toLocaleLowerCase("ja").includes(query));
        item.hidden = !matches;
        if (matches) count++;
      });
      if (status) status.textContent = `${count}件を表示`;
      if (empty) empty.hidden = count !== 0;
    };
    buttons.forEach((button) => button.addEventListener("click", () => {
      category = button.dataset.filter;
      buttons.forEach((control) => control.setAttribute("aria-pressed", String(control === button)));
      update();
    }));
    search?.addEventListener("input", update);
    year?.addEventListener("change", update);
    update();
  });

  // Links from the homepage open their matching inline article.
  const openHashTarget = () => {
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    if (!target) return;
    const details = target.matches("details") ? target : target.closest("details");
    if (details) details.open = true;
    if (location.hash) target.scrollIntoView({ block: "start" });
  };
  window.addEventListener("hashchange", openHashTarget);
  openHashTarget();

  const motionAllowed = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  const maskedVideos = document.querySelectorAll("[data-masked-video]");

  if (maskedVideos.length) {
    const visibleVideos = new Set();
    const loopTimers = new Map();

    const clearLoopTimer = (video) => {
      const timer = loopTimers.get(video);
      if (timer) window.clearTimeout(timer);
      loopTimers.delete(video);
    };

    const setVideoPlayback = (video, shouldPlay) => {
      if (!shouldPlay || document.hidden || !motionAllowed) {
        clearLoopTimer(video);
        video.pause();
        video.dataset.videoState = "paused";
        return;
      }

      if (loopTimers.has(video)) return;

      if (video.ended) video.currentTime = 0;
      video.playbackRate = Number(video.dataset.playbackRate || 0.72);
      const playAttempt = video.play();
      video.dataset.videoState = "playing";
      if (playAttempt) {
        playAttempt.catch(() => {
          video.dataset.videoState = "blocked";
        });
      }
    };

    if (motionAllowed) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) visibleVideos.add(entry.target);
            else visibleVideos.delete(entry.target);
            setVideoPlayback(entry.target, entry.isIntersecting);
          });
        },
        { threshold: 0.08 },
      );

      maskedVideos.forEach((video) => {
        video.loop = false;
        video.playbackRate = Number(video.dataset.playbackRate || 0.72);
        video.addEventListener("ended", () => {
          video.dataset.videoState = "holding";
          clearLoopTimer(video);

          const delay = Number(video.dataset.loopDelay || 1000);
          const timer = window.setTimeout(() => {
            loopTimers.delete(video);
            if (visibleVideos.has(video) && !document.hidden) {
              video.currentTime = 0;
              setVideoPlayback(video, true);
            }
          }, delay);

          loopTimers.set(video, timer);
        });
        videoObserver.observe(video);
      });
      document.addEventListener("visibilitychange", () => {
        maskedVideos.forEach((video) => setVideoPlayback(video, visibleVideos.has(video)));
      });
    } else {
      maskedVideos.forEach((video) => setVideoPlayback(video, false));
    }
  }

  const counters = document.querySelectorAll("[data-count-to]");

  const setCounterValue = (element, value) => {
    const prefix = element.dataset.countPrefix || "";
    const suffix = element.dataset.countSuffix || "";
    element.textContent = `${prefix}${Math.round(value).toLocaleString("ja-JP")}${suffix}`;
  };

  const runCounter = (element) => {
    if (element.dataset.counted === "true") return;
    element.dataset.counted = "true";

    const target = Number(element.dataset.countTo || 0);
    if (!motionAllowed || !Number.isFinite(target)) {
      setCounterValue(element, target);
      return;
    }

    const startedAt = performance.now();
    const duration = 1100;
    const update = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCounterValue(element, target * eased);
      if (progress < 1) window.requestAnimationFrame(update);
    };
    window.requestAnimationFrame(update);
  };

  if (motionAllowed) {
    const counterObserver = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          currentObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.35 },
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(runCounter);
  }

  const reveals = document.querySelectorAll(".reveal");
  if (!motionAllowed) {
    reveals.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.delay || 0);
        window.setTimeout(() => entry.target.classList.add("is-visible"), delay);
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  reveals.forEach((element) => observer.observe(element));
})();
