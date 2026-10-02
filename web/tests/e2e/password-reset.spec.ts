import { expect, test } from "@playwright/test";
import { emailTo, linkIn } from "./support/mail";
import { emailField, signIn, signUp, uniqueEmail } from "./support/store";

test("a customer who forgot their password chooses a new one from the emailed link", async ({ page, context }) => {
  const email = uniqueEmail("reset");
  await signUp(page, email);
  await context.clearCookies();

  await page.goto("/forgot-password");
  await emailField(page).fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();

  const reset = await emailTo(email, /^Reset your .+ password$/);
  await page.goto(linkIn(reset.text, /^\/reset-password$/));
  const chosen = "Fresh-Canvas-2027!";
  await page.getByLabel("New password", { exact: true }).fill(chosen);
  await page.getByLabel("New password, again").fill(chosen);
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(page.getByRole("heading", { name: "Password changed" })).toBeVisible();

  await signIn(page, { email, password: chosen });
  await page.goto("/account");
  await expect(page).toHaveURL("/account");
});
