const header = document.getElementById("site-header");
const revealItems = document.querySelectorAll(".reveal-up, .reveal-scale");
const slides = Array.from(document.querySelectorAll(".slide"));
const dots = Array.from(document.querySelectorAll(".hero-pagination .dot"));
const wishlistButtons = document.querySelectorAll(".wishlist-button");
const testimonialCards = document.querySelectorAll(".testimonial-card");
const testimonialDots = document.querySelectorAll(".carousel-dots .dot");
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

let activeSlideIndex = 0;
let heroTimer = null;

const showSlide = (index) => {
  if (!slides.length) return;

  const nextIndex = (index + slides.length) % slides.length;
  activeSlideIndex = nextIndex;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === nextIndex);
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === nextIndex);
  });
};

const startHeroAutoplay = () => {
  if (slides.length <= 1) return;

  stopHeroAutoplay();
  heroTimer = window.setInterval(() => {
    showSlide(activeSlideIndex + 1);
  }, 4200);
};

const stopHeroAutoplay = () => {
  if (heroTimer) window.clearInterval(heroTimer);
};

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showSlide(index);
    startHeroAutoplay();
  });
});

const heroSection = document.querySelector(".hero");
if (heroSection) {
  heroSection.addEventListener("mouseenter", stopHeroAutoplay);
  heroSection.addEventListener("mouseleave", startHeroAutoplay);
}
startHeroAutoplay();

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

let activeTestimonialIndex = 0;
const showTestimonial = (index) => {
  if (!testimonialCards.length) return;

  const nextIndex = (index + testimonialCards.length) % testimonialCards.length;
  activeTestimonialIndex = nextIndex;

  testimonialCards.forEach((card, cardIndex) => {
    card.style.display = cardIndex === nextIndex ? "block" : "none";
  });

  testimonialDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === nextIndex);
  });
};

const nextTestimonial = () => showTestimonial(activeTestimonialIndex + 1);
const prevTestimonial = () => showTestimonial(activeTestimonialIndex - 1);

const testimonialControls = document.querySelectorAll(".carousel-arrow");
if (testimonialControls[0]) {
  testimonialControls[0].addEventListener("click", () => {
    prevTestimonial();
  });
}
if (testimonialControls[1]) {
  testimonialControls[1].addEventListener("click", () => {
    nextTestimonial();
  });
}

testimonialDots.forEach((dot, index) => {
  dot.addEventListener("click", () => showTestimonial(index));
});

if (window.innerWidth <= 760) {
  testimonialCards.forEach((card, index) => {
    card.style.display = index === 0 ? "block" : "none";
  });
}

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) {
    testimonialCards.forEach((card) => {
      card.style.display = "block";
    });
  } else {
    showTestimonial(activeTestimonialIndex);
  }
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
