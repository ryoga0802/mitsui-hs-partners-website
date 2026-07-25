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
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hero = document.querySelector(".hero");
  const heroContent = document.querySelector(".hero-content");

  if (motionAllowed && finePointer && hero && heroContent) {
    let animationFrame;

    hero.addEventListener("pointermove", (event) => {
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;

      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        hero.style.setProperty("--pointer-x", `${x * 100}%`);
        hero.style.setProperty("--pointer-y", `${y * 100}%`);
        heroContent.style.transform = `translate3d(${(x - 0.5) * 12}px, ${(y - 0.5) * 8}px, 0)`;
      });
    });

    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--pointer-x", "50%");
      hero.style.setProperty("--pointer-y", "45%");
      heroContent.style.transform = "";
    });
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
