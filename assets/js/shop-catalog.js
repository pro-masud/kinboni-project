const shopCatalogGrid = document.querySelector("[data-catalog-source='products']");
const collectionCatalogGrid = document.querySelector("[data-catalog-category]");
const catalogRenderGrid = shopCatalogGrid || collectionCatalogGrid;
const shopCatalog = Array.isArray(window.KINBONI_PRODUCTS)
  ? window.KINBONI_PRODUCTS.filter(
      (product) => product.category !== "jewelry" && product.status !== "coming-soon",
    )
  : [];
const defaultShopOrder = new Map(
  shopCatalog.map((product, index) => [product.id, index]),
);
shopCatalog.sort(
  (first, second) =>
    (first.shopOrder ?? defaultShopOrder.get(first.id)) -
    (second.shopOrder ?? defaultShopOrder.get(second.id)),
);
if (shopCatalogGrid) window.KINBONI_DYNAMIC_SHOP = true;

const catalogCategoryLabels = {
  totes: "Tote Bags",
  "shoulder-bags": "Shoulder Bags",
  crossbody: "Crossbody Bags",
  "mini-bags": "Mini Bags",
  "work-bags": "Work Bags",
  "travel-bags": "Travel Bags",
  handbags: "Handbags",
  clutches: "Clutches",
};

const shopCategoryFilterValues = {
  totes: "tote",
  "shoulder-bags": "shoulder",
  crossbody: "crossbody",
  "mini-bags": "mini",
  "work-bags": "work",
  "travel-bags": "travel",
  handbags: "handbags",
  clutches: "clutch",
};

const catalogImage = (product) => {
  const imageInfo = product.images?.[0];
  if (!imageInfo) return null;
  const image = document.createElement("img");
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
      if (imageInfo.fallback) image.src = imageInfo.fallback;
    },
    { once: true },
  );
  return image;
};

const collectionProductMatches = {
  totes: (product) =>
    product.category === "totes" || product.tags?.includes("tote"),
  "shoulder-bags": (product) =>
    product.category === "shoulder-bags" || product.tags?.includes("shoulder"),
  crossbody: (product) =>
    product.category === "crossbody" || product.tags?.includes("crossbody"),
  "mini-bags": (product) =>
    product.category === "mini-bags" || product.tags?.includes("mini"),
  "work-bags": (product) =>
    product.category === "work-bags" || product.tags?.includes("work"),
  "new-arrivals": (product) =>
    product.status === "new" || product.tags?.includes("new-arrival"),
};

if (catalogRenderGrid) {
  const collectionCategory = collectionCatalogGrid?.dataset.catalogCategory;
  const visibleCatalog = collectionCatalogGrid
    ? shopCatalog.filter(
        collectionProductMatches[collectionCategory] || (() => false),
      )
    : shopCatalog;
  let collectionEmptyState = null;
  if (collectionCatalogGrid) {
    collectionEmptyState =
      collectionCatalogGrid
        .closest(".shop-results")
        ?.querySelector(".shop-empty-state") || null;
    if (!collectionEmptyState) {
      collectionEmptyState = document.createElement("div");
      collectionEmptyState.className = "shop-empty-state";
      collectionEmptyState.hidden = true;
      const heading = document.createElement("h2");
      const message = document.createElement("p");
      const clearButton = document.createElement("button");
      heading.textContent = "No pieces found";
      message.textContent =
        collectionCategory === "new-arrivals"
          ? "New arrival details will be shared when the collection is confirmed."
          : "Try adjusting your filters to discover more from Kinboni.";
      clearButton.className = "button button-primary shop-clear-filters";
      clearButton.type = "button";
      clearButton.textContent = "Clear Filters";
      collectionEmptyState.append(heading, message, clearButton);
    }
    if (collectionCategory === "new-arrivals") {
      const emptyHeading = collectionEmptyState.querySelector("h2");
      const emptyMessage = collectionEmptyState.querySelector("p");
      if (emptyHeading) emptyHeading.textContent = "New arrivals are being confirmed";
      if (emptyMessage)
        emptyMessage.textContent =
          "New arrival details will be shared when the collection is confirmed.";
    }
    collectionEmptyState.hidden = true;
  }
  catalogRenderGrid.replaceChildren();
  visibleCatalog.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card shop-product-card";
    card.dataset.productId = product.id;
    card.dataset.category = collectionCatalogGrid
      ? shopCategoryFilterValues[collectionCategory] || ""
      : shopCategoryFilterValues[product.category] || "handbags";
    card.dataset.color = (product.colors || [])
      .map((color) => color.toLowerCase())
      .join(" ");
    card.dataset.priceValue =
      typeof product.price === "number" ? String(product.price) : "";
    card.dataset.style = (product.tags || []).join(" ");
    card.dataset.size = product.size || "";
    card.dataset.stock = product.stockStatus || "unknown";
    card.dataset.availability = [
      product.stockStatus === "in-stock" ? "in-stock" : "",
      product.tags?.includes("new-arrival") ? "new" : "",
      product.tags?.includes("best-seller") ? "best" : "",
    ]
      .filter(Boolean)
      .join(" ");
    card.dataset.date = product.createdAt || "";
    card.dataset.sales = product.sales || "";
    card.dataset.sale = String(
      typeof product.price === "number" &&
        typeof product.oldPrice === "number" &&
        product.oldPrice > product.price,
    );
    card.dataset.search = [
      product.name,
      product.category,
      product.description,
      ...(product.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    const media = document.createElement("div");
    media.className = "product-media";
    const wishlist = document.createElement("button");
    wishlist.className = "wishlist-button";
    wishlist.type = "button";
    wishlist.setAttribute("aria-label", `Add ${product.name} to wishlist`);
    const heart = document.createElement("i");
    heart.className = "fa-regular fa-heart";
    wishlist.append(heart);
    const image = catalogImage(product);
    if (image) media.append(wishlist, image);

    const hoverActions = document.createElement("div");
    hoverActions.className = "product-hover-actions";
    const quickView = document.createElement("button");
    quickView.className = "quick-view-button";
    quickView.type = "button";
    quickView.textContent = "Quick View";
    quickView.setAttribute("aria-label", `Quick view ${product.name}`);
    const quickAdd = document.createElement("button");
    quickAdd.className = "mini-button";
    quickAdd.type = "button";
    quickAdd.textContent = "Add to Bag";
    quickAdd.setAttribute("aria-label", `Add ${product.name} to bag`);
    hoverActions.append(quickView, quickAdd);
    media.append(hoverActions);

    const info = document.createElement("div");
    info.className = "product-info";
    const meta = document.createElement("div");
    meta.className = "product-meta";
    const category = document.createElement("span");
    category.className = "category";
    category.textContent =
      catalogCategoryLabels[product.category] || product.category;
    meta.append(category);
    const title = document.createElement("h3");
    title.textContent = product.name;
    const priceRow = document.createElement("div");
    priceRow.className = "price-row";
    const priceGroup = document.createElement("div");
    priceGroup.className = "price-group";
    const price = document.createElement("span");
    price.className = "price";
    price.textContent =
      typeof product.price === "number"
        ? `${window.KINBONI_CONFIG.currency.symbol}${new Intl.NumberFormat(
            window.KINBONI_CONFIG.currency.locale,
            { maximumFractionDigits: 0 },
          ).format(product.price)}`
        : "Price to be confirmed";
    priceGroup.append(price);
    priceRow.append(priceGroup);
    info.append(meta, title, priceRow);
    card.append(media, info);
    catalogRenderGrid.append(card);
  });
  if (shopCatalogGrid) {
    shopCatalogGrid.dataset.catalogCount = String(shopCatalog.length);
    shopCatalogGrid.dataset.catalogReady = "true";
  } else {
    collectionCatalogGrid.after(collectionEmptyState);
  }
}

if (shopCatalogGrid) {
  const shopPage = document.querySelector(".shop-page");
  const shopGrid = shopCatalogGrid;
  const shopFilters = shopPage.querySelector(".shop-filters");
  const shopCount = shopPage.querySelector(".shop-product-count");
  const shopResultsNote = shopPage.querySelector(".shop-results-note");
  const shopEmpty = shopPage.querySelector(".shop-empty-state");
  const pagination = shopPage.querySelector(".shop-pagination");
  const activeFilters = shopPage.querySelector(".shop-active-filters");
  const shopSkeleton = shopPage.querySelector(".shop-skeleton");
  const shopSort = shopPage.querySelector(".shop-sort select");
  const colorFieldset = Array.from(shopFilters.querySelectorAll("fieldset")).find(
    (fieldset) => fieldset.querySelector("legend")?.textContent.trim() === "Color",
  );
  const knownColors = new Set(
    shopCatalog.flatMap((product) =>
      (product.colors || []).map((color) => color.toLowerCase()),
    ),
  );
  const colorLegend = colorFieldset.querySelector("legend");
  colorFieldset.replaceChildren(colorLegend);
  if (knownColors.size) {
    [...knownColors].sort().forEach((color) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = color;
      input.dataset.filter = "color";
      label.append(input, ` ${color.replace(/\b\w/g, (letter) => letter.toUpperCase())}`);
      colorFieldset.append(label);
    });
  } else {
    const note = document.createElement("p");
    note.className = "shop-filter-note";
    note.textContent = "Color details to be confirmed.";
    colorFieldset.append(note);
  }
  const filterInputs = Array.from(
    shopFilters.querySelectorAll('input[type="checkbox"]'),
  );
  const minPriceInput = shopFilters.querySelector("#shop-price-min");
  const maxPriceInput = shopFilters.querySelector("#shop-price-max");
  const pageSize = 12;
  let searchQuery = new URLSearchParams(location.search)
    .get("q")
    ?.trim()
    .toLowerCase() || "";
  let currentPage = 1;

  const prices = shopCatalog
    .map((product) => product.price)
    .filter((price) => typeof price === "number" && Number.isFinite(price));
  const knownStyles = new Set(shopCatalog.flatMap((product) => product.tags || []));
  const hasInStock = shopCatalog.some(
    (product) => product.stockStatus === "in-stock",
  );
  const hasSale = shopCatalog.some(
    (product) =>
      typeof product.price === "number" &&
      typeof product.oldPrice === "number" &&
      product.oldPrice > product.price,
  );

  filterInputs.forEach((input) => {
    if (input.dataset.filter === "style" && !knownStyles.has(input.value)) {
      input.disabled = true;
    }
    if (
      input.dataset.filter === "availability" &&
      ((input.value === "in-stock" && !hasInStock) ||
        (input.value === "sale" && !hasSale))
    ) {
      input.disabled = true;
      input.parentElement.title =
        "This filter will be available when product data is confirmed.";
    }
  });
  if (!prices.length) {
    [minPriceInput, maxPriceInput].forEach((input) => {
      input.disabled = true;
      input.title = "Prices have not been confirmed yet.";
    });
  } else {
    minPriceInput.max = String(Math.max(...prices));
    maxPriceInput.max = String(Math.max(...prices));
  }

  const selectedFilters = () => {
    const filters = {};
    filterInputs.forEach((input) => {
      if (!input.checked) return;
      (filters[input.dataset.filter] ||= []).push(input.value);
    });
    return filters;
  };

  const matchesFilters = (card, filters) => {
    if (
      searchQuery &&
      !card.dataset.search.includes(searchQuery) &&
      !card.textContent.toLowerCase().includes(searchQuery)
    )
      return false;
    return Object.entries(filters).every(([filter, values]) => {
      if (filter === "availability") {
        return values.every((value) =>
          value === "in-stock"
            ? card.dataset.stock === "in-stock"
            : card.dataset.sale === "true",
        );
      }
      const cardValues = (card.dataset[filter] || "").split(" ");
      return values.some((value) => cardValues.includes(value));
    });
  };

  const matchesPrice = (card) => {
    const price = Number(card.dataset.priceValue);
    if (card.dataset.priceValue === "" || !Number.isFinite(price))
      return !minPriceInput.value && !maxPriceInput.value;
    const minimum = minPriceInput.value === "" ? null : Number(minPriceInput.value);
    const maximum = maxPriceInput.value === "" ? null : Number(maxPriceInput.value);
    return (
      (minimum === null || price >= minimum) &&
      (maximum === null || price <= maximum)
    );
  };

  const sortCards = (cards) => {
    const sort = shopSort.value;
    const originalOrder = new Map(shopCards.map((card, index) => [card, index]));
    return [...cards].sort((first, second) => {
      const firstPrice = Number(first.dataset.priceValue);
      const secondPrice = Number(second.dataset.priceValue);
      const firstKnown =
        first.dataset.priceValue !== "" && Number.isFinite(firstPrice);
      const secondKnown =
        second.dataset.priceValue !== "" && Number.isFinite(secondPrice);
      if (sort === "price-low" || sort === "price-high") {
        if (firstKnown !== secondKnown) return firstKnown ? -1 : 1;
        if (firstKnown && firstPrice !== secondPrice)
          return sort === "price-low"
            ? firstPrice - secondPrice
            : secondPrice - firstPrice;
      }
      if (sort === "name")
        return first.querySelector("h3").textContent.localeCompare(
          second.querySelector("h3").textContent,
        );
      if (sort === "newest")
        return originalOrder.get(second) - originalOrder.get(first);
      return originalOrder.get(first) - originalOrder.get(second);
    });
  };

  const syncUrl = (page = currentPage, push = false) => {
    const url = new URL(location.href);
    url.search = "";
    const filters = selectedFilters();
    Object.entries(filters).forEach(([key, values]) =>
      values.forEach((value) => url.searchParams.append(key, value)),
    );
    if (minPriceInput.value) url.searchParams.set("min", minPriceInput.value);
    if (maxPriceInput.value) url.searchParams.set("max", maxPriceInput.value);
    if (searchQuery) url.searchParams.set("q", searchQuery);
    if (shopSort.value !== "featured")
      url.searchParams.set("sort", shopSort.value);
    if (page > 1) url.searchParams.set("page", String(page));
    if (push) history.pushState({}, "", url);
    else history.replaceState({}, "", url);
  };

  const renderActiveFilters = () => {
    activeFilters.replaceChildren();
    const filters = selectedFilters();
    const chips = [];
    Object.entries(filters).forEach(([filter, values]) => {
      values.forEach((value) => {
        const input = filterInputs.find(
          (candidate) =>
            candidate.dataset.filter === filter && candidate.value === value,
        );
        chips.push({
          label: input?.parentElement.textContent.trim() || value,
          remove: () => {
            if (input) input.checked = false;
          },
        });
      });
    });
    if (minPriceInput.value || maxPriceInput.value) {
      chips.push({
        label: `${minPriceInput.value ? `৳${minPriceInput.value}` : "Any"} – ${
          maxPriceInput.value ? `৳${maxPriceInput.value}` : "Any"
        }`,
        remove: () => {
          minPriceInput.value = "";
          maxPriceInput.value = "";
        },
      });
    }
    if (searchQuery)
      chips.push({
        label: `Search: ${searchQuery}`,
        remove: () => {
          searchQuery = "";
        },
      });
    chips.forEach(({ label, remove }) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "shop-filter-chip";
      chip.textContent = `${label} ×`;
      chip.addEventListener("click", () => {
        remove();
        currentPage = 1;
        renderShop();
      });
      activeFilters.append(chip);
    });
    activeFilters.hidden = chips.length === 0;
  };

  const renderPagination = (totalPages) => {
    pagination.replaceChildren();
    pagination.hidden = totalPages <= 1;
    if (totalPages <= 1) return;
    const addPageLink = (label, page, className = "", current = false) => {
      const link = document.createElement(current ? "span" : "a");
      link.className = `page-numbers ${className}${current ? " current" : ""}`;
      link.textContent = label;
      if (current) link.setAttribute("aria-current", "page");
      else {
        const url = new URL(location.href);
        url.searchParams.set("page", String(page));
        link.href = `${url.pathname}${url.search}#products`;
        link.addEventListener("click", (event) => {
          event.preventDefault();
          currentPage = page;
          syncUrl(currentPage, true);
          renderShop();
          shopPage.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      pagination.append(link);
    };
    if (currentPage > 1)
      addPageLink("Previous", currentPage - 1, "prev");
    for (let page = 1; page <= totalPages; page += 1)
      addPageLink(String(page), page, "", page === currentPage);
    if (currentPage < totalPages)
      addPageLink("Next", currentPage + 1, "next");
  };

  const shopCards = Array.from(shopGrid.querySelectorAll(".shop-product-card"));
  const renderShop = () => {
    shopSkeleton.hidden = true;
    const filtered = shopCards.filter(
      (card) => matchesFilters(card, selectedFilters()) && matchesPrice(card),
    );
    const sorted = sortCards(filtered);
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (currentPage - 1) * pageSize;
    const pageCards = new Set(sorted.slice(start, start + pageSize));
    const orderedCards = [
      ...sorted,
      ...shopCards.filter((card) => !sorted.includes(card)),
    ];
    orderedCards.forEach((card) => {
      card.hidden = !pageCards.has(card);
      shopGrid.append(card);
    });
    shopCount.textContent = `${filtered.length} Product${
      filtered.length === 1 ? "" : "s"
    }`;
    shopResultsNote.textContent = filtered.length
      ? `Showing ${start + 1}–${Math.min(start + pageSize, filtered.length)} of ${
          filtered.length
        } products`
      : "Showing 0 products";
    shopEmpty.hidden = filtered.length > 0;
    renderPagination(totalPages);
    renderActiveFilters();
    syncUrl(currentPage);
  };

  const clearFilters = () => {
    filterInputs.forEach((input) => {
      input.checked = false;
    });
    minPriceInput.value = "";
    maxPriceInput.value = "";
    searchQuery = "";
    const searchInput = document.querySelector(".search-form input[type='search']");
    if (searchInput) searchInput.value = "";
    currentPage = 1;
    renderShop();
  };

  const restoreFromUrl = () => {
    const params = new URLSearchParams(location.search);
    filterInputs.forEach((input) => {
      input.checked = params.getAll(input.dataset.filter).includes(input.value);
    });
    minPriceInput.value = params.get("min") || "";
    maxPriceInput.value = params.get("max") || "";
    searchQuery = (params.get("q") || "").trim().toLowerCase();
    shopSort.value = ["featured", "newest", "price-low", "price-high", "name"].includes(
      params.get("sort"),
    )
      ? params.get("sort")
      : "featured";
    currentPage = Math.max(1, Number(params.get("page")) || 1);
    const searchInput = document.querySelector(".search-form input[type='search']");
    if (searchInput) searchInput.value = params.get("q") || "";
    renderShop();
  };

  filterInputs.forEach((input) =>
    input.addEventListener("change", () => {
      currentPage = 1;
      renderShop();
    }),
  );
  [minPriceInput, maxPriceInput].forEach((input) =>
    input.addEventListener("change", () => {
      currentPage = 1;
      renderShop();
    }),
  );
  shopSort.addEventListener("change", () => {
    currentPage = 1;
    renderShop();
  });
  shopPage.querySelectorAll(".shop-clear-filters").forEach((button) =>
    button.addEventListener("click", clearFilters),
  );
  shopPage.querySelector(".shop-filter-toggle")?.addEventListener("click", (event) => {
    const isOpen = shopFilters.classList.toggle("is-open");
    event.currentTarget.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) shopFilters.querySelector("input:not([disabled])")?.focus();
  });
  document.addEventListener("shop:search", (event) => {
    searchQuery = event.detail.query.trim().toLowerCase();
    currentPage = 1;
    renderShop();
  });
  window.addEventListener("popstate", restoreFromUrl);
  restoreFromUrl();

  const quickView = shopPage.querySelector(".shop-quick-view");
  const quickImage = quickView.querySelector(".shop-quick-image img");
  const quickTitle = quickView.querySelector("#quick-view-title");
  const quickCategory = quickView.querySelector(".shop-quick-category");
  const quickPrice = quickView.querySelector(".shop-quick-price");
  const quickDescription = quickView.querySelector(".shop-quick-description");
  const quickVariantWrap = quickView.querySelector(".shop-quick-variant-wrap");
  const quickVariant = quickView.querySelector(".shop-quick-variant");
  let quickProduct = null;
  let quickViewTrigger = null;
  const closeQuickView = () => {
    if (!quickView.classList.contains("is-open")) return;
    quickView.classList.remove("is-open");
    quickView.setAttribute("aria-hidden", "true");
    quickView.inert = true;
    document.body.classList.remove("shop-quick-open");
    quickViewTrigger?.focus();
    quickViewTrigger = null;
  };
  shopGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".quick-view-button, .mini-button");
    if (!button) return;
    const card = button.closest(".shop-product-card");
    const product = window.KINBONI_PRODUCTS.find(
      (item) => item.id === card?.dataset.productId,
    );
    if (!product) return;
    if (button.classList.contains("mini-button")) {
      window.kinboniAddProductToCart(product);
      return;
    }
    quickProduct = product;
    quickViewTrigger = button;
    const productImage = card.querySelector(".product-media img");
    quickImage.src = productImage.src;
    quickImage.alt = productImage.alt;
    quickTitle.textContent = product.name;
    quickCategory.textContent =
      catalogCategoryLabels[product.category] || product.category;
    quickPrice.textContent =
      product.status === "coming-soon"
        ? "Coming soon"
        : typeof product.price === "number"
          ? `${window.KINBONI_CONFIG.currency.symbol}${new Intl.NumberFormat(
              window.KINBONI_CONFIG.currency.locale,
              { maximumFractionDigits: 0 },
            ).format(product.price)}`
          : "Price to be confirmed";
    quickDescription.textContent = product.description || "";
    quickVariant.replaceChildren();
    (product.colors || []).forEach((color) => {
      const option = document.createElement("option");
      option.value = color;
      option.textContent = color;
      quickVariant.append(option);
    });
    quickVariantWrap.hidden = !product.colors?.length;
    quickView.querySelector(".shop-quick-details").href =
      `product.html?id=${encodeURIComponent(product.id)}`;
    const addButton = quickView.querySelector(".shop-quick-add");
    addButton.disabled = product.status === "coming-soon";
    addButton.textContent =
      product.status === "coming-soon" ? "Coming Soon" : "Add to Bag";
    quickView.classList.add("is-open");
    quickView.setAttribute("aria-hidden", "false");
    quickView.inert = false;
    document.body.classList.add("shop-quick-open");
    quickView.querySelector(".shop-quick-close").focus();
  });
  quickView.querySelector(".shop-quick-add").addEventListener("click", () => {
    const productToAdd = quickProduct;
    const variantToAdd = quickVariant.value;
    closeQuickView();
    if (productToAdd)
      window.kinboniAddProductToCart(productToAdd, variantToAdd);
  });
  quickView.querySelector(".shop-quick-close").addEventListener("click", closeQuickView);
  quickView.addEventListener("click", (event) => {
    if (event.target === quickView) closeQuickView();
  });
  quickView.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      quickView.querySelectorAll(
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
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && quickView.classList.contains("is-open"))
      closeQuickView();
  });
}
