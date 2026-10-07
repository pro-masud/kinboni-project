const siteShell = document.querySelector("[data-site-shell]");

if (siteShell) {
  siteShell.insertAdjacentHTML(
    "beforebegin",
    `
      <div class="announcement-bar">
        <p>Kinboni Bangladesh · Delivery and payment information</p>
      </div>
      <header class="site-header" id="site-header">
        <div class="container header-inner">
          <a href="index.html" class="brand" aria-label="Kinboni home">
            <span class="brand-mark">K</span><span class="brand-name">KINBONI</span>
          </a>
          <nav class="main-nav" aria-label="Main navigation">
            <a href="shop.html">Shop</a>
            <a href="new-arrivals.html">New Arrivals</a>
            <a href="coming-soon.html">Coming Soon</a>
            <a href="totes.html">Totes</a>
            <a href="shoulder-bags.html">Shoulder Bags</a>
            <a href="crossbody.html">Crossbody</a>
            <a href="mini-bags.html">Mini Bags</a>
            <a href="work-bags.html">Work Bags</a>
            <a href="about.html">About</a>
          </nav>
          <div class="header-right">
            <div class="header-actions">
              <button class="icon-button search-toggle" type="button" aria-label="Search">
                <i class="fa-solid fa-magnifying-glass"></i>
              </button>
              <button class="icon-button wishlist-toggle" type="button" aria-label="Wishlist">
                <i class="fa-regular fa-heart"></i>
              </button>
              <button class="icon-button cart-button" type="button" aria-label="Shopping bag">
                <i class="fa-solid fa-bag-shopping"></i><span class="cart-count" hidden>0</span>
              </button>
            </div>
            <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">
              <i class="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>
      </header>
      <nav class="mobile-menu" aria-label="Mobile navigation" aria-hidden="true" inert>
        <div class="mobile-menu-panel">
          <div class="mobile-menu-top">
            <span>Explore Kinboni</span>
            <button class="mobile-menu-close" type="button" aria-label="Close menu">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="mobile-menu-utilities">
            <button class="mobile-menu-tool search-toggle" type="button" aria-label="Search">
              <i class="fa-solid fa-magnifying-glass"></i><span>Search</span>
            </button>
            <button class="mobile-menu-tool wishlist-toggle" type="button" aria-label="Wishlist">
              <i class="fa-regular fa-heart"></i><span>Wishlist</span>
            </button>
          </div>
          <div class="mobile-menu-links">
            <a href="shop.html">Shop</a><a href="new-arrivals.html">New Arrivals</a>
            <a href="coming-soon.html">Coming Soon</a><a href="totes.html">Totes</a>
            <a href="shoulder-bags.html">Shoulder Bags</a><a href="crossbody.html">Crossbody</a>
            <a href="mini-bags.html">Mini Bags</a><a href="work-bags.html">Work Bags</a>
            <a href="about.html">About</a>
          </div>
        </div>
      </nav>
      <div class="search-panel" role="dialog" aria-modal="true" aria-label="Search Kinboni Bags" aria-hidden="true" inert>
        <form class="search-form">
          <label for="site-search">Search Kinboni Bags</label>
          <div>
            <input id="site-search" type="search" placeholder="Search totes, crossbody, mini bags..." />
            <button type="submit" aria-label="Submit search"><i class="fa-solid fa-arrow-right"></i></button>
          </div>
          <p class="search-status" aria-live="polite"></p>
        </form>
        <button class="search-close" type="button" aria-label="Close search">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `,
  );
  document.querySelector("main")?.insertAdjacentHTML(
    "afterend",
    `
      <footer class="site-footer">
        <div class="container footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="brand" aria-label="Kinboni home">
              <span class="brand-mark">K</span><span class="brand-name">KINBONI</span>
            </a>
            <p>Bags for the way you carry your day.</p>
            <div class="socials" data-social-container aria-label="Social media links"></div>
          </div>
          <div><h4>Shop</h4><ul>
            <li><a href="shop.html">All Bags</a></li><li><a href="new-arrivals.html">New Arrivals</a></li>
            <li><a href="totes.html">Totes</a></li><li><a href="shoulder-bags.html">Shoulder Bags</a></li>
            <li><a href="crossbody.html">Crossbody</a></li><li><a href="mini-bags.html">Mini Bags</a></li>
            <li><a href="work-bags.html">Work Bags</a></li>
          </ul></div>
          <div><h4>Customer Care</h4><ul>
            <li><a href="contact.html">Contact</a></li><li><a href="faq.html">FAQ</a></li>
            <li><a href="delivery-payment.html">Delivery &amp; Payment</a></li>
            <li><a href="returns-exchange.html">Returns &amp; Exchange</a></li>
          </ul></div>
          <div><h4>Contact</h4><ul>
            <li><a data-config-href="contact.phone" data-config-prefix="tel:" data-config-empty="Phone details to be added"></a></li>
            <li><a data-config-href="contact.email" data-config-prefix="mailto:" data-config-empty="Email details to be added"></a></li>
            <li><a href="privacy-policy.html">Privacy Policy</a></li><li><a href="terms.html">Terms</a></li>
          </ul></div>
        </div>
        <div class="container footer-bottom">
          <p>© <span data-current-year></span> Kinboni.</p>
          <div class="footer-legal">
            <a href="privacy-policy.html">Privacy Policy</a>
            <a href="terms.html">Terms</a>
            <a href="returns-exchange.html">Returns</a>
          </div>
        </div>
      </footer>
      <aside class="cart-drawer" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="cart-title" inert>
        <div class="cart-drawer-head"><h2 id="cart-title">Your Bag</h2>
          <button class="cart-close" type="button" aria-label="Close bag"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="cart-items" aria-live="polite"></div>
        <p class="cart-empty">Your bag is empty.</p>
        <button class="button button-primary cart-checkout" type="button">Checkout</button>
      </aside>
      <aside class="wishlist-drawer cart-drawer" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="wishlist-title" inert>
        <div class="cart-drawer-head"><h2 id="wishlist-title">Your Wishlist</h2>
          <button class="wishlist-close cart-close" type="button" aria-label="Close wishlist"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="wishlist-items cart-items" aria-live="polite"></div>
        <p class="wishlist-empty cart-empty">Save a product to see it here.</p>
      </aside>
    `,
  );

  const year = siteShell.parentElement.querySelector("[data-current-year]");
  if (year) year.textContent = String(new Date().getFullYear());
  siteShell.remove();
}
