# Kinboni storefront

Kinboni is a responsive static storefront built with HTML, CSS, and vanilla JavaScript. No build step is required.

## Run locally

Open `index.html` through VS Code Live Server or another local HTTP server. Serving the site over HTTP is recommended for browser storage, product images, and page navigation.

## Main pages

- `index.html` — storefront home
- `shop.html` — catalog, filters, sorting, URL state, and 12-item pagination
- `product.html?id=<product-id>` — catalog-driven product detail page
- `shop-page-2.html` — compatibility redirect to Shop page 2
- `totes.html`, `shoulder-bags.html`, `crossbody.html`, `mini-bags.html`, `work-bags.html`, and `new-arrivals.html` — collection pages
- `coming-soon.html` — upcoming products
- `checkout.html`, `order-success.html`, and the customer-care pages — order preparation and support information

## Catalog and business configuration

`assets/js/products.js` is the shared product catalog. Product cards, search, cart, wishlist, quick view, and product detail pages use product IDs from this catalog.

`assets/js/config.js` is the shared brand and business configuration. Before launch, the business owner must provide:

- Confirmed BDT prices, stock, colors, materials, dimensions, care, and product photography
- Phone/WhatsApp, email, address, business hours, and social profiles
- Delivery fees, delivery estimates, payment availability, and merchant details
- Approved return, privacy, terms, warranty, and other customer-facing policies
- Order and newsletter endpoints, if submissions should reach a business system

Unconfirmed values remain blank or `null`. Prices and claims are not guessed; checkout will not submit an order while required commercial settings are missing.
The New Arrivals page stays empty until products are explicitly marked with `status: "new"` or the `new-arrival` tag in the catalog.

## Product photography

The local `assets/img/products/product-image-pending.svg` is an intentional placeholder until approved product photos are supplied. Replace each product image `src` in `assets/js/products.js` with the corresponding local image path, and retain a valid fallback where appropriate. The placeholder and `assets/img/favicon.svg` are local assets.

## Search, cart, and order behavior

- Cart and wishlist items persist in browser `localStorage`.
- Search covers the shared catalog.
- The Shop page renders the 14 currently catalogued bags, shows 12 per page, and stores filter/sort/page state in the URL.
- Product prices and operational policies are not yet confirmed. The cart can be explored, but checkout blocks orders until required settings are configured.
- Contact and newsletter forms require configured endpoints or contact channels; no success state is shown when a submission cannot be sent.

## Dependencies and validation

The site uses CDN-hosted Google Fonts, Font Awesome, and Swiper. An internet connection is needed for those external resources.

Useful checks:

```powershell
node --check assets\js\script.js
node --check assets\js\shop-catalog.js
node --check assets\js\product-page.js
node --check assets\js\products.js
git diff --check
```

## Deployment note

`assets/js/config.js` uses `https://kinboni.store` for canonical URLs, social metadata, and structured data. `sitemap.xml` lists the public storefront, collection, policy, and catalog product URLs; keep it in sync when those routes or product IDs change. Checkout and order-detail pages are excluded from search indexing.
