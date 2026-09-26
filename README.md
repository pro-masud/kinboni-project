# Kinboni Beauty

A polished, responsive, and interactive beauty e-commerce landing page for skincare, makeup, hair care, and beauty essentials.

## Project Goal

Kinboni is presented as a modern beauty brand where visitors can:

- Browse product categories
- Search for products
- Open a quick product view
- Create a wishlist
- Add products to a shopping bag
- Get recommendations through a beauty quiz
- Enjoy a smooth experience on mobile and desktop

## How The Project Was Built

### 1. Project Structure

The project is a lightweight static website. No build tool or framework is required, so the page can be opened directly through `index.html`.

```text
kinboni/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   └── styles.css
    ├── fonts/
    ├── images/
    ├── js/
    │   └── script.js
    └── video/
```

### 2. Semantic HTML Layout

The page is divided into meaningful sections in `index.html`:

- Announcement bar and sticky header
- Desktop and mobile navigation
- Hero banner and promotional slides
- Trust badges
- Featured categories
- Trending products
- Skin concerns
- New arrivals and best sellers
- Ingredients and daily routine sections
- Beauty quiz
- Brand story
- Testimonials
- Collections, benefits, and user-generated content
- FAQ and newsletter form
- Quick-view modal, quiz modal, and cart drawer

### 3. Brand-Focused Visual Design

The premium Kinboni beauty identity is defined in `styles.css` through:

- A soft blush, ivory, rose, and sage colour palette
- `Cormorant Garamond` for headings
- `Manrope` for body text
- Responsive spacing, typography, and layout
- Reusable CSS variables
- Rounded product cards and soft shadows
- Hover states, reveal animations, and a scroll-based header state
- Responsive breakpoints for desktop, tablet, and mobile

### 4. Hero Section and Slider

The hero section contains multiple promotional slides. Each slide includes:

- Campaign eyebrow text
- Large headline
- Supporting copy
- Primary and secondary CTAs
- Product image
- Product badge
- Brand promise metrics

Swiper powers the hero slider with autoplay, fade transitions, clickable pagination, keyboard controls, and accessibility support.
Each slide also selects its own background video. The first uses the local `assets/video/handbags-motion.mp4`; the other two use free Pexels clips, with the slide product image shown while a video loads.

### 5. Product Discovery Experience

The product sections make browsing easier with:

- Category-based product grouping
- Product image, title, rating, and price
- Wishlist button
- Add to Bag action
- Dynamically added Quick View button
- Responsive product carousel

Swiper is also used for category and testimonial carousels, providing mobile swipe support and multi-column desktop layouts.

### 6. Search Functionality

Clicking the search icon opens the search panel. On submit, JavaScript compares the query with the text content of every `.product-card` and:

- Shows matching products
- Hides non-matching products
- Displays the result count
- Shows a helpful message when no products match
- Restores all products when the query is empty

### 7. Mobile Navigation

The mobile hamburger menu is controlled with JavaScript and:

- Opens and closes the menu
- Changes the bars icon to a close icon
- Updates `aria-expanded` and `aria-hidden`
- Closes the menu when a navigation link is selected

### 8. Wishlist Functionality

Clicking a product heart button toggles its wishlist state. The selection is stored in browser `localStorage`, so it remains available after a page refresh.

### 9. Shopping Bag Interaction

The cart system supports:

- Adding an item from a product card
- Increasing quantity when the same product is added again
- Updating the cart count
- Showing a sticky confirmation message
- Opening a cart drawer with selected products
- Rendering product image, title, price, and quantity
- Showing an empty state when the cart has no items

Cart data currently lives in frontend memory; a backend and checkout system have not been connected yet.

### 10. Quick View and Beauty Quiz

The Quick View modal dynamically loads the product image and title from the product card. Selecting an option in the Beauty Quiz modal displays a result message for the selected concern.

### 11. Scroll Animations and Accessibility

`IntersectionObserver` triggers reveal animations when sections enter the viewport. Interactive elements also include:

- Accessible labels
- `aria-expanded`
- `aria-hidden`
- `aria-live`
- Keyboard-friendly slider controls

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Swiper.js
- Font Awesome
- Google Fonts
- Unsplash image URLs
- Browser `localStorage`

## How To Run

### Option 1: Direct Browser

1. Open the project folder.
2. Double-click `index.html`.
3. The Kinboni page will open in your browser.

### Option 2: VS Code Live Server

1. Install the **Live Server** extension in VS Code.
2. Open `index.html`.
3. Right-click and select **Open with Live Server**.

Live Server makes responsive testing and external asset loading easier to verify.

## External Dependencies

The following resources are loaded from CDNs:

- Google Fonts: Cormorant Garamond and Manrope
- Font Awesome 6.5.2
- Swiper 11
- Unsplash product and editorial images
- Pexels video backgrounds: [pink handbag](https://www.pexels.com/video/close-up-of-a-pink-bag-8798394/) and [orange handbag](https://www.pexels.com/video/a-video-of-an-orange-handbag-8798149/), under the [Pexels License](https://www.pexels.com/license/)

An internet connection may be required when the page is loaded for the first time.

## Testing Checklist

- [ ] Verify the desktop layout
- [ ] Verify the tablet layout
- [ ] Verify the mobile menu open and close behaviour
- [ ] Test matching and non-matching product searches
- [ ] Confirm that wishlist state remains after refresh
- [ ] Test Add to Bag and the cart drawer
- [ ] Confirm that the Quick View modal can be closed
- [ ] Test Beauty Quiz options and results
- [ ] Verify hero, category, and testimonial sliders
- [ ] Test keyboard navigation and visible focus states
- [ ] Verify fallback behaviour without internet access

## Future Improvements

- Connect a backend API and real product database
- Add user authentication and an account page
- Add persistent cart storage
- Add checkout and payment gateway integration
- Add product filtering, sorting, and pagination
- Connect a real newsletter subscription endpoint
- Reduce CDN dependency with local image and video assets
- Add automated accessibility and responsive browser testing

## Current Status

The responsive frontend and core shopping interactions are complete. Kinboni Beauty is currently a polished frontend prototype; backend, authentication, database, and payment integrations are the next steps for a production e-commerce experience.
