import { expect, type Locator, type Page } from "@playwright/test";

// The seeded demo accounts (local demo data only)
export const demoPassword = "Demo-Pass-123!";
export const admin = { email: "admin@example.test", password: demoPassword };

// A new address for each test, so tests never see each other's accounts or emails
export function uniqueEmail(who: string): string {
  return `${who}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
}

export const shippingAddress = { name: "Robin Example", line1: "2 Palette Road", city: "Austin", state: "Texas", zip: "78701" };

// Adds the first product that's in stock to the bag, from the shop, and returns its name
export async function addSomethingToBag(page: Page): Promise<string> {
  await page.goto("/products?inStock=1");
  const add = page.getByRole("button", { name: /^Add .+ to bag$/ }).first();
  const name = (await add.getAttribute("aria-label"))!.replace(/^Add (.+) to bag$/, "$1");
  await add.click();
  await expect(page.getByRole("dialog", { name: /Your bag/ })).toBeVisible();
  return name;
}

// Fills the shipping address fields of whichever form is on the page
export async function fillAddress(page: Page) {
  await page.getByLabel("Full name").fill(shippingAddress.name);
  await page.getByLabel("Street address").fill(shippingAddress.line1);
  await page.getByLabel("City").fill(shippingAddress.city);
  await page.getByRole("combobox", { name: "State" }).click();
  await page.getByRole("option", { name: shippingAddress.state, exact: true }).click();
  await page.getByLabel("ZIP code").fill(shippingAddress.zip);
}

// Pays on the payment step with Stripe's test card, and waits for the confirmation page
export async function payWithTestCard(page: Page) {
  const card = page.frameLocator('iframe[title*="Secure payment"]').first();
  await card.locator('input[name="number"]').fill("4242424242424242", { timeout: 60_000 });
  await card.locator('input[name="expiry"]').fill("12 / 34");
  await card.locator('input[name="cvc"]').fill("123");
  const zip = card.locator('input[name="postalCode"]');
  if (await zip.count()) await zip.fill(shippingAddress.zip);

  const pay = page.getByRole("button", { name: /^Pay \$/ });
  await pay.scrollIntoViewIfNeeded();
  await whenSettled(pay);
  await pay.click();
  await page.waitForURL(/\/ordersuccess/, { timeout: 60_000 });
  await expect(page.getByRole("heading", { name: "Thank you! Your order is confirmed." })).toBeVisible({ timeout: 60_000 });
}

// The order number on the confirmation page
export async function confirmedOrderNumber(page: Page): Promise<string> {
  const text = await page.getByText(/^Order #/).first().innerText();
  return text.match(/#([2-9A-Z]{8})/)![1];
}

// A guest's order, through the storefront: bag, details, payment. Ends on the confirmation page.
export async function placeGuestOrder(page: Page): Promise<{ email: string; orderNumber: string; product: string }> {
  const email = uniqueEmail("guest");
  const product = await addSomethingToBag(page);
  await page.getByRole("dialog", { name: /Your bag/ }).getByRole("link", { name: "Check out" }).click();
  await expect(page).toHaveURL(/\/address$/);

  await emailField(page).fill(email);
  await fillAddress(page);
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await payWithTestCard(page);

  return { email, orderNumber: await confirmedOrderNumber(page), product };
}

// A new account, signed in. Returns to `callbackUrl` when given.
export async function signUp(page: Page, email: string, password = newPassword) {
  if (!page.url().includes("/sign-up")) await page.goto("/sign-up");
  await page.getByLabel("Username").fill(`e2e-${Date.now()}`);
  await emailField(page).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL((url) => url.pathname !== "/sign-up");
}

export const newPassword = "Paint-Brush-2026!";

export async function signIn(page: Page, { email, password }: { email: string; password: string }) {
  await page.goto("/sign-in");
  await emailField(page).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL((url) => url.pathname !== "/sign-in");
}

// The page's own email field. The footer's newsletter form has one too, and the sign-up form's newsletter
// checkbox mentions email.
export function emailField(page: Page): Locator {
  return page.getByRole("main").getByLabel("Email", { exact: true });
}

// Stripe's Link box can open under the card once the card is complete, which moves the Pay button. This
// waits until the button has stayed put for a moment.
async function whenSettled(target: Locator) {
  let last: number | undefined;
  await expect
    .poll(
      async () => {
        const top = (await target.boundingBox())?.y;
        const settled = top !== undefined && top === last;
        last = top;
        return settled;
      },
      { intervals: [750], timeout: 15_000 },
    )
    .toBe(true);
}
