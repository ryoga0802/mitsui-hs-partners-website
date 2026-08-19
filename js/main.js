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

  const showToast = (message) => {
    toast.textContent = `「${message}」ページは準備中です。`;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3500);
  };

  document.querySelectorAll("[data-coming-soon]").forEach((button) => {
    button.addEventListener("click", () => {
      closeMenu();
      showToast(button.dataset.comingSoon);
    });
  });

  mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  const agreement = document.querySelector("[data-agreement]");
  const submitButton = document.querySelector("[data-submit]");
  agreement.addEventListener("change", () => {
    submitButton.disabled = !agreement.checked;
  });

  document.querySelector("[data-contact-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("お問い合わせ（送信）");
  });

  const motionAllowed = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  const maskedVideos = document.querySelectorAll("[data-masked-video]");

  if (maskedVideos.length) {
    const setVideoPlayback = (video, shouldPlay) => {
      if (!shouldPlay || document.hidden || !motionAllowed) {
        video.pause();
        video.dataset.videoState = "paused";
        return;
      }

      const playAttempt = video.play();
      video.dataset.videoState = "playing";
      if (playAttempt) {
        playAttempt.catch(() => {
          video.dataset.videoState = "blocked";
        });
      }
    };

    if (motionAllowed) {
      const visibleVideos = new Set();
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

      maskedVideos.forEach((video) => videoObserver.observe(video));
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
