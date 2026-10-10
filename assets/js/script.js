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
const cartItemsElements = document.querySelectorAll(
  ".cart-drawer:not(.wishlist-drawer) .cart-items, .cart-page-items",
);
const cartEmptyElements = document.querySelectorAll(
  ".cart-drawer:not(.wishlist-drawer) .cart-empty, .cart-page-empty",
);
const overlayFocusTargets = new WeakMap();
const siteConfig = window.KINBONI_CONFIG || {};
const configuredWhatsAppNumber = () => {
  const number = String(siteConfig.contact?.whatsappNumber || "").replace(
    /\D/g,
    "",
  );
  return /^\d{8,15}$/.test(number) ? number : "";
};
const configuredBusinessEmail = () => {
  const email = String(siteConfig.contact?.email || "").trim();
  return email && !/@[^@]+\.example(?:\s|$)/i.test(email) ? email : "";
};
const productCatalog = Array.isArray(window.KINBONI_PRODUCTS)
  ? window.KINBONI_PRODUCTS
  : [];
const productsById = new Map(
  productCatalog.map((product) => [product.id, product]),
);
const cartStorageKey = "kinboni-cart-v1";
const wishlistStorageKey = "kinboni-wishlist-v1";

const productIdFromName = (name) =>
  name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

document.querySelectorAll(".product-card").forEach((card) => {
  const name = card.querySelector("h3")?.textContent.trim();
  const productId = name ? productIdFromName(name) : "";
  if (!productsById.has(productId)) return;
  card.dataset.productId = productId;
  const title = card.querySelector("h3");
  if (title && !title.querySelector("a")) {
    const link = document.createElement("a");
    link.href = `product.html?id=${encodeURIComponent(productId)}`;
    link.textContent = title.textContent;
    title.replaceChildren(link);
  }
});

document.querySelectorAll(".coming-product-card").forEach((card) => {
  const title = card.querySelector("h3");
  const productId = title ? productIdFromName(title.textContent.trim()) : "";
  const product = productsById.get(productId);
  if (!product) return;
  card.dataset.productId = product.id;
  card.querySelectorAll(".wishlist-button").forEach((button) => {
    button.dataset.productId = product.id;
  });
  if (title && !title.querySelector("a")) {
    const link = document.createElement("a");
    link.href = `product.html?id=${encodeURIComponent(product.id)}`;
    link.textContent = title.textContent;
    title.replaceChildren(link);
  }
});

document.querySelectorAll("img").forEach((image) => {
  if (!image.hasAttribute("alt")) image.alt = "";
  if (
    !image.hasAttribute("loading") &&
    !image.closest(".hero-visual, .hero-image-wrap, .hero-image, .brand")
  )
    image.loading = "lazy";
  if (!image.hasAttribute("decoding")) image.decoding = "async";
});

const readStoredValue = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.error(`Unable to read ${key} from local storage.`, error);
    return fallback;
  }
};

const writeStoredValue = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Unable to save ${key} to local storage.`, error);
    return false;
  }
};

const getConfigValue = (path) =>
  path
    .split(".")
    .reduce(
      (value, key) => (value && key in value ? value[key] : undefined),
      siteConfig,
    );

const configuredPriceText = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  const currency = siteConfig.currency || {};
  const amount = new Intl.NumberFormat(currency.locale || "en-BD", {
    maximumFractionDigits: 0,
  }).format(value);
  return `${currency.symbol || "৳"}${amount}`;
};

const renderSocialLinks = () => {
  const socialChannels = [
    ["instagram", "Instagram", "fa-instagram"],
    ["facebook", "Facebook", "fa-facebook-f"],
    ["tiktok", "TikTok", "fa-tiktok"],
    ["pinterest", "Pinterest", "fa-pinterest-p"],
    ["youtube", "YouTube", "fa-youtube"],
  ];
  document
    .querySelectorAll(
      '[data-social-container], .socials[aria-label="Social media links"]',
    )
    .forEach((container) => {
    container.replaceChildren();
    socialChannels.forEach(([key, label, icon]) => {
      const url = siteConfig.social?.[key];
      if (!url) {
        const placeholder = document.createElement("span");
        placeholder.setAttribute("aria-label", `${label} profile coming soon`);
        placeholder.title = `${label} profile coming soon`;
        const mark = document.createElement("i");
        mark.className = `fa-brands ${icon}`;
        mark.setAttribute("aria-hidden", "true");
        placeholder.append(mark);
        container.append(placeholder);
        return;
      }
      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch (error) {
        console.error(`Invalid configured ${label} URL.`, error);
        return;
      }
      if (!["https:", "http:"].includes(parsedUrl.protocol)) {
        console.error(`Configured ${label} URL must use HTTP or HTTPS.`);
        return;
      }
      const link = document.createElement("a");
      link.href = parsedUrl.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Kinboni on ${label}`);
      const mark = document.createElement("i");
      mark.className = `fa-brands ${icon}`;
      link.append(mark);
      container.append(link);
    });
    container.hidden = !container.childElementCount;
    });
};

const renderSiteFooter = () => {
  if (document.querySelector(".site-footer")) return;
  document.querySelector("main")?.insertAdjacentHTML(
    "afterend",
    `
      <footer class="site-footer">
        <div class="container footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="brand" aria-label="Kinboni home">
              <span class="brand-mark">K</span><span class="brand-name">KINBONI</span>
            </a>
            <p>Thoughtfully designed bags to carry your everyday essentials with ease.</p>
            <div class="socials" data-social-container aria-label="Social media links"></div>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><a href="shop.html#products">All Bags</a></li>
              <li><a href="new-arrivals.html">New Arrivals</a></li>
              <li><a href="coming-soon.html">Coming Soon</a></li>
              <li><a href="totes.html">Totes</a></li>
              <li><a href="shoulder-bags.html">Shoulder Bags</a></li>
              <li><a href="crossbody.html">Crossbody Bags</a></li>
              <li><a href="mini-bags.html">Mini Bags</a></li>
              <li><a href="work-bags.html">Work Bags</a></li>
            </ul>
          </div>
          <div>
            <h4>Customer Care</h4>
            <ul>
              <li><a href="contact.html">Contact</a></li>
              <li><a href="faq.html">FAQ</a></li>
              <li><a href="delivery-payment.html">Delivery &amp; Payment</a></li>
              <li><a href="returns-exchange.html">Returns &amp; Exchange</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul class="footer-contact-list"></ul>
          </div>
          <div>
            <h4>About</h4>
            <ul>
              <li><a href="about.html#our-story">Our Story</a></li>
              <li><a href="privacy-policy.html">Privacy Policy</a></li>
              <li><a href="terms.html">Terms &amp; Conditions</a></li>
            </ul>
          </div>
        </div>
        <div class="container footer-bottom">
          <p>© <span data-current-year></span> Kinboni. All rights reserved.</p>
          <div class="footer-legal">
            <a href="privacy-policy.html">Privacy Policy</a>
            <a href="terms.html">Terms</a>
            <a href="returns-exchange.html">Returns</a>
          </div>
        </div>
      </footer>
    `,
  );
};

const normalizeFooterLinks = () => {
  document.querySelectorAll(".site-footer").forEach((footer) => {
    footer
      .querySelectorAll(
        '.footer-legal span[aria-label*="policy"], .footer-grid span[aria-label*="policy"]',
      )
      .forEach((placeholder) => placeholder.remove());
    footer.querySelectorAll(".footer-grid a").forEach((link) => {
      const label = link.textContent.trim().toLowerCase();
      if (label === "faq") link.href = "faq.html";
      if (label === "shipping") link.href = "delivery-payment.html";
      if (label === "returns") link.href = "returns-exchange.html";
    });
    footer.querySelectorAll(".footer-grid span").forEach((placeholder) => {
      if (!/contact.*coming soon/i.test(placeholder.textContent)) return;
      const link = document.createElement("a");
      link.href = "contact.html";
      link.textContent = "Contact";
      placeholder.replaceWith(link);
    });

    const columns = Array.from(footer.querySelectorAll(".footer-grid > div"));
    const aboutColumn = columns.find(
      (column) => column.querySelector("h4")?.textContent.trim() === "About",
    );
    const aboutList = aboutColumn?.querySelector("ul");
    [
      ["privacy-policy.html", "Privacy Policy"],
      ["terms.html", "Terms & Conditions"],
      ["returns-exchange.html", "Returns & Exchange"],
    ].forEach(([href, label]) => {
      if (footer.querySelector(`.footer-legal a[href="${href}"]`)) return;
      const legal = footer.querySelector(".footer-legal");
      if (legal) {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        legal.append(link);
      }
      if (aboutList && !aboutList.querySelector(`a[href="${href}"]`)) {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        item.append(link);
        aboutList.append(item);
      }
    });

    let contactColumn = columns.find(
      (column) => column.querySelector("h4")?.textContent.trim() === "Contact",
    );
    if (!contactColumn) {
      contactColumn = document.createElement("div");
      const aboutColumn = columns.find(
        (column) => column.querySelector("h4")?.textContent.trim() === "About",
      );
      if (aboutColumn) aboutColumn.before(contactColumn);
      else footer.querySelector(".footer-grid")?.append(contactColumn);
    }
    const contactHeading =
      contactColumn.querySelector("h4") || document.createElement("h4");
    contactHeading.textContent = "Contact";
    const contactList =
      contactColumn.querySelector("ul") || document.createElement("ul");
    contactList.className = "footer-contact-list";
    contactList.replaceChildren();
    [
      ["Phone", "phone", "tel:"],
      ["WhatsApp", "whatsappNumber", "https://wa.me/"],
      ["Email", "email", "mailto:"],
      ["Address", "address", ""],
      ["Business hours", "businessHours", ""],
    ].forEach(([label, key, prefix]) => {
      const value = siteConfig.contact?.[key];
      const item = document.createElement("li");
      item.className = "footer-contact-item";
      const labelElement = document.createElement("span");
      labelElement.className = "footer-contact-label";
      labelElement.textContent = label;
      const valueElement = document.createElement("span");
      valueElement.className = "footer-contact-value";
      const digits = String(value || "").replace(/\D/g, "");
      const isActiveChannel =
        key === "whatsappNumber"
          ? /^\d{8,15}$/.test(digits)
          : key === "phone"
            ? /^[+\d\s().-]+$/.test(value) && digits.length >= 7
            : key === "email"
              ? Boolean(configuredBusinessEmail())
              : false;
      if (value && prefix && isActiveChannel) {
        const link = document.createElement("a");
        link.textContent = value;
        link.href =
          key === "whatsappNumber"
            ? `${prefix}${String(value).replace(/\D/g, "")}`
            : `${prefix}${value}`;
        if (key === "whatsappNumber") {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        valueElement.append(link);
      } else {
        valueElement.textContent = value || "To be provided";
      }
      item.append(labelElement, valueElement);
      contactList.append(item);
    });
    contactColumn.replaceChildren(contactHeading, contactList);
    contactColumn.classList.add("footer-contact-column");
    contactColumn.parentElement?.classList.add("has-contact-column");
  });
};

document.querySelectorAll(".announcement-bar p").forEach((announcement) => {
  const phone = siteConfig.contact?.phone;
  if (!phone || announcement.dataset.contactAdded) return;
  announcement.append(document.createTextNode(` · Customer care: ${phone}`));
  announcement.dataset.contactAdded = "true";
});

const deliveryChargeText = (amount) =>
  typeof amount === "number" && Number.isFinite(amount)
    ? configuredPriceText(amount)
    : "To be confirmed";

const getEnabledPaymentMethods = () => {
  const payment = siteConfig.payment || {};
  return [
    payment.cashOnDeliveryEnabled ? "Cash on Delivery" : "",
    payment.bkashEnabled && payment.bkashMerchantNumber ? "bKash" : "",
    payment.nagadEnabled && payment.nagadMerchantNumber ? "Nagad" : "",
    payment.onlineCardEnabled ? "Online card payment" : "",
  ].filter(Boolean);
};

const renderPaymentBadges = () => {
  const payment = siteConfig.payment || {};
  const methods = [
    {
      label: "Cash on Delivery",
      icon: "fa-money-bill-wave",
      enabled: Boolean(payment.cashOnDeliveryEnabled),
    },
    {
      label: "bKash",
      icon: "fa-mobile-screen-button",
      enabled: Boolean(payment.bkashEnabled && payment.bkashMerchantNumber),
    },
    {
      label: "Nagad",
      icon: "fa-mobile-screen-button",
      enabled: Boolean(payment.nagadEnabled && payment.nagadMerchantNumber),
    },
  ];
  document.querySelectorAll("[data-payment-badges]").forEach((container) => {
    container.replaceChildren();
    methods.forEach((method) => {
      const badge = document.createElement("span");
      badge.className = method.enabled
        ? "payment-badge"
        : "payment-badge is-unavailable";
      const icon = document.createElement("i");
      icon.className = `fa-solid ${method.icon}`;
      icon.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.textContent = method.enabled
        ? method.label
        : `${method.label} — not configured`;
      badge.append(icon, label);
      container.append(badge);
    });
  });
};

const applyConfigBindings = () => {
  document.querySelectorAll("[data-config-text]").forEach((element) => {
    const value = getConfigValue(element.dataset.configText);
    const output =
      element.dataset.configFormat === "currency"
        ? configuredPriceText(value)
        : value === null || value === undefined
          ? ""
          : String(value);
    element.textContent = output
      ? `${output}${element.dataset.configSuffix || ""}`
      : element.dataset.configEmpty || "";
  });

  document.querySelectorAll("[data-config-href]").forEach((element) => {
    const value = getConfigValue(element.dataset.configHref);
    if (!value) {
      if (element.tagName === "A") {
        const replacement = document.createElement("span");
        replacement.className = element.className;
        replacement.textContent = element.dataset.configEmpty || "";
        element.replaceWith(replacement);
      }
      return;
    }
    if (element.tagName === "A") {
      element.href = `${element.dataset.configPrefix || ""}${value}`;
      element.hidden = false;
      if (!element.textContent.trim()) element.textContent = String(value);
    }
  });

  renderSiteFooter();
  renderSocialLinks();
  normalizeFooterLinks();
  renderPaymentBadges();
  document.querySelectorAll(".payment-note").forEach((element) => {
    const methods = getEnabledPaymentMethods();
    element.textContent = methods.length
      ? `Payment methods: ${methods.join(" · ")}`
      : "Payment methods to be confirmed";
  });
  document.querySelectorAll("[data-delivery-payment-copy]").forEach((element) => {
    const delivery = siteConfig.delivery || {};
    const methods = getEnabledPaymentMethods();
    const details = [
      ["Inside Dhaka", deliveryChargeText(delivery.insideDhakaCharge)],
      ["Outside Dhaka", deliveryChargeText(delivery.outsideDhakaCharge)],
      ["Payment options", methods.length ? methods.join(", ") : "To be confirmed"],
    ];
    if (element.closest(".home-delivery-payment")) {
      element.replaceChildren(
        ...details.map(([label, value]) => {
          const item = document.createElement("span");
          const title = document.createElement("strong");
          title.textContent = label;
          const detail = document.createElement("span");
          detail.textContent = value;
          item.append(title, detail);
          return item;
        }),
      );
      return;
    }
    element.textContent = details
      .map(([label, value]) => `${label}: ${value}`)
      .join(" · ");
  });
  document.querySelectorAll("[data-enabled-payments]").forEach((list) => {
    list.replaceChildren();
    getEnabledPaymentMethods().forEach((method) => {
      const item = document.createElement("li");
      item.textContent = method;
      list.append(item);
    });
    if (!list.childElementCount) {
      const item = document.createElement("li");
      item.textContent = "Payment methods to be confirmed.";
      list.append(item);
    }
  });
  document.querySelectorAll("[data-cod-status]").forEach((element) => {
    element.textContent = siteConfig.payment?.cashOnDeliveryEnabled
      ? "Cash on Delivery is currently enabled in the site configuration."
      : "Cash on Delivery has not been enabled.";
  });
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
};

applyConfigBindings();

const setMetaContent = (selector, attributes, content) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) =>
      element.setAttribute(key, value),
    );
    document.head.append(element);
  }
  element.content = content;
};

const updateSeoMetadata = () => {
  const description =
    document.querySelector('meta[name="description"]')?.content ||
    `${siteConfig.brandName || "Kinboni"} bags for everyday carry.`;
  const pageTitle = document.title;
  const pageName =
    location.pathname.split(/[\\/]/).filter(Boolean).pop() || "index.html";
  setMetaContent('meta[property="og:title"]', { property: "og:title" }, pageTitle);
  setMetaContent(
    'meta[property="og:description"]',
    { property: "og:description" },
    description,
  );
  setMetaContent('meta[property="og:type"]', { property: "og:type" }, "website");
  setMetaContent('meta[name="twitter:card"]', { name: "twitter:card" }, "summary");
  setMetaContent(
    'meta[name="twitter:title"]',
    { name: "twitter:title" },
    pageTitle,
  );
  setMetaContent(
    'meta[name="twitter:description"]',
    { name: "twitter:description" },
    description,
  );

  const configuredSiteUrl = String(siteConfig.siteUrl || "").trim();
  if (configuredSiteUrl) {
    let siteUrl;
    try {
      siteUrl = new URL(configuredSiteUrl);
    } catch (error) {
      console.error("The configured site URL is invalid.", error);
      return;
    }
    if (!["http:", "https:"].includes(siteUrl.protocol)) {
      console.error("The configured site URL must use HTTP or HTTPS.");
      return;
    }
    const canonicalPath = pageName === "index.html" ? "" : pageName;
    const canonicalUrl = new URL(
      canonicalPath,
      siteUrl.href.endsWith("/") ? siteUrl : `${siteUrl.href}/`,
    );
    if (pageName === "product.html") {
      const productId = new URLSearchParams(location.search).get("id");
      if (productId) canonicalUrl.searchParams.set("id", productId);
    }
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl.href;
    setMetaContent(
      'meta[property="og:url"]',
      { property: "og:url" },
      canonicalUrl.href,
    );
  }

  let organizationSchema = document.getElementById(
    "kinboni-organization-jsonld",
  );
  if (!organizationSchema) {
    organizationSchema = document.createElement("script");
    organizationSchema.type = "application/ld+json";
    organizationSchema.id = "kinboni-organization-jsonld";
    document.head.append(organizationSchema);
  }
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.brandName || "Kinboni",
  };
  if (configuredSiteUrl) organization.url = configuredSiteUrl;
  const socialUrls = Object.values(siteConfig.social || {}).filter(Boolean);
  if (socialUrls.length) organization.sameAs = socialUrls;
  organizationSchema.textContent = JSON.stringify(organization);

  const breadcrumb = document.querySelector(".shop-breadcrumb");
  if (breadcrumb && !document.querySelector(".product-page")) {
    const items = Array.from(breadcrumb.querySelectorAll("a, [aria-current='page']"))
      .map((item) => ({
        name: item.textContent.trim(),
        path: item.getAttribute("href") || "",
      }))
      .filter((item) => item.name);
    if (items.length) {
      const baseUrl = configuredSiteUrl
        ? new URL(
            configuredSiteUrl.endsWith("/")
              ? configuredSiteUrl
              : `${configuredSiteUrl}/`,
          )
        : null;
      const breadcrumbSchema = document.createElement("script");
      breadcrumbSchema.type = "application/ld+json";
      breadcrumbSchema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          ...(baseUrl
            ? {
                item: new URL(
                  item.path || pageName,
                  baseUrl,
                ).href,
              }
            : {}),
        })),
      });
      document.head.append(breadcrumbSchema);
    }
  }
};

window.kinboniUpdateSeoMetadata = updateSeoMetadata;
updateSeoMetadata();

const storedCart = readStoredValue(cartStorageKey, []);
let cartItems = Array.isArray(storedCart)
  ? storedCart
      .filter(
        (item) =>
          item &&
          productsById.has(item.productId) &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0,
      )
      .map((item) => ({
        productId: item.productId,
        variant: typeof item.variant === "string" ? item.variant : "",
        quantity: Math.min(item.quantity, 99),
      }))
  : [];

const loadWishlist = () => {
  const stored = readStoredValue(wishlistStorageKey, null);
  if (Array.isArray(stored))
    return [...new Set(stored.filter((id) => productsById.has(id)))];

  const migrated = [];
  try {
    productCatalog.forEach((product) => {
      if (
        window.localStorage.getItem(`kinboni-wishlist-${product.name}`) ===
        "true"
      )
        migrated.push(product.id);
    });
  } catch (error) {
    console.error("Unable to restore the saved wishlist.", error);
  }
  if (migrated.length) writeStoredValue(wishlistStorageKey, migrated);
  return migrated;
};

let wishlistProductIds = loadWishlist();

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
  overlayFocusTargets.get(overlay)?.focus();
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  overlay.inert = true;
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
    ".trust-item, .category-card, .product-card, .coming-product-card, .concern-card, .edit-steps-grid > div, .testimonial-card, .collection-card, .benefit-card, .ugc-card, .faq-item",
  );

  revealItems.forEach((section) => {
    const headingItems = section.querySelectorAll(
      ".section-heading > *, .banner-copy > *, .story-copy > *, .newsletter-shell > *, .coming-soon-copy > *, .coming-soon-aside > *",
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

const comingSoonSection = document.querySelector("#coming-soon");
if (comingSoonSection && window.gsap && !prefersReducedMotion) {
  const comingSoonObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const copyItems = comingSoonSection.querySelectorAll(
          ".coming-soon-copy > *, .coming-soon-aside > *",
        );
        const productCards = comingSoonSection.querySelectorAll(
          ".coming-product-card",
        );

        window.gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .fromTo(
            comingSoonSection,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.65 },
          )
          .from(
            copyItems,
            { opacity: 0, y: 16, duration: 0.45, stagger: 0.06 },
            "-=0.32",
          )
          .from(
            productCards,
            { opacity: 0, y: 24, duration: 0.55, stagger: 0.12 },
            "-=0.2",
          );
        observer.unobserve(comingSoonSection);
      });
    },
    { threshold: 0.14 },
  );
  comingSoonObserver.observe(comingSoonSection);
}

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
    renderSearch(searchInput?.value || "");
  });
});

searchPanel
  ?.querySelector(".search-close")
  ?.addEventListener("click", closeSearch);

const normalizeSearchText = (value) =>
  value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const productPriceText = (product) => {
  if (typeof product.price !== "number" || !Number.isFinite(product.price))
    return "Price to be confirmed";
  const currency = siteConfig.currency || {};
  const amount = new Intl.NumberFormat(currency.locale || "en-BD", {
    maximumFractionDigits: 0,
  }).format(product.price);
  return `${currency.symbol || "৳"}${amount}`;
};

const categoryFilterValues = {
  totes: "tote",
  "shoulder-bags": "shoulder",
  crossbody: "crossbody",
  "mini-bags": "mini",
  "work-bags": "work",
  "travel-bags": "travel",
  handbags: "handbags",
  clutches: "clutch",
};

document.querySelectorAll(".product-card").forEach((card) => {
  const name = card.querySelector("h3")?.textContent.trim() || "";
  const product =
    productsById.get(card.dataset.productId) ||
    productsById.get(productIdFromName(name));
  const collectionCategory = card.closest(".shop-product-grid")?.dataset
    .catalogCategory;
  const price = card.querySelector(".price");
  const oldPrice = card.querySelector(".old-price");
  if (product) {
    card.dataset.productId = product.id;
    card.dataset.category = collectionCategory
      ? categoryFilterValues[collectionCategory] || ""
      : categoryFilterValues[product.category] || product.category;
    card.dataset.color = (product.colors || [])
      .map((color) => color.toLowerCase())
      .join(" ");
    card.dataset.priceValue =
      typeof product.price === "number" ? String(product.price) : "";
    card.dataset.style = (product.tags || []).join(" ");
    card.dataset.size = product.size || "";
    card.dataset.stock = product.stockStatus || "unknown";
    card.dataset.sale = String(
      typeof product.price === "number" &&
        typeof product.oldPrice === "number" &&
        product.oldPrice > product.price,
    );
    card.dataset.date = product.createdAt
      ? String(Date.parse(product.createdAt))
      : "";
    delete card.dataset.sales;
    const availability = [];
    if (product.stockStatus === "in-stock") availability.push("in-stock");
    if (product.newArrival === true) availability.push("new");
    if (product.bestSeller === true) availability.push("best");
    if (card.dataset.sale === "true") availability.push("sale");
    card.dataset.availability = availability.join(" ");
    if (price)
      price.textContent =
        product.status === "coming-soon"
          ? "Coming soon"
          : productPriceText(product);
    const imageInfo = product.images?.[0];
    const image = card.querySelector(".product-media img");
    if (image && imageInfo) {
      image.src = imageInfo.src;
      image.alt = imageInfo.src.includes("product-image-pending")
        ? `Product photo pending: ${product.name}`
        : imageInfo.alt || product.name;
      image.loading = "lazy";
      image.decoding = "async";
      image.width = 900;
      image.height = 1100;
      image.addEventListener(
        "error",
        () => {
          if (
            imageInfo.fallback &&
            image.src !== new URL(imageInfo.fallback, document.baseURI).href
          )
            image.src = imageInfo.fallback;
        },
        { once: true },
      );
    }
    if (typeof product.oldPrice === "number" && price) {
      let verifiedOldPrice = oldPrice;
      if (!verifiedOldPrice) {
        verifiedOldPrice = document.createElement("span");
        verifiedOldPrice.className = "old-price";
        price.after(verifiedOldPrice);
      }
      verifiedOldPrice.textContent = productPriceText({
        price: product.oldPrice,
      });
    } else {
      oldPrice?.remove();
    }
    card.querySelectorAll(".badge, .rating").forEach((label) => label.remove());
    card.querySelectorAll(".wishlist-button").forEach((button) => {
      button.dataset.productId = product.id;
    });
  } else {
    if (price) price.textContent = "Price to be confirmed";
    oldPrice?.remove();
    card.querySelectorAll(".badge, .rating").forEach((label) => label.remove());
  }
});

document.querySelectorAll(".shop-page:not(.shop-page-dynamic)").forEach((page) => {
  const filters = page.querySelector(".shop-filters");
  const priceFieldset = Array.from(filters?.querySelectorAll("fieldset") || []).find(
    (fieldset) =>
      fieldset
        .querySelector("legend")
        ?.textContent.trim().toLowerCase().startsWith("price"),
  );
  if (priceFieldset) {
    const legend = priceFieldset.querySelector("legend");
    const priceRange = document.createElement("div");
    priceRange.className = "shop-price-range";
    [
      { id: "shop-price-min", label: "Min", placeholder: "৳ Min" },
      { id: "shop-price-max", label: "Max", placeholder: "৳ Max" },
    ].forEach(({ id, label: labelText, placeholder }) => {
      const label = document.createElement("label");
      label.htmlFor = id;
      label.textContent = labelText;
      const input = document.createElement("input");
      input.id = id;
      input.type = "number";
      input.min = "0";
      input.inputMode = "numeric";
      input.placeholder = placeholder;
      priceRange.append(label, input);
    });
    priceFieldset.replaceChildren(legend, priceRange);
  }
  const availableColors = new Set(
    productCatalog.flatMap((product) =>
      (product.colors || []).map((color) => color.toLowerCase()),
    ),
  );
  filters?.querySelectorAll('[data-filter="color"]').forEach((input) => {
    if (!availableColors.has(input.value)) {
      input.disabled = true;
      input.parentElement.title = "Color details have not been confirmed yet.";
    }
  });
  const hasKnownStock = productCatalog.some(
    (product) => product.stockStatus === "in-stock",
  );
  const hasSalePrice = productCatalog.some(
    (product) =>
      typeof product.price === "number" &&
      typeof product.oldPrice === "number" &&
      product.oldPrice > product.price,
  );
  filters?.querySelectorAll('[data-filter="availability"]').forEach((input) => {
    if (
      (input.value === "in-stock" && !hasKnownStock) ||
      (input.value === "sale" && !hasSalePrice) ||
      (input.value === "new" &&
        !productCatalog.some((product) => product.newArrival === true)) ||
      (input.value === "best" &&
        !productCatalog.some((product) => product.bestSeller === true))
    ) {
      input.disabled = true;
      input.parentElement.title =
        "This filter will be available when product data is confirmed.";
    }
  });
  const sort = page.querySelector(".shop-sort select");
  if (sort) {
    const hasPrices = productCatalog.some(
      (product) => typeof product.price === "number",
    );
    ["low", "high"].forEach((value) => {
      const option = sort.querySelector(`option[value="${value}"]`);
      if (option) option.disabled = !hasPrices;
    });
    const bestOption = sort.querySelector('option[value="best"]');
    if (bestOption) bestOption.disabled = true;
    const newestOption = sort.querySelector('option[value="newest"]');
    if (newestOption)
      newestOption.disabled = !productCatalog.some(
        (product) => Number.isFinite(Date.parse(product.createdAt || "")),
      );
  }
});

const productImageElement = (product) => {
  const imageInfo = product.images?.[0];
  if (!imageInfo) return null;
  const image = document.createElement("img");
  image.src = imageInfo.src;
  image.alt = imageInfo.src.includes("product-image-pending")
    ? `Product photo pending: ${product.name}`
    : imageInfo.alt || product.name;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener(
    "error",
    () => {
      if (imageInfo.fallback && image.src !== new URL(imageInfo.fallback, document.baseURI).href) {
        image.src = imageInfo.fallback;
      }
    },
    { once: true },
  );
  return image;
};

let searchResults = searchForm?.querySelector(".search-results");
if (searchForm && !searchResults) {
  searchResults = document.createElement("ul");
  searchResults.className = "search-results";
  searchResults.setAttribute("role", "listbox");
  searchResults.setAttribute("aria-label", "Product search results");
  searchForm.querySelector(".search-status")?.before(searchResults);
}

const searchInput = searchForm?.querySelector('input[type="search"]');
const searchStatus = searchForm?.querySelector(".search-status");
let searchDebounce;

const dispatchShopSearch = (query) =>
  document.dispatchEvent(
    new CustomEvent("shop:search", { detail: { query } }),
  );

const renderSearch = (value = "") => {
  if (!searchResults) return [];
  const query = normalizeSearchText(value);
  searchResults.replaceChildren();
  if (!query) {
    const popular = Array.isArray(siteConfig.popularSearches)
      ? siteConfig.popularSearches
      : [];
    popular.forEach((term) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-suggestion";
      button.textContent = term;
      button.addEventListener("click", () => {
        if (!searchInput) return;
        searchInput.value = term;
        renderSearch(term);
        searchInput.focus();
      });
      item.append(button);
      searchResults.append(item);
    });
    if (searchStatus)
      searchStatus.textContent = popular.length
        ? "Popular searches"
        : "Start typing to search the catalog.";
    dispatchShopSearch("");
    return [];
  }

  const matches = productCatalog.filter((product) => {
    const searchable = normalizeSearchText(
      [
        product.name,
        product.category,
        product.description,
        ...(product.tags || []),
      ].join(" "),
    );
    return searchable.includes(query);
  });

  matches.forEach((product) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.className = "search-result";
    link.href = `product.html?id=${encodeURIComponent(product.id)}`;
    link.setAttribute("role", "option");
    const image = productImageElement(product);
    if (image) link.append(image);
    const details = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = product.name;
    const category = document.createElement("small");
    category.textContent = product.category;
    const price = document.createElement("small");
    price.textContent =
      product.status === "coming-soon"
        ? "Coming soon"
        : productPriceText(product);
    details.append(name, category, price);
    link.append(details);
    item.append(link);
    searchResults.append(item);
  });
  if (searchStatus)
    searchStatus.textContent = matches.length
      ? `${matches.length} product${matches.length === 1 ? "" : "s"} found.`
      : "No products found. Try tote, crossbody or shoulder bag.";
  dispatchShopSearch(query);
  return matches;
};

searchInput?.addEventListener("input", () => {
  window.clearTimeout(searchDebounce);
  searchDebounce = window.setTimeout(
    () => renderSearch(searchInput.value),
    150,
  );
});
searchInput?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSearch();
    return;
  }
  if (event.key !== "ArrowDown") return;
  const firstResult = searchResults?.querySelector("a, button");
  if (firstResult) {
    event.preventDefault();
    firstResult.focus();
  }
});
searchResults?.addEventListener("keydown", (event) => {
  if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
  const options = Array.from(searchResults.querySelectorAll("a, button"));
  const currentIndex = options.indexOf(document.activeElement);
  const nextIndex =
    (currentIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) %
    options.length;
  if (options.length) {
    event.preventDefault();
    options[nextIndex].focus();
  }
});
searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  renderSearch(searchInput?.value || "");
});
if (searchPanel?.classList.contains("is-open")) renderSearch();

const persistCart = () =>
  writeStoredValue(
    cartStorageKey,
    cartItems.map(({ productId, variant, quantity }) => ({
      productId,
      variant,
      quantity,
    })),
  );

const getOrCreateCartSummary = () => {
  if (!cartDrawer) return null;
  let summary = cartDrawer.querySelector(".cart-summary");
  if (!summary) {
    const deliveryInfo = document.createElement("div");
    deliveryInfo.className = "cart-delivery-payment delivery-payment-strip";
    deliveryInfo.innerHTML =
      '<strong>Delivery &amp; Payment</strong><p data-delivery-payment-copy></p><div class="payment-badge-list" data-payment-badges></div>';
    cartDrawer.querySelector(".cart-drawer-head")?.after(deliveryInfo);
    const deliveryCopy = deliveryInfo.querySelector(
      "[data-delivery-payment-copy]",
    );
    if (deliveryCopy) {
      const delivery = siteConfig.delivery || {};
      const methods = getEnabledPaymentMethods();
      deliveryCopy.textContent = [
        `Inside Dhaka: ${deliveryChargeText(delivery.insideDhakaCharge)}`,
        `Outside Dhaka: ${deliveryChargeText(delivery.outsideDhakaCharge)}`,
        `Payment: ${methods.length ? methods.join(", ") : "to be confirmed"}`,
      ].join(" · ");
    }
    renderPaymentBadges();
    summary = document.createElement("div");
    summary.className = "cart-summary";
    summary.innerHTML =
      '<div><span>Subtotal</span><strong class="cart-subtotal-value"></strong></div><p class="cart-delivery-note"></p>';
    const checkout = cartDrawer.querySelector(".cart-checkout");
    if (checkout) checkout.before(summary);
    else cartDrawer.append(summary);
  }
  return summary;
};

const cartSummary = getOrCreateCartSummary();
const cartSubtotalValue = cartSummary?.querySelector(".cart-subtotal-value");
const cartDeliveryNote = cartSummary?.querySelector(".cart-delivery-note");
const cartCheckout = cartDrawer?.querySelector(".cart-checkout");
const cartContinueShopping = document.createElement("a");
cartContinueShopping.className = "cart-continue";
cartContinueShopping.href = "shop.html";
cartContinueShopping.textContent = "Continue shopping";
if (cartDrawer && !cartDrawer.querySelector(".cart-continue"))
  cartCheckout?.after(cartContinueShopping);

const updateCartCount = () => {
  const count = cartItems.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
  document.querySelectorAll(".cart-button").forEach((button) => {
    button.setAttribute(
      "aria-label",
      count ? `Shopping bag, ${count} items` : "Shopping bag",
    );
  });
  document.querySelectorAll("[data-cart-page-count]").forEach((element) => {
    element.textContent = `${count} ${count === 1 ? "item" : "items"}`;
  });
};

const updateCartQuantity = (productId, variant, change) => {
  const item = cartItems.find(
    (entry) => entry.productId === productId && entry.variant === variant,
  );
  if (!item) return;
  item.quantity = Math.max(1, Math.min(99, item.quantity + change));
  persistCart();
  renderCart();
};

const removeCartItem = (productId, variant) => {
  cartItems = cartItems.filter(
    (item) => item.productId !== productId || item.variant !== variant,
  );
  persistCart();
  renderCart();
};

const renderCart = () => {
  if (!cartItemsElements.length) {
    updateCartCount();
    return;
  }
  let subtotal = 0;
  let hasUnpricedItems = false;
  cartItems.forEach((cartItem) => {
    const product = productsById.get(cartItem.productId);
    if (!product) return;
    if (typeof product.price === "number" && Number.isFinite(product.price)) {
      subtotal += product.price * cartItem.quantity;
    } else {
      hasUnpricedItems = true;
    }
  });
  cartItemsElements.forEach((container) => {
    container.replaceChildren();
    cartItems.forEach((cartItem) => {
      const product = productsById.get(cartItem.productId);
      if (!product) return;
      const row = document.createElement("article");
      row.className = "cart-item";
      const image = productImageElement(product);
      if (image) row.append(image);
      const detail = document.createElement("div");
      detail.className = "cart-item-details";
      const name = document.createElement("strong");
      name.textContent = product.name;
      const variant = document.createElement("span");
      variant.textContent = cartItem.variant
        ? `Option: ${cartItem.variant}`
        : "Standard";
      const unitPrice = document.createElement("span");
      unitPrice.textContent = productPriceText(product);
      const controls = document.createElement("div");
      controls.className = "cart-quantity-controls";
      const decrease = document.createElement("button");
      decrease.type = "button";
      decrease.textContent = "−";
      decrease.setAttribute("aria-label", `Decrease ${product.name} quantity`);
      decrease.addEventListener("click", () =>
        updateCartQuantity(cartItem.productId, cartItem.variant, -1),
      );
      const quantity = document.createElement("span");
      quantity.className = "cart-quantity";
      quantity.textContent = String(cartItem.quantity);
      const increase = document.createElement("button");
      increase.type = "button";
      increase.textContent = "+";
      increase.setAttribute("aria-label", `Increase ${product.name} quantity`);
      increase.disabled = cartItem.quantity >= 99;
      increase.addEventListener("click", () =>
        updateCartQuantity(cartItem.productId, cartItem.variant, 1),
      );
      controls.append(decrease, quantity, increase);
      const lineTotal = document.createElement("span");
      lineTotal.className = "cart-line-total";
      if (typeof product.price === "number" && Number.isFinite(product.price)) {
        const lineValue = product.price * cartItem.quantity;
        lineTotal.textContent = productPriceText({
          ...product,
          price: lineValue,
        });
      } else lineTotal.textContent = "Line total to be confirmed";
      detail.append(name, variant, unitPrice, controls, lineTotal);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "cart-item-remove";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove ${product.name} from bag`);
      remove.addEventListener("click", () =>
        removeCartItem(cartItem.productId, cartItem.variant),
      );
      row.append(detail, remove);
      container.append(row);
    });
    container.setAttribute("aria-live", "polite");
  });
  cartEmptyElements.forEach((emptyState) => {
    emptyState.hidden = cartItems.length > 0;
  });
  if (cartSubtotalValue)
    cartSubtotalValue.textContent = hasUnpricedItems
      ? "To be confirmed"
      : productPriceText({ price: subtotal });
  document.querySelectorAll("[data-cart-page-subtotal]").forEach((element) => {
    element.textContent = hasUnpricedItems
      ? "To be confirmed"
      : productPriceText({ price: subtotal });
  });
  document.querySelectorAll(".cart-page-checkout").forEach((button) => {
    button.disabled = cartItems.length === 0 || hasUnpricedItems;
  });
  if (cartDeliveryNote)
    cartDeliveryNote.textContent = hasUnpricedItems
      ? "Final price and delivery are confirmed before checkout."
      : "Delivery charge is calculated at checkout.";
  if (cartCheckout) {
    cartCheckout.disabled =
      cartItems.length === 0 || hasUnpricedItems || !cartItems.length;
    cartCheckout.setAttribute(
      "aria-label",
      hasUnpricedItems
        ? "Checkout unavailable until product prices are confirmed"
        : "Continue to checkout",
    );
  }
  updateCartCount();
};

const addProductToCart = (product, variant = "", quantity = 1) => {
  if (!product || product.status === "coming-soon") return;
  const addQuantity = Math.max(1, Math.min(99, Math.floor(Number(quantity)) || 1));
  const existingItem = cartItems.find(
    (item) => item.productId === product.id && item.variant === variant,
  );
  if (existingItem)
    existingItem.quantity = Math.min(99, existingItem.quantity + addQuantity);
  else cartItems.push({ productId: product.id, variant, quantity: addQuantity });
  persistCart();
  renderCart();
  if (stickyCart) {
    const itemTitle = stickyCart.querySelector(".sticky-cart-item");
    if (itemTitle) itemTitle.textContent = product.name;
    stickyCart.classList.add("is-visible");
    stickyCart.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      stickyCart.classList.remove("is-visible");
      stickyCart.setAttribute("aria-hidden", "true");
    }, 3200);
  }
};
window.kinboniAddProductToCart = addProductToCart;

const addToCart = (card) => {
  const product = productsById.get(card?.dataset.productId);
  if (!product) {
    console.error("A product card is missing a matching product data record.", card);
    return;
  }
  addProductToCart(product);
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

const closeCart = () => setOverlayState(cartDrawer, false);

document.querySelector(".cart-button")?.addEventListener("click", () => {
  window.location.href = "cart.html";
});
document.querySelector(".cart-close")?.addEventListener("click", closeCart);
cartCheckout?.addEventListener("click", () => {
  if (!cartCheckout.disabled) window.location.href = "checkout.html";
});
document.querySelector(".cart-page-checkout")?.addEventListener("click", () => {
  window.location.href = "checkout.html";
});
stickyCart?.querySelector("button")?.addEventListener("click", (event) => {
  openCart(document.querySelector(".cart-button") || event.currentTarget);
});

const renderWishlist = () => {
  if (!wishlistItemsElement || !wishlistEmpty) return;
  wishlistItemsElement.replaceChildren();
  wishlistProductIds.forEach((productId) => {
    const product = productsById.get(productId);
    if (!product) return;
    const item = document.createElement("article");
    item.className = "cart-item wishlist-item";
    const image = productImageElement(product);
    if (image) item.append(image);
    const detail = document.createElement("div");
    detail.className = "cart-item-details";
    const name = document.createElement("strong");
    name.textContent = product.name;
    const price = document.createElement("span");
    price.textContent =
      product.status === "coming-soon"
        ? "Coming soon"
        : productPriceText(product);
    const actions = document.createElement("div");
    actions.className = "wishlist-item-actions";
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "Add to bag";
    addButton.disabled = product.status === "coming-soon";
    addButton.addEventListener("click", () => addProductToCart(product));
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      wishlistProductIds = wishlistProductIds.filter((id) => id !== productId);
      writeStoredValue(wishlistStorageKey, wishlistProductIds);
      updateWishlistButtons();
      renderWishlist();
    });
    actions.append(addButton, removeButton);
    detail.append(name, price, actions);
    item.append(detail);
    wishlistItemsElement.append(item);
  });
  wishlistEmpty.hidden = wishlistProductIds.length > 0;
  wishlistItemsElement.setAttribute("aria-live", "polite");
};

const updateWishlistButtons = () => {
  wishlistButtons.forEach((button) => {
    const card = button.closest(".product-card");
    const productId = button.dataset.productId || card?.dataset.productId;
    if (!productId) return;
    const isSaved = wishlistProductIds.includes(productId);
    button.classList.toggle("is-active", isSaved);
    button.setAttribute("aria-pressed", String(isSaved));
    button.setAttribute(
      "aria-label",
      isSaved
        ? `Remove ${productsById.get(productId)?.name || "product"} from wishlist`
        : `Add ${productsById.get(productId)?.name || "product"} to wishlist`,
    );
    const icon = button.querySelector("i");
    icon?.classList.toggle("fa-solid", isSaved);
    icon?.classList.toggle("fa-regular", !isSaved);
  });
  const savedCount = wishlistProductIds.length;
  document.querySelectorAll(".wishlist-toggle").forEach((button) => {
    button.setAttribute(
      "aria-label",
      savedCount ? `Wishlist, ${savedCount} saved products` : "Wishlist",
    );
    const label = button.querySelector("span");
    if (label && !button.querySelector(".wishlist-count"))
      label.textContent = savedCount ? `Wishlist (${savedCount})` : "Wishlist";
    let badge = button.querySelector(".wishlist-count");
    if (savedCount && !badge) {
      badge = document.createElement("span");
      badge.className = "wishlist-count";
      button.append(badge);
    }
    if (badge) {
      badge.textContent = String(savedCount);
      badge.hidden = savedCount === 0;
    }
  });
  if (wishlistDrawer?.classList.contains("is-open")) renderWishlist();
};
window.kinboniUpdateWishlistButtons = updateWishlistButtons;

wishlistButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const productId =
      button.dataset.productId ||
      button.closest(".product-card")?.dataset.productId;
    if (!productId) return;
    wishlistProductIds = wishlistProductIds.includes(productId)
      ? wishlistProductIds.filter((id) => id !== productId)
      : [...wishlistProductIds, productId];
    writeStoredValue(wishlistStorageKey, wishlistProductIds);
    updateWishlistButtons();
  });
});
updateWishlistButtons();
renderWishlist();

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

window.addEventListener("storage", (event) => {
  if (event.key === cartStorageKey) {
    try {
      const parsed = event.newValue ? JSON.parse(event.newValue) : [];
      cartItems = Array.isArray(parsed)
        ? parsed
            .filter(
              (item) =>
                item &&
                productsById.has(item.productId) &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0,
            )
            .map((item) => ({
              productId: item.productId,
              variant: typeof item.variant === "string" ? item.variant : "",
              quantity: Math.min(item.quantity, 99),
            }))
        : [];
      renderCart();
    } catch (error) {
      console.error("Unable to sync the shopping bag across tabs.", error);
    }
  }
  if (event.key === wishlistStorageKey) {
    try {
      const parsed = event.newValue ? JSON.parse(event.newValue) : [];
      wishlistProductIds = Array.isArray(parsed)
        ? [...new Set(parsed.filter((id) => productsById.has(id)))]
        : [];
      updateWishlistButtons();
    } catch (error) {
      console.error("Unable to sync the wishlist across tabs.", error);
    }
  }
});

updateCartCount();
renderCart();

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

document.querySelectorAll(".product-card").forEach((card) => {
  if (card.closest(".shop-page")) return;
  const actions = card.querySelector(".price-row");
  const quickAdd = card.querySelector(".mini-button");
  if (!actions || !quickAdd) return;

  quickAdd.textContent = "Add to Bag";
  quickAdd.setAttribute(
    "aria-label",
    `Add ${card.querySelector("h3")?.textContent.trim() || "product"} to bag`,
  );

  quickAdd.addEventListener("click", () => {
    addToCart(card);
  });
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
      result.textContent = `Your starting point: ${option.textContent}. Explore the collection below.`;
  });
});

const newsletterForm = document.querySelector(".newsletter-form");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = newsletterForm
      .closest(".newsletter-form-wrap")
      ?.querySelector(".newsletter-status");
    const email = newsletterForm.querySelector('input[type="email"]');
    const honeypot = newsletterForm.querySelector('input[name="website"]');
    const submitButton = newsletterForm.querySelector('[type="submit"]');
    if (
      !email ||
      !status ||
      !submitButton ||
      submitButton.disabled ||
      !newsletterForm.reportValidity()
    )
      return;
    status.removeAttribute("data-state");
    if (honeypot?.value.trim()) {
      status.dataset.state = "error";
      status.textContent = "The sign-up could not be processed. Please try again.";
      return;
    }
    submitButton.disabled = true;
    try {
      const endpoint = siteConfig.newsletterEndpoint;
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.value.trim() }),
        });
        if (!response.ok)
          throw new Error(`Newsletter endpoint returned ${response.status}.`);
        status.dataset.state = "success";
        status.textContent = "Thanks for subscribing.";
      } else {
        const current = readStoredValue("kinboni-newsletter-v1", []);
        const emails = Array.isArray(current) ? current : [];
        const normalizedEmail = email.value.trim().toLowerCase();
        if (emails.includes(normalizedEmail)) {
          status.dataset.state = "success";
          status.textContent = "This email is already saved on this device.";
        } else if (
          writeStoredValue("kinboni-newsletter-v1", [
            ...emails,
            normalizedEmail,
          ])
        ) {
          status.dataset.state = "success";
          status.textContent =
            "Thanks — your sign-up has been saved on this device.";
        } else {
          throw new Error("The newsletter sign-up could not be stored.");
        }
      }
      newsletterForm.reset();
    } catch (error) {
      console.error("Newsletter sign-up failed.", error);
      status.dataset.state = "error";
      status.textContent =
        "We could not complete the sign-up. Please try again later.";
    } finally {
      submitButton.disabled = false;
    }
  });
}

const contactForm = document.querySelector(".contact-form");
contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = contactForm.querySelector(".form-status");
  if (!status || !contactForm.reportValidity()) return;
  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
  const whatsappNumber = configuredWhatsAppNumber();
  const businessEmail = configuredBusinessEmail();
  let contactUrl = "";
  if (whatsappNumber) {
    contactUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(body)}`;
  } else if (businessEmail) {
    contactUrl = `mailto:${businessEmail}?subject=${encodeURIComponent(
      "Kinboni customer enquiry",
    )}&body=${encodeURIComponent(body)}`;
  }
  if (!contactUrl) {
    status.dataset.state = "error";
    status.textContent =
      "No active contact channel is configured yet. Replace the demo WhatsApp number or email in config.js.";
    return;
  }
  status.dataset.state = "success";
  status.textContent = "Opening the configured contact channel…";
  const contactWindow = window.open(contactUrl, "_blank");
  if (contactWindow) contactWindow.opener = null;
  else window.location.href = contactUrl;
});

const checkoutForm = document.querySelector("#checkout-form");
if (checkoutForm) {
  const checkoutEmpty = document.querySelector(".checkout-empty");
  const checkoutItems = document.querySelector(".checkout-items");
  const checkoutSubtotal = document.querySelector("[data-checkout-subtotal]");
  const checkoutDelivery = document.querySelector("[data-checkout-delivery]");
  const checkoutTotal = document.querySelector("[data-checkout-total]");
  const deliveryZone = checkoutForm.querySelector('[name="deliveryZone"]');
  const deliveryChargeLabel = checkoutForm.querySelector(
    "[data-delivery-charge]",
  );
  const phoneInput = checkoutForm.querySelector('[name="phone"]');
  const phoneError = checkoutForm.querySelector("#phone-error");
  const paymentInstructions = checkoutForm.querySelector(
    "[data-payment-instructions]",
  );
  const transactionField = checkoutForm.querySelector(".transaction-field");
  const transactionInput = transactionField?.querySelector("input");
  const status = checkoutForm.querySelector(".form-status");
  const paymentConfig = siteConfig.payment || {};

  const bkashInput = checkoutForm.querySelector('[value="bkash"]');
  const nagadInput = checkoutForm.querySelector('[value="nagad"]');
  const codInput = checkoutForm.querySelector('[value="cod"]');
  const cardInput = checkoutForm.querySelector('[value="card"]');
  const codPaymentNote = checkoutForm.querySelector("[data-cod-payment-note]");
  if (bkashInput)
    bkashInput.disabled =
      !paymentConfig.bkashEnabled || !paymentConfig.bkashMerchantNumber;
  if (nagadInput)
    nagadInput.disabled =
      !paymentConfig.nagadEnabled || !paymentConfig.nagadMerchantNumber;
  if (codInput) {
    codInput.disabled = !paymentConfig.cashOnDeliveryEnabled;
    codInput.checked = !codInput.disabled;
  }
  if (codPaymentNote)
    codPaymentNote.textContent = codInput?.disabled
      ? " (not configured yet)"
      : "";
  if (cardInput) cardInput.disabled = !paymentConfig.onlineCardEnabled;
  if (codInput?.disabled) {
    const firstEnabled = checkoutForm.querySelector(
      'input[name="paymentMethod"]:not(:disabled)',
    );
    if (firstEnabled) firstEnabled.checked = true;
  }

  const currentCheckoutTotals = () => {
    const items = cartItems.map((item) => ({
      item,
      product: productsById.get(item.productId),
    }));
    const subtotalKnown =
      items.length > 0 &&
      items.every(
        ({ item, product }) =>
          product &&
          typeof product.price === "number" &&
          Number.isFinite(product.price) &&
          product.status !== "coming-soon" &&
          item.quantity <= 99,
      );
    const subtotal = subtotalKnown
      ? items.reduce(
          (sum, { item, product }) => sum + product.price * item.quantity,
          0,
        )
      : null;
    const zone = deliveryZone?.value;
    const delivery = siteConfig.delivery || {};
    const rawCharge =
      zone === "insideDhaka"
        ? delivery.insideDhakaCharge
        : zone === "outsideDhaka"
          ? delivery.outsideDhakaCharge
          : null;
    const threshold = delivery.freeDeliveryThreshold;
    const deliveryAmount =
      subtotalKnown &&
      typeof threshold === "number" &&
      Number.isFinite(threshold) &&
      subtotal >= threshold
        ? 0
        : typeof rawCharge === "number" && Number.isFinite(rawCharge)
          ? rawCharge
          : null;
    return {
      items,
      subtotal,
      delivery: deliveryAmount,
      total:
        subtotal !== null && deliveryAmount !== null
          ? subtotal + deliveryAmount
          : null,
    };
  };

  const renderCheckout = () => {
    const totals = currentCheckoutTotals();
    if (checkoutItems) {
      checkoutItems.replaceChildren();
      totals.items.forEach(({ item, product }) => {
        if (!product) return;
        const row = document.createElement("div");
        row.className = "checkout-line";
        const name = document.createElement("span");
        name.textContent = `${product.name} × ${item.quantity}`;
        const price = document.createElement("strong");
        price.textContent =
          typeof product.price === "number"
            ? productPriceText({ price: product.price * item.quantity })
            : "To be confirmed";
        row.append(name, price);
        checkoutItems.append(row);
      });
    }
    if (checkoutEmpty) checkoutEmpty.hidden = cartItems.length > 0;
    if (checkoutSubtotal)
      checkoutSubtotal.textContent =
        totals.subtotal === null
          ? "To be confirmed"
          : productPriceText({ price: totals.subtotal });
    if (checkoutDelivery)
      checkoutDelivery.textContent =
        totals.delivery === null
          ? "To be confirmed"
          : productPriceText({ price: totals.delivery });
    if (checkoutTotal)
      checkoutTotal.textContent =
        totals.total === null
          ? "To be confirmed"
          : productPriceText({ price: totals.total });
    if (deliveryChargeLabel) {
      const zone = deliveryZone?.value;
      const delivery = siteConfig.delivery || {};
      const amount =
        zone === "insideDhaka"
          ? delivery.insideDhakaCharge
          : zone === "outsideDhaka"
            ? delivery.outsideDhakaCharge
            : null;
      deliveryChargeLabel.textContent = zone
        ? `Configured charge: ${deliveryChargeText(amount)}.`
        : "Choose a delivery area to see the configured charge.";
    }
    return totals;
  };

  const updatePaymentInstructions = () => {
    const method = checkoutForm.querySelector(
      'input[name="paymentMethod"]:checked',
    )?.value;
    const merchant =
      method === "bkash"
        ? paymentConfig.bkashMerchantNumber
        : method === "nagad"
          ? paymentConfig.nagadMerchantNumber
          : "";
    const paymentLabel =
      method === "bkash" ? "bKash" : method === "nagad" ? "Nagad" : "";
    if (paymentInstructions) {
      paymentInstructions.hidden = !merchant;
      paymentInstructions.textContent = merchant
        ? `${paymentLabel} merchant number: ${merchant}. Enter the transaction ID or last 4 digits after payment.`
        : "";
    }
    if (transactionField) transactionField.hidden = !merchant;
    if (transactionInput) transactionInput.required = Boolean(merchant);
  };

  const validateBangladeshPhone = () => {
    if (!phoneInput) return true;
    const phone = phoneInput.value.trim();
    const valid = /^(?:01[3-9]\d{8}|\+8801[3-9]\d{8})$/.test(phone);
    phoneInput.setCustomValidity(
      phone && !valid ? "Enter a valid Bangladesh mobile number." : "",
    );
    if (phoneError)
      phoneError.textContent =
        phone && !valid ? "Enter a valid Bangladesh mobile number." : "";
    return valid;
  };

  phoneInput?.addEventListener("input", validateBangladeshPhone);
  checkoutForm
    .querySelectorAll('[name="paymentMethod"]')
    .forEach((input) =>
      input.addEventListener("change", updatePaymentInstructions),
    );
  deliveryZone?.addEventListener("change", renderCheckout);
  updatePaymentInstructions();
  renderCheckout();

  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (status) {
      status.removeAttribute("data-state");
      status.textContent = "";
    }
    validateBangladeshPhone();
    if (!checkoutForm.reportValidity()) return;
    const totals = renderCheckout();
    if (!cartItems.length) {
      if (status) {
        status.dataset.state = "error";
        status.textContent = "Your bag is empty. Add a product before checkout.";
      }
      return;
    }
    if (totals.total === null) {
      if (status) {
        status.dataset.state = "error";
        status.textContent =
          "The product prices or delivery charge are not configured yet. Kinboni must confirm them before checkout.";
      }
      return;
    }
    const formData = new FormData(checkoutForm);
    const method = String(formData.get("paymentMethod") || "");
    const whatsappNumber = configuredWhatsAppNumber();
    const endpoint = String(siteConfig.orderEndpoint || "").trim();
    if (!method) {
      if (status) {
        status.dataset.state = "error";
        status.textContent =
          "No payment method is enabled. Kinboni must configure an available method before checkout.";
      }
      return;
    }
    if (!whatsappNumber && !endpoint) {
      if (status) {
        status.dataset.state = "error";
        status.textContent =
          "Order submission is not configured. Replace the demo WhatsApp number or add an order endpoint in config.js.";
      }
      return;
    }

    const date = new Date();
    const orderId = `KB-${String(date.getFullYear()).slice(-2)}${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;
    const items = cartItems.map((item) => {
      const product = productsById.get(item.productId);
      return {
        id: item.productId,
        name: product?.name || item.productId,
        variant: item.variant,
        quantity: item.quantity,
        unitPrice: product?.price,
      };
    });
    const order = {
      orderId,
      createdAt: date.toISOString(),
      customer: {
        name: String(formData.get("name") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        division: String(formData.get("division") || ""),
        district: String(formData.get("district") || ""),
        area: String(formData.get("area") || "").trim(),
        address: String(formData.get("address") || "").trim(),
        deliveryNote: String(formData.get("deliveryNote") || "").trim(),
      },
      paymentMethod: method,
      transactionId: String(formData.get("transactionId") || "").trim(),
      deliveryZone: String(formData.get("deliveryZone") || ""),
      items,
      subtotal: totals.subtotal,
      deliveryCharge: totals.delivery,
      total: totals.total,
      currency: siteConfig.currency?.code || "BDT",
    };
    const message = [
      `Kinboni order request ${orderId}`,
      ...items.map(
        (item) =>
          `${item.name}${item.variant ? ` (${item.variant})` : ""} × ${item.quantity} — ${productPriceText({ price: item.unitPrice * item.quantity })}`,
      ),
      `Subtotal: ${productPriceText({ price: totals.subtotal })}`,
      `Delivery: ${productPriceText({ price: totals.delivery })}`,
      `Total: ${productPriceText({ price: totals.total })}`,
      `Payment: ${method}`,
      `Name: ${order.customer.name}`,
      `Phone: ${order.customer.phone}`,
      `Address: ${order.customer.address}, ${order.customer.area}, ${order.customer.district}, ${order.customer.division}`,
      `Delivery note: ${order.customer.deliveryNote || "None"}`,
    ].join("\n");
    const whatsappUrl = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
      : "";
    const whatsappWindow = whatsappUrl
      ? window.open("about:blank", "_blank")
      : null;

    let endpointSucceeded = false;
    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });
        if (!response.ok)
          throw new Error(`Order endpoint returned ${response.status}.`);
        endpointSucceeded = true;
      } catch (error) {
        console.error("Order endpoint failed; using WhatsApp fallback.", error);
      }
    }
    if (!endpointSucceeded && !whatsappUrl) {
      whatsappWindow?.close();
      if (status) {
        status.dataset.state = "error";
        status.textContent =
          "The order endpoint failed and no WhatsApp fallback is configured.";
      }
      return;
    }
    order.whatsappUrl = whatsappUrl;
    order.endpointSucceeded = endpointSucceeded;
    if (!writeStoredValue("kinboni-last-order-v1", order)) {
      whatsappWindow?.close();
      if (status) {
        status.dataset.state = "error";
        status.textContent =
          "The order could not be saved on this device. Please retry or contact Kinboni.";
      }
      return;
    }
    if (whatsappWindow && whatsappUrl) {
      whatsappWindow.location.href = whatsappUrl;
      whatsappWindow.opener = null;
    }
    cartItems = [];
    persistCart();
    renderCart();
    window.location.href = "order-success.html";
  });
}

const successContent = document.querySelector(".order-success-content");
if (successContent) {
  const order = readStoredValue("kinboni-last-order-v1", null);
  const message = successContent.querySelector(".order-success-message");
  const summary = successContent.querySelector(".order-success-summary");
  const whatsappLink = successContent.querySelector(".order-whatsapp-link");
  if (!order) {
    if (message)
      message.textContent =
        "No saved order request was found on this device. Return to the shop to start an order.";
  } else {
    if (message)
      message.textContent =
        "Your order request is prepared. Kinboni must confirm availability and delivery details before the order is final.";
    const details = [
      ["Order reference", order.orderId],
      ["Name", order.customer?.name],
      ["Items", String(order.items?.reduce((count, item) => count + item.quantity, 0) || 0)],
      [
        "Total",
        typeof order.total === "number"
          ? productPriceText({ price: order.total })
          : "To be confirmed",
      ],
      [
        "Submission",
        order.endpointSucceeded
          ? "Sent to the configured order endpoint"
          : "Ready for WhatsApp confirmation",
      ],
    ];
    details.forEach(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      term.textContent = label;
      const description = document.createElement("dd");
      description.textContent = value || "—";
      row.append(term, description);
      summary?.append(row);
    });
    if (order.whatsappUrl && whatsappLink) {
      whatsappLink.href = order.whatsappUrl;
      whatsappLink.target = "_blank";
      whatsappLink.rel = "noopener noreferrer";
      whatsappLink.hidden = false;
    }
  }
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
if (shopPage && !window.KINBONI_DYNAMIC_SHOP) {
  const shopGrid = shopPage.querySelector(".shop-product-grid");
  const shopCards = Array.from(shopPage.querySelectorAll(".shop-product-card"));
  const shopFilters = shopPage.querySelector(".shop-filters");
  const shopCount = shopPage.querySelector(".shop-product-count");
  const shopEmpty = shopPage.querySelector(".shop-empty-state");
  const shopSort = shopPage.querySelector(".shop-sort select");
  const filterInputs = shopPage.querySelectorAll(".shop-filters input");
  const minPriceInput = shopPage.querySelector("#shop-price-min");
  const maxPriceInput = shopPage.querySelector("#shop-price-max");
  let searchQuery = "";

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

  const matchesFilters = (card, filters) => {
    const cardPrice = Number(card.dataset.priceValue);
    const minimum =
      minPriceInput?.value === "" ? null : Number(minPriceInput?.value);
    const maximum =
      maxPriceInput?.value === "" ? null : Number(maxPriceInput?.value);
    const matchesPrice =
      card.dataset.priceValue !== "" &&
      Number.isFinite(cardPrice) &&
      (minimum === null || !Number.isFinite(minimum) || cardPrice >= minimum) &&
      (maximum === null || !Number.isFinite(maximum) || cardPrice <= maximum);
    return (
      (!searchQuery || card.textContent.toLowerCase().includes(searchQuery)) &&
      (!minPriceInput?.value && !maxPriceInput?.value || matchesPrice) &&
      Object.entries(filters).every(([filter, values]) => {
        const cardValue = card.dataset[filter] || "";
        return values.some((value) => cardValue.split(" ").includes(value));
      })
    );
  };

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
  [minPriceInput, maxPriceInput].forEach((input) => {
    input?.addEventListener("input", updateShop);
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
  const quickCopy = quickView?.querySelector(".shop-quick-copy");
  const quickAddButton = quickView?.querySelector(".shop-quick-add");
  let quickDescription = quickCopy
    ? Array.from(quickCopy.querySelectorAll("p")).find(
        (paragraph) => paragraph !== quickCategory,
      )
    : null;
  if (quickDescription) quickDescription.className = "shop-quick-description";
  let quickVariantSelect = quickView?.querySelector(".shop-quick-variant");
  let quickVariantWrap = quickView?.querySelector(".shop-quick-variant-wrap");
  if (quickCopy && quickAddButton && !quickVariantWrap) {
    quickVariantWrap = document.createElement("label");
    quickVariantWrap.className = "shop-quick-variant-wrap";
    quickVariantWrap.hidden = true;
    const label = document.createElement("span");
    label.textContent = "Color";
    quickVariantSelect = document.createElement("select");
    quickVariantSelect.className = "shop-quick-variant";
    quickVariantSelect.setAttribute("aria-label", "Choose color");
    quickVariantWrap.append(label, quickVariantSelect);
    quickAddButton.before(quickVariantWrap);
  }
  let quickDetailsLink = quickView?.querySelector(".shop-quick-details");
  if (quickCopy && quickAddButton && !quickDetailsLink) {
    quickDetailsLink = document.createElement("a");
    quickDetailsLink.className = "button button-secondary shop-quick-details";
    quickDetailsLink.textContent = "View product details";
    quickDetailsLink.href = "product.html";
    quickAddButton.before(quickDetailsLink);
  }
  let quickProduct = null;
  let quickViewTrigger = null;
  const closeQuickView = () => {
    if (!quickView?.classList.contains("is-open")) return;
    setOverlayState(quickView, false);
    document.body.classList.remove("shop-quick-open");
    quickViewTrigger?.focus();
    quickViewTrigger = null;
  };

  shopPage.querySelectorAll(".quick-view-button").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".shop-product-card");
      const image = card?.querySelector(".product-media img");
      const product = productsById.get(card?.dataset.productId);
      if (
        !card ||
        !product ||
        !image ||
        !quickView ||
        !quickImage ||
        !quickTitle ||
        !quickCategory ||
        !quickPrice
      )
        return;
      quickProduct = product;
      quickViewTrigger = button;
      quickImage.src = image.src;
      quickImage.alt = image.alt;
      quickTitle.textContent =
        card.querySelector("h3")?.textContent || "Kinboni bag";
      quickCategory.textContent =
        card.querySelector(".category")?.textContent || "Kinboni collection";
      quickPrice.textContent = productPriceText(product);
      if (quickDescription)
        quickDescription.textContent =
          product.description || "Product details will be confirmed soon.";
      if (quickVariantSelect && quickVariantWrap) {
        quickVariantSelect.replaceChildren();
        (product.colors || []).forEach((color) => {
          const option = document.createElement("option");
          option.value = color;
          option.textContent = color;
          quickVariantSelect.append(option);
        });
        quickVariantWrap.hidden = !product.colors?.length;
      }
      if (quickDetailsLink)
        quickDetailsLink.href = `product.html?id=${encodeURIComponent(product.id)}`;
      if (quickAddButton)
        quickAddButton.disabled = product.status === "coming-soon";
      if (quickAddButton)
        quickAddButton.textContent =
          product.status === "coming-soon" ? "Coming Soon" : "Add to Bag";
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
    if (quickProduct && quickProduct.status !== "coming-soon")
      addProductToCart(quickProduct, quickVariantSelect?.value || "");
    closeQuickView();
  });

  updateShop();
}
