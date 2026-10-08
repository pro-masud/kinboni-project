const productPage = document.querySelector(".product-page");

if (productPage) {
  const products = Array.isArray(window.KINBONI_PRODUCTS)
    ? window.KINBONI_PRODUCTS
    : [];
  const params = new URLSearchParams(location.search);
  const requestedProduct = params.get("id") || params.get("slug") || "";
  const product = products.find(
    (item) =>
      item.id === requestedProduct ||
      item.slug === requestedProduct,
  );
  const loadStatus = productPage.querySelector(".product-load-status");
  const detail = productPage.querySelector(".product-detail");
  const categoryLabels = {
    totes: "Tote Bags",
    "shoulder-bags": "Shoulder Bags",
    crossbody: "Crossbody Bags",
    "mini-bags": "Mini Bags",
    "work-bags": "Work Bags",
    "travel-bags": "Travel Bags",
    handbags: "Handbags",
    clutches: "Clutches",
    jewelry: "Jewelry",
  };
  const categoryFilters = {
    totes: "tote",
    "shoulder-bags": "shoulder",
    crossbody: "crossbody",
    "mini-bags": "mini",
    "work-bags": "work",
    "travel-bags": "travel",
    handbags: "handbags",
    clutches: "clutch",
  };

  if (!product) {
    loadStatus.textContent =
      "We couldn't find that product. Browse the shop to discover the collection.";
    const backLink = document.createElement("a");
    backLink.href = "shop.html";
    backLink.className = "button button-primary";
    backLink.textContent = "Browse the shop";
    loadStatus.after(backLink);
    document.title = "Product not found | Kinboni";
  } else {
    const currency = window.KINBONI_CONFIG.currency;
    const formatPrice = (price) =>
      `${currency.symbol}${new Intl.NumberFormat(currency.locale, {
        maximumFractionDigits: 0,
      }).format(price)}`;
    const priceText =
      product.status === "coming-soon"
        ? "Coming soon"
        : typeof product.price === "number"
          ? formatPrice(product.price)
          : "Price to be confirmed";
    const productName = product.name;
    document.title = `${productName} | Kinboni`;
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta)
      descriptionMeta.content =
        product.description || `Discover ${productName} from Kinboni.`;
    window.kinboniUpdateSeoMetadata?.();

    productPage.querySelector("[data-product-breadcrumb]").textContent =
      productName;
    productPage.querySelector(".product-category").textContent =
      categoryLabels[product.category] || product.category;
    productPage.querySelector("#product-title").textContent = productName;
    productPage.querySelector(".product-price").textContent = priceText;
    productPage.querySelector(".product-description").textContent =
      product.description || "Product details will be confirmed soon.";
    productPage.querySelector(".product-detail-copy").textContent =
      product.description || "Product details will be confirmed soon.";
    const stockLabel = {
      "in-stock": "In stock",
      "out-of-stock": "Out of stock",
      "coming-soon": "Coming soon",
      unknown: "Availability to be confirmed",
    }[product.status === "coming-soon" ? "coming-soon" : product.stockStatus] ||
      "Availability to be confirmed";
    productPage.querySelector(".product-stock-status").textContent = stockLabel;
    productPage.querySelector("[data-product-material]").textContent =
      product.materials || "Material details to be confirmed.";
    productPage.querySelector("[data-product-care]").textContent =
      product.care || "Care instructions to be confirmed.";
    productPage.querySelector(".product-dimensions").textContent =
      product.dimensions || "Dimensions to be confirmed.";
    productPage.querySelector(".product-breadcrumb a:last-of-type").href =
      `shop.html?category=${encodeURIComponent(
        categoryFilters[product.category] || product.category,
      )}#products`;

    const wishlistButton = productPage.querySelector(".product-wishlist");
    wishlistButton.dataset.productId = product.id;
    window.kinboniUpdateWishlistButtons();

    const colorSelect = productPage.querySelector(".product-variant");
    const colorField = productPage.querySelector(".product-variant-field");
    const variantNote = productPage.querySelector(".product-variant-note");
    (product.colors || []).forEach((color) => {
      const option = document.createElement("option");
      option.value = color;
      option.textContent = color;
      colorSelect.append(option);
    });
    colorField.hidden = !product.colors?.length;
    variantNote.hidden = Boolean(product.colors?.length);

    const mainImageButton = productPage.querySelector(".product-gallery-open");
    const mainImage = productPage.querySelector(".product-main-image");
    const thumbnailList = productPage.querySelector(".product-thumbnails");
    const productImages = product.images?.length
      ? product.images
      : [{ src: "", fallback: "", alt: productName }];
    let activeImage = productImages[0];
    const setMainImage = (imageData) => {
      activeImage = imageData;
      mainImage.src = imageData.src;
      mainImage.alt = imageData.src.includes("product-image-pending")
        ? `Product photo pending: ${productName}`
        : imageData.alt || productName;
      mainImage.onerror = () => {
        if (imageData.fallback && mainImage.src !== new URL(imageData.fallback, document.baseURI).href) {
          mainImage.src = imageData.fallback;
          return;
        }
        mainImage.onerror = null;
        mainImage.classList.add("image-unavailable");
      };
      mainImage.classList.remove("image-unavailable");
      thumbnailList.querySelectorAll("button").forEach((button) => {
        const isSelected = button.dataset.imageSrc === imageData.src;
        button.classList.toggle("is-active", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
      });
    };
    productImages.forEach((imageData, index) => {
      const thumbnail = document.createElement("button");
      thumbnail.type = "button";
      thumbnail.className = "product-thumbnail";
      thumbnail.dataset.imageSrc = imageData.src;
      thumbnail.setAttribute("aria-label", `View image ${index + 1} of ${productName}`);
      thumbnail.setAttribute("aria-pressed", String(index === 0));
      const image = document.createElement("img");
      image.src = imageData.src;
      image.alt = imageData.src.includes("product-image-pending")
        ? `Product photo pending: ${productName}`
        : imageData.alt || `${productName}, view ${index + 1}`;
      image.loading = "lazy";
      image.width = 120;
      image.height = 144;
      image.onerror = () => {
        if (imageData.fallback && image.src !== new URL(imageData.fallback, document.baseURI).href)
          image.src = imageData.fallback;
        else image.classList.add("image-unavailable");
      };
      thumbnail.append(image);
      thumbnail.addEventListener("click", () => setMainImage(imageData));
      thumbnailList.append(thumbnail);
    });
    setMainImage(activeImage);

    const addButton = productPage.querySelector(".product-add");
    addButton.disabled = product.status === "coming-soon";
    addButton.textContent =
      product.status === "coming-soon" ? "Coming Soon" : "Add to Bag";
    addButton.addEventListener("click", () => {
      const quantityInput = productPage.querySelector(".product-quantity");
      const quantity = Number(quantityInput.value);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        quantityInput.setCustomValidity("Choose a quantity between 1 and 99.");
        quantityInput.reportValidity();
        return;
      }
      quantityInput.setCustomValidity("");
      window.kinboniAddProductToCart(product, colorSelect.value, quantity);
    });

    const whatsappButton = productPage.querySelector(".product-whatsapp");
    const whatsappNote = productPage.querySelector(".product-contact-note");
    const whatsappNumber = String(
      window.KINBONI_CONFIG.contact.whatsappNumber || "",
    ).replace(/\D/g, "");
    if (/^\d{8,15}$/.test(whatsappNumber)) {
      const message = encodeURIComponent(
        `Hello Kinboni, I'm interested in ${productName}.`,
      );
      whatsappButton.href = `https://wa.me/${whatsappNumber}?text=${message}`;
      whatsappButton.removeAttribute("aria-disabled");
      whatsappNote.hidden = true;
    } else {
      whatsappButton.hidden = true;
      whatsappNote.hidden = false;
    }

    const relatedGrid = productPage.querySelector(".product-related-grid");
    const relatedProducts = products
      .filter(
        (item) =>
          item.id !== product.id &&
          item.category === product.category &&
          item.status !== "coming-soon",
      )
      .slice(0, 4);
    relatedProducts.forEach((relatedProduct) => {
      const card = document.createElement("article");
      card.className = "product-card product-related-card";
      card.dataset.productId = relatedProduct.id;
      const link = document.createElement("a");
      link.className = "product-related-image";
      link.href = `product.html?id=${encodeURIComponent(relatedProduct.id)}`;
      const imageData = relatedProduct.images?.[0];
      if (imageData) {
        const image = document.createElement("img");
        image.src = imageData.src;
        image.alt = imageData.src.includes("product-image-pending")
          ? `Product photo pending: ${relatedProduct.name}`
          : imageData.alt || relatedProduct.name;
        image.loading = "lazy";
        image.width = 600;
        image.height = 720;
        image.onerror = () => {
          if (imageData.fallback && image.src !== new URL(imageData.fallback, document.baseURI).href)
            image.src = imageData.fallback;
          else image.classList.add("image-unavailable");
        };
        link.append(image);
      }
      const name = document.createElement("h3");
      const nameLink = document.createElement("a");
      nameLink.href = link.href;
      nameLink.textContent = relatedProduct.name;
      name.append(nameLink);
      const price = document.createElement("p");
      price.textContent =
        typeof relatedProduct.price === "number"
          ? formatPrice(relatedProduct.price)
          : "Price to be confirmed";
      card.append(link, name, price);
      relatedGrid.append(card);
    });
    if (!relatedProducts.length)
      productPage.querySelector(".product-related").hidden = true;

    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: productName,
      description: product.description || undefined,
      sku: product.sku || product.id,
      category: categoryLabels[product.category] || product.category,
      brand: { "@type": "Brand", name: window.KINBONI_CONFIG.brandName },
    };
    const schemaImages = productImages
      .filter(
        (image) =>
          image.src && !image.src.includes("product-image-pending"),
      )
      .map((image) => new URL(image.src, document.baseURI).href);
    if (schemaImages.length) productSchema.image = schemaImages;
    if (
      typeof product.price === "number" &&
      ["in-stock", "out-of-stock"].includes(product.stockStatus)
    ) {
      productSchema.offers = {
        "@type": "Offer",
        priceCurrency: currency.code,
        price: product.price,
        availability: `https://schema.org/${
          product.stockStatus === "in-stock" ? "InStock" : "OutOfStock"
        }`,
      };
    }
    const schemaNode = document.createElement("script");
    schemaNode.type = "application/ld+json";
    schemaNode.id = "product-jsonld";
    schemaNode.textContent = JSON.stringify(productSchema);
    document.head.append(schemaNode);

    const breadcrumbSchema = document.createElement("script");
    breadcrumbSchema.type = "application/ld+json";
    let schemaBaseUrl = null;
    const configuredSiteUrl = String(window.KINBONI_CONFIG.siteUrl || "").trim();
    if (configuredSiteUrl) {
      try {
        const parsedBaseUrl = new URL(
          configuredSiteUrl.endsWith("/")
            ? configuredSiteUrl
            : `${configuredSiteUrl}/`,
        );
        if (["http:", "https:"].includes(parsedBaseUrl.protocol))
          schemaBaseUrl = parsedBaseUrl;
        else
          console.error("The configured site URL must use HTTP or HTTPS.");
      } catch (error) {
        console.error("The configured site URL is invalid for breadcrumb data.", error);
      }
    }
    breadcrumbSchema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: "Home", path: "/" },
        { name: "Shop", path: "shop.html" },
        {
          name: productName,
          path: `product.html?id=${encodeURIComponent(product.id)}`,
        },
      ].map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        ...(schemaBaseUrl
          ? { item: new URL(item.path, schemaBaseUrl).href }
          : {}),
      })),
    });
    document.head.append(breadcrumbSchema);

    const lightbox = document.querySelector(".product-lightbox");
    const lightboxImage = lightbox.querySelector("img");
    const sizeGuide = document.querySelector(".product-size-guide");
    const sizeGuideTrigger = productPage.querySelector(".product-size-guide-open");
    let activeDialogTrigger = null;
    const openDialog = (dialog, trigger, imageData) => {
      activeDialogTrigger = trigger;
      if (imageData) {
        lightboxImage.src = mainImage.src;
        lightboxImage.alt = imageData.alt || productName;
      }
      dialog.classList.add("is-open");
      dialog.setAttribute("aria-hidden", "false");
      dialog.inert = false;
      (dialog.querySelector("button") || dialog).focus();
    };
    const closeDialog = (dialog) => {
      if (!dialog.classList.contains("is-open")) return;
      activeDialogTrigger?.focus();
      dialog.classList.remove("is-open");
      dialog.setAttribute("aria-hidden", "true");
      dialog.inert = true;
      activeDialogTrigger = null;
    };
    [lightbox, sizeGuide].forEach((dialog) => {
      dialog.addEventListener("keydown", (event) => {
        if (event.key !== "Tab") return;
        const focusable = Array.from(
          dialog.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
    });
    mainImageButton.addEventListener("click", () =>
      openDialog(lightbox, mainImageButton, activeImage),
    );
    lightbox.querySelector(".product-lightbox-close").addEventListener("click", () =>
      closeDialog(lightbox),
    );
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeDialog(lightbox);
    });
    sizeGuideTrigger.addEventListener("click", () =>
      openDialog(sizeGuide, sizeGuideTrigger),
    );
    sizeGuide.querySelector(".product-size-guide-close").addEventListener("click", () =>
      closeDialog(sizeGuide),
    );
    sizeGuide.addEventListener("click", (event) => {
      if (event.target === sizeGuide) closeDialog(sizeGuide);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDialog(lightbox);
        closeDialog(sizeGuide);
      }
    });

    detail.hidden = false;
    loadStatus.hidden = true;
  }
}
