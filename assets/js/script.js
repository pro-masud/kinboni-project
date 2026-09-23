const header = document.getElementById("site-header");
const revealItems = document.querySelectorAll(".reveal-up, .reveal-scale");
const wishlistButtons = document.querySelectorAll(".wishlist-button");
const heroVideo = document.querySelector(".hero-video");
const videoToggle = document.querySelector(".video-toggle");

const updateHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.2 },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

const heroSlider = document.querySelector(".hero-slider");
if (window.Swiper && heroSlider) {
  try {
    new window.Swiper(heroSlider, {
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
    });
  } catch (error) {
    heroSlider.classList.add("swiper-init-failed");
  }
} else if (heroSlider) {
  heroSlider.classList.add("swiper-init-failed");
}

const categorySlider = document.querySelector(".category-grid");
if (window.Swiper && categorySlider) {
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
}

const testimonialSlider = document.querySelector(".testimonials-carousel");
if (window.Swiper && testimonialSlider) {
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
}

if (heroVideo && videoToggle) {
  videoToggle.addEventListener("click", () => {
    const icon = videoToggle.querySelector("i");
    const label = videoToggle.querySelector("span");
    if (!icon || !label) return;

    if (heroVideo.paused) {
      const playRequest = heroVideo.play();
      if (playRequest) playRequest.catch(() => {});
      icon.className = "fa-solid fa-pause";
      label.textContent = "Pause motion";
      videoToggle.setAttribute("aria-label", "Pause background video");
    } else {
      heroVideo.pause();
      icon.className = "fa-solid fa-play";
      label.textContent = "Play motion";
      videoToggle.setAttribute("aria-label", "Play background video");
    }
  });
}

wishlistButtons.forEach((button) => {
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
