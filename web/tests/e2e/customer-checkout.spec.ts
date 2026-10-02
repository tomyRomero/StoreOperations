import { expect, test } from "@playwright/test";
import { emailTo, linkIn } from "./support/mail";
import { addSomethingToBag, confirmedOrderNumber, fillAddress, payWithTestCard, signUp, uniqueEmail } from "./support/store";

test("a new customer signs up, checks out and finds the order in their account", async ({ page }) => {
  const email = uniqueEmail("customer");
  await signUp(page, email);
  const product = await addSomethingToBag(page);

  await test.step("a first order asks for an address, then payment", async () => {
    await page.getByRole("dialog", { name: /Your bag/ }).getByRole("link", { name: "Check out" }).click();
    // No saved address yet, so checkout starts with one
    await expect(page).toHaveURL(/\/address$/);
    await fillAddress(page);
    await page.getByRole("button", { name: "Save and continue to payment" }).click();
    await expect(page).toHaveURL(/\/checkout\?address=\d+$/);
    await payWithTestCard(page);
  });
  const orderNumber = await confirmedOrderNumber(page);
  await expect(page.getByText(`A confirmation is on its way to ${email}`)).toBeVisible();

  await test.step("the order is in the account", async () => {
    await page.getByRole("link", { name: "Track your order" }).click();
    await expect(page).toHaveURL(`/account/orders/${orderNumber}`);
    await expect(page.getByText(product).first()).toBeVisible();

    await page.goto("/account/orders");
    await expect(page.getByText(`#${orderNumber}`)).toBeVisible();
  });

  await test.step("and the confirmation email links to it", async () => {
    const confirmation = await emailTo(email, /^Order confirmation/);
    expect(linkIn(confirmation.text, /^\/account\/orders\//)).toBe(`/account/orders/${orderNumber}`);
  });
});
