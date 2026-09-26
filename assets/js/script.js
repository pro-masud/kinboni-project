const header = document.getElementById("site-header");
const revealItems = document.querySelectorAll(".reveal-up, .reveal-scale");
const wishlistButtons = document.querySelectorAll(".wishlist-button");
const heroVideo = document.querySelector(".hero-video");
const heroImage = document.querySelector(".hero-image");
const videoToggle = document.querySelector(".video-toggle");
let heroVideoPausedByUser = false;
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const stickyCart = document.querySelector(".sticky-cart");
const cartCount = document.querySelector(".cart-count");
const searchPanel = document.querySelector(".search-panel");
const searchForm = document.querySelector(".search-form");
const quizModal = document.querySelector(".quiz-modal");
const cartDrawer = document.querySelector(".cart-drawer");
const cartItemsElement = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const cartItems = [];

const updateHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const setupPageAnimations = () => {
  if (!window.gsap || prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);

  const sectionItems = document.querySelectorAll(
    ".trust-item, .category-card, .product-card, .concern-card, .ingredient-card, .routine-step, .testimonial-card, .collection-card, .benefit-card, .ugc-card, .faq-item",
  );

  revealItems.forEach((section) => {
    const headingItems = section.querySelectorAll(
      ".section-heading > *, .banner-copy > *, .story-copy > *, .newsletter-shell > *",
    );
    const cards = Array.from(sectionItems).filter((item) =>
      section.contains(item),
    );

    window.gsap.fromTo(
      section,
      {
        opacity: 0,
        y: 34,
        scale: section.classList.contains("reveal-scale") ? 0.98 : 1,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: window.ScrollTrigger
          ? { trigger: section, start: "top 86%", once: true }
          : undefined,
      },
    );

    if (headingItems.length) {
      window.gsap.from(headingItems, {
        opacity: 0,
        y: 20,
        duration: 0.55,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: window.ScrollTrigger
          ? { trigger: section, start: "top 82%", once: true }
          : undefined,
      });
    }

    if (cards.length) {
      window.gsap.from(cards, {
        opacity: 0,
        y: 28,
        duration: 0.65,
        stagger: 0.09,
        ease: "power2.out",
        scrollTrigger: window.ScrollTrigger
          ? { trigger: section, start: "top 78%", once: true }
          : undefined,
      });
    }
  });

  window.gsap.from(".site-header", {
    y: -24,
    opacity: 0,
    duration: 0.7,
    ease: "power3.out",
  });
};

setupPageAnimations();

const animateHeroSlide = (slide) => {
  if (!window.gsap || prefersReducedMotion || !slide) return;

  const copy = slide.querySelector(".hero-copy");
  const visual = slide.querySelector(".hero-visual");
  const eyebrow = slide.querySelector(".eyebrow");
  const heading = slide.querySelector("h1");
  const paragraph = slide.querySelector(".hero-copy p");
  const actions = slide.querySelector(".hero-actions");
  const metrics = slide.querySelector(".hero-metrics");
  const frame = slide.querySelector(".image-frame");
  const badges = slide.querySelectorAll(".product-badge");

  window.gsap.killTweensOf([copy, visual, frame, badges]);
  window.gsap.set([copy, visual], { clearProps: "transform" });
  window.gsap.set([eyebrow, heading, paragraph, actions, metrics], {
    opacity: 0,
    y: 24,
  });
  window.gsap.set([frame, badges], { opacity: 0, scale: 0.94 });

  const timeline = window.gsap.timeline({ defaults: { ease: "power3.out" } });
  timeline
    .to(eyebrow, { opacity: 1, y: 0, duration: 0.45 })
    .to(heading, { opacity: 1, y: 0, duration: 0.7 }, "-=0.2")
    .to(paragraph, { opacity: 1, y: 0, duration: 0.5 }, "-=0.35")
    .to(actions, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25")
    .to(metrics, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25")
    .to(frame, { opacity: 1, scale: 1, duration: 0.9 }, "-=0.75")
    .to(
      badges,
      { opacity: 1, scale: 1, duration: 0.55, stagger: 0.12 },
      "-=0.5",
    );
};

const updateHeroBackground = (slide) => {
  if (!heroVideo || !slide) return;

  const videoSource = slide.dataset.video;
  const poster = slide.querySelector(".hero-visual img")?.src;

  if (poster) {
    if (heroImage) heroImage.src = poster;
    heroVideo.poster = poster;
  }

  if (!videoSource || heroVideo.getAttribute("src") === videoSource) return;

  heroVideo.classList.remove("is-ready");
  heroVideo.src = videoSource;
  heroVideo.load();

  if (!heroVideoPausedByUser) {
    const playRequest = heroVideo.play();
    if (playRequest) playRequest.catch(() => {});
  }
};

heroVideo?.addEventListener("canplay", () => {
  heroVideo.classList.add("is-ready");
});

heroVideo?.addEventListener("error", () => {
  heroVideo.classList.remove("is-ready");
});

const closeSearch = () => {
  if (!searchPanel) return;
  searchPanel.classList.remove("is-open");
  searchPanel.setAttribute("aria-hidden", "true");
};

const closeMobileMenu = () => {
  if (!mobileMenu || !menuToggle) return;
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  menuToggle.querySelector("i").className = "fa-solid fa-bars";
  document.body.classList.remove("menu-open");
};

document.querySelectorAll(".search-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    closeMobileMenu();
    searchPanel?.classList.add("is-open");
    searchPanel?.setAttribute("aria-hidden", "false");
    searchPanel?.querySelector("input")?.focus();
  });
});

searchPanel
  ?.querySelector(".search-close")
  ?.addEventListener("click", closeSearch);
searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchForm.querySelector("input")?.value.trim().toLowerCase();
  const status = searchForm.querySelector(".search-status");
  const products = Array.from(document.querySelectorAll(".product-card"));
  if (!query) {
    products.forEach((product) => product.removeAttribute("hidden"));
    if (status) status.textContent = "Showing all products.";
    return;
  }
  const matches = products.filter((product) => {
    const searchableText = product.textContent.toLowerCase();
    const matchesQuery = searchableText.includes(query);
    product.toggleAttribute("hidden", !matchesQuery);
    return matchesQuery;
  });
  if (status)
    status.textContent = matches.length
      ? `${matches.length} product${matches.length === 1 ? "" : "s"} found.`
      : "No bags found. Try tote, crossbody or shoulder bag.";
});

const renderCart = () => {
  if (!cartItemsElement || !cartEmpty) return;
  cartItemsElement.innerHTML = cartItems
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" />
      <div><strong>${item.title}</strong><span>${item.price} · Qty ${item.quantity}</span></div>
    </div>
  `,
    )
    .join("");
  cartEmpty.hidden = cartItems.length > 0;
};

const openCart = () => {
  cartDrawer?.classList.add("is-open");
  cartDrawer?.setAttribute("aria-hidden", "false");
  renderCart();
};

const closeCart = () => {
  cartDrawer?.classList.remove("is-open");
  cartDrawer?.setAttribute("aria-hidden", "true");
};

document.querySelector(".cart-button")?.addEventListener("click", openCart);
document.querySelector(".cart-close")?.addEventListener("click", closeCart);

const addToCart = (card) => {
  const title =
    card.querySelector("h3")?.textContent.trim() || "Kinboni product";
  const price = card.querySelector(".price")?.textContent.trim() || "$0";
  const image = card.querySelector(".product-media img")?.src || "";
  const existingItem = cartItems.find((item) => item.title === title);
  if (existingItem) existingItem.quantity += 1;
  else cartItems.push({ title, price, image, quantity: 1 });
  if (cartCount)
    cartCount.textContent = String(
      cartItems.reduce((total, item) => total + item.quantity, 0) + 2,
    );
  if (stickyCart) {
    stickyCart.classList.add("is-visible");
    window.setTimeout(() => stickyCart.classList.remove("is-visible"), 3200);
  }
};

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    menuToggle.querySelector("i").className = isOpen
      ? "fa-solid fa-xmark"
      : "fa-solid fa-bars";
  });

  mobileMenu
    .querySelector(".mobile-menu-close")
    ?.addEventListener("click", closeMobileMenu);
  mobileMenu.addEventListener("click", (event) => {
    if (event.target === mobileMenu) closeMobileMenu();
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });
}

const heroSlider = document.querySelector(".hero-slider");
if (window.Swiper && heroSlider) {
  try {
    const heroSwiper = new window.Swiper(heroSlider, {
      loop: true,
      effect: "fade",
      fadeEffect: { crossFade: true },
      speed: 850,
      autoplay: {
        delay: 10000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: ".hero-pagination",
        clickable: true,
      },
      keyboard: {
        enabled: true,
      },
      a11y: {
        enabled: true,
      },
      on: {
        init(swiper) {
          const activeSlide = swiper.slides[swiper.activeIndex];
          updateHeroBackground(activeSlide);
          animateHeroSlide(activeSlide);
        },
        slideChangeTransitionStart(swiper) {
          const activeSlide = swiper.slides[swiper.activeIndex];
          updateHeroBackground(activeSlide);
          animateHeroSlide(activeSlide);
        },
      },
    });
    if (!prefersReducedMotion)
      animateHeroSlide(heroSwiper.slides[heroSwiper.activeIndex]);
  } catch (error) {
    heroSlider.classList.add("swiper-init-failed");
  }
} else if (heroSlider) {
  heroSlider.classList.add("swiper-init-failed");
}

const categorySlider = document.querySelector(".category-grid");
if (window.Swiper && categorySlider) {
  try {
    new window.Swiper(categorySlider, {
      slidesPerView: 1,
      spaceBetween: 16,
      speed: 700,
      grabCursor: true,
      watchOverflow: true,
      autoplay: {
        delay: 4500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: ".category-pagination",
        clickable: true,
      },
      breakpoints: {
        761: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1100: {
          slidesPerView: 4,
          spaceBetween: 22,
        },
      },
    });
  } catch (error) {
    categorySlider.classList.add("swiper-init-failed");
  }
} else if (categorySlider) {
  categorySlider.classList.add("swiper-init-failed");
}

const testimonialSlider = document.querySelector(".testimonials-carousel");
if (window.Swiper && testimonialSlider) {
  try {
    new window.Swiper(testimonialSlider, {
      slidesPerView: 1,
      spaceBetween: 18,
      speed: 650,
      grabCursor: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: ".testimonial-pagination",
        clickable: true,
      },
      navigation: {
        prevEl: ".testimonial-prev",
        nextEl: ".testimonial-next",
      },
      breakpoints: {
        761: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1100: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
      },
    });
  } catch (error) {
    testimonialSlider.classList.add("swiper-init-failed");
  }
} else if (testimonialSlider) {
  testimonialSlider.classList.add("swiper-init-failed");
}

if (heroVideo && videoToggle) {
  videoToggle.addEventListener("click", () => {
    const icon = videoToggle.querySelector("i");
    const label = videoToggle.querySelector("span");
    if (!icon || !label) return;

    if (heroVideo.paused) {
      heroVideoPausedByUser = false;
      const playRequest = heroVideo.play();
      if (playRequest) playRequest.catch(() => {});
      icon.className = "fa-solid fa-pause";
      label.textContent = "Pause motion";
      videoToggle.setAttribute("aria-label", "Pause background video");
    } else {
      heroVideoPausedByUser = true;
      heroVideo.pause();
      icon.className = "fa-solid fa-play";
      label.textContent = "Play motion";
      videoToggle.setAttribute("aria-label", "Play background video");
    }
  });
}

wishlistButtons.forEach((button) => {
  const productCard = button.closest(".product-card");
  const productKey = productCard?.querySelector("h3")?.textContent.trim();
  if (
    productKey &&
    localStorage.getItem(`kinboni-wishlist-${productKey}`) === "true"
  ) {
    button.classList.add("is-active");
    button.querySelector("i")?.classList.replace("fa-regular", "fa-solid");
  }
  button.addEventListener("click", () => {
    button.classList.toggle("is-active");
    const icon = button.querySelector("i");
    if (!icon) return;
    if (button.classList.contains("is-active")) {
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
    } else {
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
    }
    if (productKey)
      localStorage.setItem(
        `kinboni-wishlist-${productKey}`,
        String(button.classList.contains("is-active")),
      );
  });
});

document.querySelectorAll(".product-card").forEach((card) => {
  const actions = card.querySelector(".price-row");
  const quickAdd = card.querySelector(".mini-button");
  if (!actions || !quickAdd) return;

  quickAdd.textContent = "Add to Bag";
  quickAdd.setAttribute("aria-label", "Add product to bag");

  const rating = card.querySelector(".rating");
  if (rating) rating.insertAdjacentText("beforeend", " (128)");

  quickAdd.addEventListener("click", () => {
    addToCart(card);
  });
});

document.querySelectorAll(".badge-sale").forEach((badge) => {
  badge.textContent = "SALE -25%";
});

document.querySelectorAll(".quiz-open").forEach((button) => {
  button.addEventListener("click", () => {
    quizModal?.classList.add("is-open");
    quizModal?.setAttribute("aria-hidden", "false");
  });
});

const closeQuiz = () => {
  quizModal?.classList.remove("is-open");
  quizModal?.setAttribute("aria-hidden", "true");
};
quizModal?.querySelector(".quiz-close")?.addEventListener("click", closeQuiz);
quizModal?.querySelectorAll("[data-concern]").forEach((option) => {
  option.addEventListener("click", () => {
    const result = quizModal.querySelector(".quiz-result");
    if (result)
      result.textContent = `Your starting point: ${option.textContent}. Explore the routine below.`;
  });
});

const newsletterForm = document.querySelector(".newsletter-form");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = newsletterForm.querySelector("button");
    button.textContent = "Subscribed";
    button.disabled = true;
    button.style.opacity = "0.8";
  });
}

const galleryLightbox = document.querySelector(".gallery-lightbox");
const galleryPreview = galleryLightbox?.querySelector(".gallery-preview");
const galleryCaption = galleryLightbox?.querySelector(".gallery-caption");

const closeGallery = () => {
  galleryLightbox?.classList.remove("is-open");
  galleryLightbox?.setAttribute("aria-hidden", "true");
};

document.querySelectorAll(".ugc-item").forEach((item) => {
  item.addEventListener("click", () => {
    const image = item.querySelector("img");
    if (!image || !galleryLightbox || !galleryPreview || !galleryCaption)
      return;
    galleryPreview.src = image.src;
    galleryPreview.alt = image.alt;
    galleryCaption.textContent = image.alt;
    galleryLightbox.classList.add("is-open");
    galleryLightbox.setAttribute("aria-hidden", "false");
  });
});

galleryLightbox
  ?.querySelector(".gallery-close")
  ?.addEventListener("click", closeGallery);
galleryLightbox?.addEventListener("click", (event) => {
  if (event.target === galleryLightbox) closeGallery();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeGallery();
});
