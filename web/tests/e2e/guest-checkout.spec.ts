import { expect, test } from "@playwright/test";
import { emailTo, linkIn } from "./support/mail";
import { emailField, placeGuestOrder, signUp } from "./support/store";

test("a guest buys without an account and gets back to the order", async ({ page }) => {
  const { email, orderNumber, product } = await placeGuestOrder(page);
  await expect(page.getByText(`A confirmation is on its way to ${email}`)).toBeVisible();

  await test.step("the confirmation links to the order's private page", async () => {
    await page.getByRole("link", { name: "Track your order" }).click();
    await expect(page).toHaveURL(/\/orders\/[0-9a-f]{48}$/);
    await expect(page.getByRole("heading", { name: `Order #${orderNumber}` })).toBeVisible();
    await expect(page.getByText(product).first()).toBeVisible();
  });
  const orderPage = new URL(page.url()).pathname;

  await test.step("so does the confirmation email", async () => {
    const confirmation = await emailTo(email, /^Order confirmation/);
    expect(linkIn(confirmation.text, /^\/orders\//)).toBe(orderPage);
  });

  await test.step("Find your order emails the link again", async () => {
    await page.goto("/orders/find");
    await emailField(page).fill(email);
    await page.getByLabel("Order number").fill(orderNumber.toLowerCase());
    await page.getByRole("button", { name: "Email me the link" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();

    const reminder = await emailTo(email, new RegExp(`order ${orderNumber}$`));
    expect(linkIn(reminder.text, /^\/orders\//)).toBe(orderPage);
  });
});

test("a guest keeps the order by creating an account with the same email", async ({ page }) => {
  const { email, orderNumber } = await placeGuestOrder(page);
  await page.getByRole("link", { name: "Track your order" }).click();
  await expect(page).toHaveURL(/\/orders\/[0-9a-f]{48}$/);
  const orderPage = new URL(page.url()).pathname;

  await page.getByRole("link", { name: "Create an account" }).click();
  await expect(emailField(page)).toHaveValue(email);
  await signUp(page, email);

  // Back on the order, now signed in
  await expect(page).toHaveURL(orderPage);
  await page.getByRole("button", { name: "Save to my account" }).click();
  await expect(page).toHaveURL(`/account/orders/${orderNumber}`);
  await expect(page.getByRole("heading", { name: `Order #${orderNumber}` })).toBeVisible();
});
