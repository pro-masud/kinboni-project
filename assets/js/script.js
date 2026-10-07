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
const wishlistDrawer = document.querySelector(".wishlist-drawer");
const wishlistItemsElement = document.querySelector(".wishlist-items");
const wishlistEmpty = document.querySelector(".wishlist-empty");
const cartItemsElement = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const cartItems = [];
const overlayFocusTargets = new WeakMap();

const setOverlayState = (overlay, isOpen, focusTarget, trigger) => {
  if (!overlay) return;
  if (isOpen) {
    overlayFocusTargets.set(overlay, trigger || document.activeElement);
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    overlay.inert = false;
    focusTarget?.focus();
    return;
  }
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  overlay.inert = true;
  overlayFocusTargets.get(overlay)?.focus();
};

const updateHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
if (prefersReducedMotion && videoToggle) videoToggle.hidden = true;

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
  if (prefersReducedMotion) {
    heroVideo.pause();
    return;
  }

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
heroVideo?.addEventListener("loadedmetadata", () => {
  if (heroVideoPausedByUser || prefersReducedMotion) return;
  const playRequest = heroVideo.play();
  if (playRequest) playRequest.catch(() => {});
});

const closeSearch = () => {
  setOverlayState(searchPanel, false);
};

const closeMobileMenu = () => {
  if (!mobileMenu || !menuToggle) return;
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  mobileMenu.inert = true;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  menuToggle.querySelector("i").className = "fa-solid fa-bars";
  document.body.classList.remove("menu-open");
  menuToggle.focus();
};

document.querySelectorAll(".search-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const trigger = mobileMenu?.classList.contains("is-open")
      ? menuToggle
      : button;
    if (mobileMenu?.classList.contains("is-open")) closeMobileMenu();
    setOverlayState(
      searchPanel,
      true,
      searchPanel?.querySelector("input"),
      trigger,
    );
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
    document.dispatchEvent(
      new CustomEvent("shop:search", { detail: { query: "" } }),
    );
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
  document.dispatchEvent(
    new CustomEvent("shop:search", { detail: { query } }),
  );
});

const renderWishlist = () => {
  if (!wishlistItemsElement || !wishlistEmpty) return;
  wishlistItemsElement.replaceChildren();
  const savedProducts = Array.from(
    document.querySelectorAll(".product-card .wishlist-button.is-active"),
  )
    .map((button) => button.closest(".product-card"))
    .filter(Boolean);

  savedProducts.forEach((card) => {
    const item = document.createElement("div");
    item.className = "cart-item";
    const image = card.querySelector(".product-media img");
    const title = card.querySelector("h3")?.textContent.trim() || "Kinboni bag";
    const price = card.querySelector(".price")?.textContent.trim() || "";
    if (image) {
      const thumbnail = image.cloneNode();
      thumbnail.alt = title;
      item.append(thumbnail);
    }
    const description = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = title;
    const priceLabel = document.createElement("span");
    priceLabel.textContent = price;
    description.append(name, priceLabel);
    item.append(description);
    wishlistItemsElement.append(item);
  });
  wishlistEmpty.hidden = savedProducts.length > 0;
};

document.querySelectorAll(".wishlist-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const trigger = mobileMenu?.classList.contains("is-open")
      ? menuToggle
      : button;
    if (mobileMenu?.classList.contains("is-open")) closeMobileMenu();
    renderWishlist();
    setOverlayState(
      wishlistDrawer,
      true,
      wishlistDrawer?.querySelector(".wishlist-close"),
      trigger,
    );
  });
});

wishlistDrawer
  ?.querySelector(".wishlist-close")
  ?.addEventListener("click", () => setOverlayState(wishlistDrawer, false));

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

const openCart = (trigger) => {
  setOverlayState(
    cartDrawer,
    true,
    cartDrawer?.querySelector(".cart-close"),
    trigger,
  );
  renderCart();
};

const closeCart = () => {
  setOverlayState(cartDrawer, false);
};

document.querySelector(".cart-button")?.addEventListener("click", (event) => {
  openCart(event.currentTarget);
});
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
      cartItems.reduce((total, item) => total + item.quantity, 0),
    );
  if (stickyCart) {
    const itemTitle = stickyCart.querySelector(".sticky-cart-item");
    if (itemTitle) itemTitle.textContent = title;
    stickyCart.classList.add("is-visible");
    stickyCart.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      stickyCart.classList.remove("is-visible");
      stickyCart.setAttribute("aria-hidden", "true");
    }, 3200);
  }
};

stickyCart?.querySelector("button")?.addEventListener("click", (event) => {
  openCart(document.querySelector(".cart-button") || event.currentTarget);
});

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    mobileMenu.inert = !isOpen;
    menuToggle.querySelector("i").className = isOpen
      ? "fa-solid fa-xmark"
      : "fa-solid fa-bars";
    if (isOpen) {
      mobileMenu.querySelector(".mobile-menu-close")?.focus();
    } else {
      menuToggle.focus();
    }
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

}

const heroSlider = document.querySelector(".hero-slider");
if (window.Swiper && heroSlider) {
  try {
    const heroSwiper = new window.Swiper(heroSlider, {
      loop: true,
      effect: "fade",
      fadeEffect: { crossFade: true },
      speed: 850,
      autoplay: prefersReducedMotion
        ? false
        : {
            delay: 10000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
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
          if (prefersReducedMotion) swiper.autoplay.stop();
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

const shopIntroSlider = document.querySelector(".shop-intro-slider");
if (window.Swiper && shopIntroSlider) {
  new window.Swiper(shopIntroSlider, {
    loop: true,
    effect: "fade",
    fadeEffect: { crossFade: true },
    speed: 700,
    autoplay: prefersReducedMotion
      ? false
      : {
          delay: 6500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        },
    navigation: {
      nextEl: ".shop-intro-next",
      prevEl: ".shop-intro-prev",
    },
    pagination: {
      el: ".shop-intro-pagination",
      clickable: true,
    },
    keyboard: { enabled: true },
    a11y: { enabled: true },
  });
}

const aboutStorySlider = document.querySelector(".about-story-slider");
if (window.Swiper && aboutStorySlider) {
  const aboutStoryCount = aboutStorySlider.querySelector(".about-story-count");
  new window.Swiper(aboutStorySlider, {
    loop: true,
    effect: "fade",
    fadeEffect: { crossFade: true },
    speed: 900,
    autoplay: prefersReducedMotion
      ? false
      : {
          delay: 6800,
          disableOnInteraction: true,
          pauseOnMouseEnter: true,
        },
    navigation: {
      nextEl: ".about-story-next",
      prevEl: ".about-story-prev",
    },
    pagination: {
      el: ".about-story-pagination",
      clickable: true,
    },
    keyboard: { enabled: true },
    a11y: { enabled: true },
    on: {
      init(swiper) {
        if (aboutStoryCount)
          aboutStoryCount.textContent = `01 / ${String(swiper.slides.length).padStart(2, "0")}`;
      },
      slideChange(swiper) {
        if (aboutStoryCount)
          aboutStoryCount.textContent = `${String(swiper.realIndex + 1).padStart(2, "0")} / ${String(swiper.slides.length).padStart(2, "0")}`;
      },
    },
  });
}

const aboutDetailCarousel = document.querySelector(".about-detail-carousel");
if (aboutDetailCarousel) {
  const detailTrack = aboutDetailCarousel.querySelector(".swiper-wrapper");
  const detailSlides = Array.from(
    aboutDetailCarousel.querySelectorAll(".about-detail-slide"),
  );
  const detailPagination = aboutDetailCarousel.querySelector(
    ".about-detail-pagination",
  );
  const detailPrevious =
    aboutDetailCarousel.querySelector(".about-detail-prev");
  const detailNext = aboutDetailCarousel.querySelector(".about-detail-next");
  let detailIndex = 0;
  let detailTimer;

  const updateDetailSlider = (index) => {
    detailIndex = (index + detailSlides.length) % detailSlides.length;
    if (detailTrack)
      detailTrack.style.transform = `translate3d(-${detailIndex * 100}%, 0, 0)`;
    detailSlides.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", String(slideIndex !== detailIndex));
    });
    detailPagination
      ?.querySelectorAll("button")
      .forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === detailIndex);
      });
  };

  detailSlides.forEach((slide, slideIndex) => {
    slide.setAttribute("role", "group");
    slide.setAttribute(
      "aria-label",
      `${slideIndex + 1} of ${detailSlides.length}`,
    );
    const bullet = document.createElement("button");
    bullet.type = "button";
    bullet.className = "about-detail-dot";
    bullet.setAttribute("aria-label", `Show detail ${slideIndex + 1}`);
    bullet.addEventListener("click", () => updateDetailSlider(slideIndex));
    detailPagination?.append(bullet);
  });

  detailPrevious?.addEventListener("click", () =>
    updateDetailSlider(detailIndex - 1),
  );
  detailNext?.addEventListener("click", () =>
    updateDetailSlider(detailIndex + 1),
  );
  updateDetailSlider(0);

  if (!prefersReducedMotion) {
    detailTimer = window.setInterval(
      () => updateDetailSlider(detailIndex + 1),
      4800,
    );
    aboutDetailCarousel.addEventListener("mouseenter", () =>
      window.clearInterval(detailTimer),
    );
    aboutDetailCarousel.addEventListener("mouseleave", () => {
      detailTimer = window.setInterval(
        () => updateDetailSlider(detailIndex + 1),
        4800,
      );
    });
  }
}

const categorySlider = document.querySelector(".category-grid");
if (window.Swiper && categorySlider) {
  try {
    new window.Swiper(categorySlider, {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 16,
      speed: 700,
      grabCursor: true,
      watchOverflow: true,
      autoplay: prefersReducedMotion
        ? false
        : {
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
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
      loop: true,
      slidesPerView: 1,
      spaceBetween: 18,
      speed: 650,
      grabCursor: true,
      autoplay: prefersReducedMotion
        ? false
        : {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
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
  button.setAttribute(
    "aria-pressed",
    String(button.classList.contains("is-active")),
  );
  button.setAttribute(
    "aria-label",
    button.classList.contains("is-active")
      ? "Remove from wishlist"
      : "Add to wishlist",
  );
  button.addEventListener("click", () => {
    button.classList.toggle("is-active");
    button.setAttribute(
      "aria-pressed",
      String(button.classList.contains("is-active")),
    );
    button.setAttribute(
      "aria-label",
      button.classList.contains("is-active")
        ? "Remove from wishlist"
        : "Add to wishlist",
    );
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

const updateWishlistToggle = () => {
  const savedCount = document.querySelectorAll(
    ".product-card .wishlist-button.is-active",
  ).length;
  document.querySelectorAll(".wishlist-toggle").forEach((button) => {
    button.setAttribute(
      "aria-label",
      savedCount ? `Wishlist, ${savedCount} saved bags` : "Wishlist",
    );
    const label = button.querySelector("span");
    if (label)
      label.textContent = savedCount ? `Wishlist (${savedCount})` : "Wishlist";
  });
  if (wishlistDrawer?.classList.contains("is-open")) renderWishlist();
};

updateWishlistToggle();
wishlistButtons.forEach((button) => {
  button.addEventListener("click", updateWishlistToggle);
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
  button.addEventListener("click", () =>
    setOverlayState(
      quizModal,
      true,
      quizModal?.querySelector(".quiz-close"),
      button,
    ),
  );
});

const closeQuiz = () => {
  setOverlayState(quizModal, false);
};
quizModal?.querySelector(".quiz-close")?.addEventListener("click", closeQuiz);
quizModal?.addEventListener("click", (event) => {
  if (event.target === quizModal) closeQuiz();
});
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
    const status = newsletterForm
      .closest(".newsletter-form-wrap")
      ?.querySelector(".newsletter-status");
    if (status)
      status.textContent =
        "Newsletter sign-up is not connected yet. Please check back soon.";
  });
}

const galleryLightbox = document.querySelector(".gallery-lightbox");
const galleryPreview = galleryLightbox?.querySelector(".gallery-preview");
const galleryCaption = galleryLightbox?.querySelector(".gallery-caption");

const closeGallery = () => {
  setOverlayState(galleryLightbox, false);
};

document.querySelectorAll(".ugc-item").forEach((item) => {
  item.addEventListener("click", () => {
    const image = item.querySelector("img");
    if (!image || !galleryLightbox || !galleryPreview || !galleryCaption)
      return;
    galleryPreview.src = image.src;
    galleryPreview.alt = image.alt;
    galleryCaption.textContent = image.alt;
    setOverlayState(
      galleryLightbox,
      true,
      galleryLightbox.querySelector(".gallery-close"),
      item,
    );
  });
});

galleryLightbox
  ?.querySelector(".gallery-close")
  ?.addEventListener("click", closeGallery);
galleryLightbox?.addEventListener("click", (event) => {
  if (event.target === galleryLightbox) closeGallery();
});
document.addEventListener("keydown", (event) => {
  const activeOverlay = [
    galleryLightbox,
    quizModal,
    wishlistDrawer,
    cartDrawer,
    searchPanel,
    mobileMenu,
  ].find((overlay) => overlay?.classList.contains("is-open"));

  if (event.key === "Escape") {
    if (activeOverlay === galleryLightbox) closeGallery();
    else if (activeOverlay === quizModal) closeQuiz();
    else if (activeOverlay === wishlistDrawer)
      setOverlayState(wishlistDrawer, false);
    else if (activeOverlay === cartDrawer) closeCart();
    else if (activeOverlay === searchPanel) closeSearch();
    else if (activeOverlay === mobileMenu) closeMobileMenu();
    return;
  }

  if (event.key !== "Tab" || !activeOverlay) return;
  const dialog = activeOverlay.querySelector('[role="dialog"]') || activeOverlay;
  const focusable = Array.from(
    dialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.closest("[inert]"));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

const shopPage = document.querySelector(".shop-page");
if (shopPage) {
  const shopGrid = shopPage.querySelector(".shop-product-grid");
  const shopCards = Array.from(shopPage.querySelectorAll(".shop-product-card"));
  const shopFilters = shopPage.querySelector(".shop-filters");
  const shopCount = shopPage.querySelector(".shop-product-count");
  const shopEmpty = shopPage.querySelector(".shop-empty-state");
  const shopSort = shopPage.querySelector(".shop-sort select");
  const filterInputs = shopPage.querySelectorAll(".shop-filters input");
  let searchQuery = "";

  const priceMatches = (value, price) => {
    if (value === "under-50") return price < 50;
    if (value === "50-100") return price >= 50 && price <= 100;
    if (value === "100-200") return price > 100 && price <= 200;
    if (value === "200-plus") return price > 200;
    return true;
  };

  const selectedFilters = () => {
    const filters = {};
    filterInputs.forEach((input) => {
      if (input.checked) {
        if (!filters[input.dataset.filter]) filters[input.dataset.filter] = [];
        filters[input.dataset.filter].push(input.value);
      }
    });
    return filters;
  };

  const matchesFilters = (card, filters) =>
    (!searchQuery || card.textContent.toLowerCase().includes(searchQuery)) &&
    Object.entries(filters).every(([filter, values]) => {
      const cardValue = card.dataset[filter] || "";
      return values.some((value) =>
        filter === "price"
          ? priceMatches(value, Number(card.dataset.priceValue))
          : cardValue.split(" ").includes(value),
      );
    });

  const updateShop = () => {
    const filters = selectedFilters();
    const visibleCards = shopCards.filter((card) =>
      matchesFilters(card, filters),
    );
    shopCards.forEach((card) =>
      card.toggleAttribute("hidden", !visibleCards.includes(card)),
    );
    shopEmpty.hidden = visibleCards.length > 0;
    shopCount.textContent = `${visibleCards.length} Product${
      visibleCards.length === 1 ? "" : "s"
    }`;
    shopPage.querySelector(".shop-results-note").textContent =
      visibleCards.length
        ? `Showing 1-${visibleCards.length} of ${visibleCards.length} products`
        : "Showing 0 products";
  };

  const applyShopCategory = (value) => {
    filterInputs.forEach((input) => {
      input.checked = false;
    });
    if (value !== "all") {
      const filter = value === "new" ? "availability" : "category";
      const option = value === "new" ? "new" : value;
      const input = Array.from(filterInputs).find(
        (item) => item.dataset.filter === filter && item.value === option,
      );
      if (input) input.checked = true;
    }
    updateShop();
  };

  shopPage.querySelectorAll("[data-shop-filter]").forEach((link) => {
    link.addEventListener("click", () => {
      applyShopCategory(link.dataset.shopFilter);
    });
  });

  document.addEventListener("shop:search", (event) => {
    searchQuery = event.detail.query;
    updateShop();
  });

  const sortShop = (value) => {
    const sortedCards = [...shopCards].sort((first, second) => {
      if (value === "low")
        return (
          Number(first.dataset.priceValue) - Number(second.dataset.priceValue)
        );
      if (value === "high")
        return (
          Number(second.dataset.priceValue) - Number(first.dataset.priceValue)
        );
      if (value === "newest")
        return Number(second.dataset.date) - Number(first.dataset.date);
      if (value === "best")
        return Number(second.dataset.sales) - Number(first.dataset.sales);
      return shopCards.indexOf(first) - shopCards.indexOf(second);
    });
    sortedCards.forEach((card) => shopGrid.append(card));
    updateShop();
  };

  filterInputs.forEach((input) => {
    input.addEventListener("change", () => {
      updateShop();
    });
  });

  shopPage.querySelectorAll(".shop-clear-filters").forEach((button) => {
    button.addEventListener("click", () => {
      filterInputs.forEach((input) => {
        input.checked = false;
      });
      updateShop();
    });
  });

  shopSort?.addEventListener("change", () => sortShop(shopSort.value));
  shopPage
    .querySelector(".shop-filter-toggle")
    ?.addEventListener("click", (event) => {
      const isOpen = shopFilters.classList.toggle("is-open");
      event.currentTarget.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) shopFilters.querySelector("input")?.focus();
    });

  shopCards.forEach((card) => {
    const media = card.querySelector(".product-media");
    const secondaryImage = media?.dataset.secondary;
    const image = media?.querySelector("img");
    if (image) {
      image.loading = "lazy";
      image.decoding = "async";
    }
    if (media && secondaryImage) {
      const loadSecondaryImage = () => {
        if (media.dataset.secondaryLoaded) return;
        media.style.setProperty("--secondary-image", `url("${secondaryImage}")`);
        media.dataset.secondaryLoaded = "true";
      };
      media.addEventListener("pointerenter", loadSecondaryImage, { once: true });
      media.addEventListener("focusin", loadSecondaryImage, { once: true });
    }

    const priceRow = card.querySelector(".price-row");
    const quickAdd = priceRow?.querySelector(".mini-button");
    if (priceRow && !quickAdd) {
      const quickAdd = document.createElement("button");
      quickAdd.className = "mini-button shop-quick-add";
      quickAdd.type = "button";
      quickAdd.textContent = "Quick Add";
      quickAdd.setAttribute("aria-label", "Add product to bag");
      quickAdd.addEventListener("click", () => addToCart(card));
      priceRow.append(quickAdd);
    } else {
      quickAdd?.addEventListener("click", () => addToCart(card));
    }
  });

  const quickView = shopPage.querySelector(".shop-quick-view");
  const quickImage = quickView?.querySelector(".shop-quick-image img");
  const quickTitle = quickView?.querySelector("#quick-view-title");
  const quickCategory = quickView?.querySelector(".shop-quick-category");
  const quickPrice = quickView?.querySelector(".shop-quick-price");
  const closeQuickView = () => {
    if (!quickView?.classList.contains("is-open")) return;
    setOverlayState(quickView, false);
    document.body.classList.remove("shop-quick-open");
  };

  shopPage.querySelectorAll(".quick-view-button").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".shop-product-card");
      const image = card?.querySelector(".product-media img");
      if (
        !card ||
        !image ||
        !quickView ||
        !quickImage ||
        !quickTitle ||
        !quickCategory ||
        !quickPrice
      )
        return;
      quickImage.src = image.src;
      quickImage.alt = image.alt;
      quickTitle.textContent =
        card.querySelector("h3")?.textContent || "Kinboni bag";
      quickCategory.textContent =
        card.querySelector(".category")?.textContent || "Kinboni collection";
      quickPrice.textContent = card.querySelector(".price")?.textContent || "";
      setOverlayState(
        quickView,
        true,
        quickView.querySelector(".shop-quick-close"),
        button,
      );
      document.body.classList.add("shop-quick-open");
    });
  });

  quickView
    ?.querySelector(".shop-quick-close")
    ?.addEventListener("click", closeQuickView);
  quickView?.addEventListener("click", (event) => {
    if (event.target === quickView) closeQuickView();
  });
  quickView?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      quickView.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && quickView?.classList.contains("is-open"))
      closeQuickView();
  });
  quickView?.querySelector(".shop-quick-add")?.addEventListener("click", () => {
    const title = quickTitle?.textContent;
    const card = shopCards.find(
      (item) => item.querySelector("h3")?.textContent.trim() === title,
    );
    if (card) addToCart(card);
    closeQuickView();
  });

  updateShop();
}
