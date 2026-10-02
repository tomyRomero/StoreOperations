# StoreOps

StoreOps is an online store platform: a storefront for customers and a console for the people who run the store. Each store runs its own copy, with its own name, look, words, settings, catalog and payments, all set from the console. **Palettehub**, a small art-supply shop, is the demo store you see in the screenshots. It exists only as seed data: nothing about it is written into the storefront or the console.

It is built as a production-style system rather than a template: a Next.js storefront and console, a .NET API with SQL Server, real Stripe payments (in test mode), transactional email, and tests that run in CI.

| Storefront, dark | Storefront, light |
| --- | --- |
| ![Palettehub home page in dark mode](docs/screenshots/home-dark.jpg) | ![Palettehub home page in light mode](docs/screenshots/home-light.jpg) |

## What it does

**For shoppers**

- Browse by category, filter by price and stock, sort, and search from anywhere with ⌘K.
- Product pages with sale prices, stock levels and the shipping and returns rules of the store.
- A bag that remembers itself before you sign in and tells you how far you are from free shipping.
- Checkout in two steps, with or without an account: an address (and an email, for a guest), then pay with Stripe. Sales tax is worked out for the address by Stripe Tax before you pay.
- A guest gets a private link to their order in every email about it, can have the link sent again from Find your order, and can keep the order by creating an account with the same email.
- An account with every order and where it is (placed, shipped with tracking, delivered), Buy again on past orders, saved addresses, and password changes. A forgotten password can be reset by email.
- Sign-up says how strong a new password really is ("Password1!" meets the rules and is still weak), and offers the newsletter.
- Light and dark mode, following the device until the shopper picks one.

**For the store (the StoreOps console)**

- Theme and brand: pick a theme (Night Studio or Atelier), upload a logo, choose an accent color, write the home page's headline and turn its rows on, off and around, name what the store sells ("supplies"), and fill in the About story, phone, address and social links. A live preview beside the form shows the real store with the changes, on desktop or phone, light or dark, before anything is published.
- Home: sales over 7, 30 or 90 days against the period before, orders to ship, products running low, best sellers.
- Orders: search and filter, update status with a carrier and tracking number (the customer is emailed), cancel or refund in full through Stripe.
- Products and categories: prices, stock, deals, photos, archiving.
- Customers: their orders and addresses, disabling an account, granting the admin role.
- Newsletter, an activity feed of everything that changed, and store settings: support email, flat shipping, free-shipping threshold, returns policy, time zone and whether guests can check out. The storefront reads all of it, so a change in the console shows up on the site without a release.

## Screenshots

### Shopping

| Shop | Product | Search |
| --- | --- | --- |
| ![The shop with filters](docs/screenshots/shop-dark.jpg) | ![A product page](docs/screenshots/product-dark.jpg) | ![The search palette](docs/screenshots/search-dark.jpg) |

### Bag, checkout and confirmation

| Bag | Payment | Confirmation |
| --- | --- | --- |
| ![The bag with a free-shipping meter](docs/screenshots/bag-light.jpg) | ![The payment step with Stripe's Payment Element](docs/screenshots/checkout-light.jpg) | ![The order confirmation](docs/screenshots/confirmation-light.jpg) |

### Account

| Overview | Order tracking |
| --- | --- |
| ![The account overview with the latest order](docs/screenshots/account-dark.jpg) | ![An order's tracking page](docs/screenshots/order-tracking-dark.jpg) |

### On a phone

| Home | Product | Bag |
| --- | --- | --- |
| ![Home on a phone](docs/screenshots/phone-home-dark.jpg) | ![A product on a phone](docs/screenshots/phone-product-dark.jpg) | ![The bag on a phone](docs/screenshots/phone-bag-light.jpg) |

### Making it your store

Theme and brand in the console: the theme switched to Atelier and the accent to ultramarine, not yet published, with the real store previewed beside the form.

![The Theme and brand page with a live preview of the store](docs/screenshots/console-theme-light.jpg)

| Atelier, light | Atelier, dark |
| --- | --- |
| ![The demo store in the Atelier theme, light](docs/screenshots/atelier-home-light.jpg) | ![The demo store in the Atelier theme, dark](docs/screenshots/atelier-home-dark.jpg) |

### The StoreOps console

| Home, light | Home, dark |
| --- | --- |
| ![The console home in light mode](docs/screenshots/console-home-light.jpg) | ![The console home in dark mode](docs/screenshots/console-home-dark.jpg) |

| Orders | Editing a product |
| --- | --- |
| ![The console's orders](docs/screenshots/console-orders-light.jpg) | ![Editing a product with its deal](docs/screenshots/console-product-light.jpg) |

## How it's built

```mermaid
flowchart LR
    Browser -->|pages| Web["Next.js 16<br/>storefront and console"]
    Browser -->|"/api/* (same origin)"| Web
    Web -->|"rewrites /api/*,<br/>server components call it too"| API[".NET 10 API"]
    API --> SQL[("SQL Server")]
    API --> Images[("S3-compatible storage<br/>(Cloudflare R2)")]
    API -->|"PaymentIntents, Stripe Tax, refunds"| Stripe
    Stripe -->|webhooks| API
    API -->|"email outbox → SMTP"| Mail[Email]
```

| Layer | Technology |
| --- | --- |
| Web | Next.js 16 (App Router, React 19, Server Components), TypeScript, Tailwind CSS 4, Radix UI, react-hook-form with Zod, openapi-fetch with types generated from the API's OpenAPI contract |
| API | ASP.NET Core 10 controllers, EF Core 10 with SQL Server, ASP.NET Core Identity (cookie sessions), Stripe.net, MailKit with Razor email templates, S3 SDK for images |
| Tests | xUnit with Testcontainers (a real SQL Server and an S3 mock per run), Vitest, Playwright for end-to-end tests |
| Local stack | Docker Compose: SQL Server 2025, S3Mock, Mailpit |
| CI | GitHub Actions: web lint, typecheck, unit tests and build; API formatting check, build and tests |

### Decisions worth knowing

- **One origin, no tokens in JavaScript.** The browser only talks to the Next.js site, which forwards `/api/*` to the API. The API's session cookie is HttpOnly and SameSite=Lax, so it never touches client code and needs no cross-site setup.
- **The server owns every amount.** At checkout the API prices the bag, adds shipping and asks Stripe Tax for the tax, then creates one PaymentIntent for that quote. The order is created only when Stripe's webhook confirms the payment. If anything changed in between (a product sold out), the payment is refunded automatically and the customer is told why. Stock can never go negative.
- **Guest checkout without guest accounts.** A guest's checkout is theirs through a random key in an HttpOnly cookie, so going back to change the address updates the same quote and PaymentIntent. Their order gets a long random link that only its emails carry. Find your order emails that link to the order's own address and answers the same whether or not anything matched, and an order moves into an account only for an account with the order's email, holding the link.
- **Emails are never lost or sent by mistake.** An email is written to an outbox table in the same database transaction as the change that caused it, then sent and retried by a background worker.
- **Security by default.** Every endpoint needs a signed-in user unless marked otherwise, and admin endpoints need the admin role. Sign-in, sign-up and the public forms are rate limited. Repeated wrong passwords lock the account for a while. Sign-in answers a wrong password and an unknown email the same way and in the same time, and password reset answers the same whether or not the email has an account. Password reset links are single-use, expire in an hour and sign out every session. The API refuses to start with live Stripe keys.
- **Money in whole cents, history kept.** Prices and totals are integers in cents. Orders keep their status history, and an activity log records who changed what in the console.
- **A design system in tokens.** Colors, fonts, field sizes and button shapes are CSS variables with light and dark values. The storefront's themes (the violet "Night Studio" and the paper-and-serif "Atelier") and the console (StoreOps cobalt, compact controls) share the same components and differ only by tokens.
- **Any brand color stays readable.** A store picks one accent color. StoreOps keeps its hue and adjusts only its lightness (in OKLCH) until text in it passes WCAG contrast on that theme's pages, in light and dark mode, and builds the glows and tints around it. The console shows the shades it will use and their contrast ratios.
- **The preview is the real store.** The console's preview frame loads the actual storefront with the unsaved values in its address; the server applies them only for an admin, after validating them. There is no second copy of the pages to drift out of date.
- **Accessible on purpose.** The target is WCAG 2.2 AA. During the redesign each page was checked with axe in light and dark mode on desktop and phone, contrast was measured rather than eyeballed, and search, menus and forms work by keyboard and screen reader.

### Data model

```mermaid
erDiagram
    USER ||--o{ USER_ADDRESS : saves
    USER ||--o{ CART_ITEM : "has in bag"
    USER |o--o{ CHECKOUT : starts
    USER |o--o{ ORDER : places
    CATEGORY ||--o{ PRODUCT : groups
    PRODUCT ||--o{ CART_ITEM : ""
    CHECKOUT ||--|{ CHECKOUT_LINE : quotes
    ORDER ||--|{ ORDER_LINE : contains
    ORDER ||--|{ ORDER_STATUS_CHANGE : "moves through"
    PRODUCT ||--o{ ORDER_LINE : ""
```

A checkout is the priced quote behind one Stripe PaymentIntent; the webhook turns it into an order, matched by that PaymentIntent (unique, so a retried webhook can't create a second order). Checkouts and orders belong to an account or to a guest, and the database refuses an order that neither an account nor a private link can reach. Alongside these: store settings (one row), the activity log, newsletter subscribers, the email outbox, and the keys that encrypt session cookies. The schema is created and changed by EF Core migrations.

## Running it locally

You need Docker, the .NET 10 SDK and Node.js 24. For payments, a Stripe account in test mode (with Stripe Tax turned on) and the Stripe CLI.

1. **Start the database, image storage and mail catcher.**

   ```bash
   cp .env.example .env   # then set STOREOPS_SQL_PASSWORD
   docker compose up -d   # SQL Server on 14330, S3Mock on 9090, Mailpit on http://localhost:8025
   ```

2. **Configure and seed the API.** Secrets stay out of the repository, in .NET user secrets:

   ```bash
   cd api
   dotnet user-secrets set "ConnectionStrings:Database" \
     "Server=localhost,14330;Database=Palettehub;User Id=sa;Password=<your password>;TrustServerCertificate=True" \
     --project StoreOps.Api
   dotnet user-secrets set "Stripe:SecretKey" "sk_test_..." --project StoreOps.Api
   dotnet user-secrets set "Stripe:WebhookSecret" "whsec_..." --project StoreOps.Api

   dotnet run --project StoreOps.Api -- seed                 # creates the demo store
   dotnet run --project StoreOps.Api --launch-profile http   # http://localhost:5200
   ```

   The seed rebuilds the database from scratch. To keep your data after pulling a change to the schema, run `dotnet ef database update --project StoreOps.Api` instead.

   In another terminal, forward Stripe's webhooks to it. Without this, a paid order waits on "processing" forever. `stripe listen` prints the webhook signing secret: it's the `whsec_...` that goes in `Stripe:WebhookSecret` above, and it stays the same each time.

   ```bash
   stripe login   # once
   stripe listen --forward-to localhost:5200/api/stripe/webhook
   ```

3. **Start the web app.**

   ```bash
   cd web
   cp .env.example .env.local   # then set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   npm ci
   npm run dev                  # http://localhost:3200
   ```

The seed creates two accounts, `customer@example.test` and `admin@example.test`, both with the password `Demo-Pass-123!` (local demo data only). Pay with Stripe's test card `4242 4242 4242 4242`, any future date and any three digits. Every email the store sends shows up in Mailpit.

## Tests

```bash
cd api && dotnet format --verify-no-changes && dotnet test    # formatting, then integration tests against a real SQL Server in a container
cd web && npm run lint && npm run typecheck && npm test        # ESLint, TypeScript and Vitest
```

The end-to-end tests drive the whole store in Chromium: a guest's checkout and getting back to the order, a new customer's checkout, keeping a guest order in a new account, an admin shipping an order (the guest gets the tracking by email), a password reset from the emailed link, adding a product with a photo, and a newsletter reaching a new subscriber. They pay with Stripe's test card and read the emails in Mailpit, so start the store first as in [Running it locally](#running-it-locally), with the webhook relay, then:

```bash
cd web
npx playwright install chromium   # once
npm run e2e
```

The API tests run each feature through HTTP against a real database: checkout and webhooks (with a fake Stripe), refunds, the email outbox, rate limits and lockouts, the rules the database enforces on its own, a check over every route the app has that admin routes need an admin and only a short list is open to visitors, and a check that the web app's copy of the API contract is up to date. CI runs both suites on every push.

## Project layout

```text
api/
  StoreOps.Api/         the API, one folder per feature (Auth, Catalog, Cart, Checkouts, Orders, Emails, ...)
  StoreOps.Api.Tests/   integration tests
web/
  app/                  routes: (root) storefront, (checkout), (auth) sign-in, (admin) the console
  components/           UI by feature, plus the shared ui/ primitives
  lib/                  API client and types, data loading, formatting and other small tested helpers
docs/screenshots/       the images above
docker-compose.yml      the local stack
```

## Contact

For inquiries or further information, please contact me at tomyfletcher99@hotmail.com, or reach out to me at [![LinkedIn](https://img.shields.io/badge/-LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/tomy-romero-902476145/)
