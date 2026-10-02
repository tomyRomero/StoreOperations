import path from "node:path";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { emailTo, linkIn } from "./support/mail";
import { admin, placeGuestOrder, signIn, uniqueEmail } from "./support/store";

// The console in its own browser context, so the shopper's session and the admin's never mix
async function adminPage(browser: Browser): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await signIn(page, admin);
  return page;
}

test("the admin ships a guest's order and the guest gets the tracking", async ({ page, browser }) => {
  const { email, orderNumber } = await placeGuestOrder(page);
  const adminTab = await adminPage(browser);

  await adminTab.goto(`/admin/orders/${orderNumber}`);
  await expect(adminTab.getByText("Guest", { exact: true }).first()).toBeVisible();
  await adminTab.getByRole("combobox", { name: "Status" }).click();
  await adminTab.getByRole("option", { name: "Shipped" }).click();
  await adminTab.getByRole("combobox", { name: "Carrier" }).click();
  await adminTab.getByRole("option", { name: "UPS" }).click();
  await adminTab.getByLabel("Tracking number").fill("1Z999AA10123456784");
  const notify = adminTab.getByRole("switch", { name: "Email the customer about this change" });
  if ((await notify.getAttribute("aria-checked")) !== "true") await notify.click();
  await adminTab.getByRole("button", { name: "Save changes" }).click();
  await expect(adminTab.getByText("Order updated").first()).toBeVisible();

  const update = await emailTo(email, /^Your order is on its way/);
  await page.goto(linkIn(update.text, /^\/orders\//));
  await expect(page.getByRole("heading", { name: `Order #${orderNumber}` })).toBeVisible();
  await expect(page.getByText("1Z999AA10123456784")).toBeVisible();
});

test("the admin adds a product with a photo, and it's in the store", async ({ page, browser }) => {
  const adminTab = await adminPage(browser);
  const name = `Test easel ${Date.now()}`;

  await adminTab.goto("/admin/products/new");
  await adminTab.getByLabel("Name").fill(name);
  await adminTab.getByLabel("Description").fill("A sturdy tabletop easel, added by an end-to-end test.");
  await adminTab.getByRole("combobox", { name: "Category" }).click();
  await adminTab.getByRole("option").first().click();
  await adminTab.getByLabel("Price").fill("12.50");
  await adminTab.getByLabel("Stock").fill("5");
  await adminTab.getByLabel("Photo: choose image").setInputFiles(path.join(__dirname, "../../../api/StoreOps.Api/Data/SeedImages/products/finebrush.png"));
  // Uploaded as soon as it's chosen; the control then offers to replace it
  await expect(adminTab.getByLabel("Photo: replace image")).toBeAttached({ timeout: 30_000 });
  await adminTab.getByRole("button", { name: "Add product" }).click();
  await expect(adminTab.getByText(`${name} added to the store`).first()).toBeVisible();

  await page.goto(`/products?q=${encodeURIComponent(name)}`);
  await expect(page.getByRole("link", { name }).first()).toBeVisible();

  // Archived again, so test products don't pile up in the demo store
  await adminTab.getByRole("button", { name: /^Archive/ }).first().click();
  await adminTab.getByRole("alertdialog").getByRole("button", { name: "Archive" }).click();
  await expect(adminTab.getByText(`${name} archived`).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole("link", { name })).toHaveCount(0);
});

test("a shopper subscribes, and the admin's newsletter reaches them", async ({ page, browser }) => {
  const subscriber = uniqueEmail("reader");
  await page.goto("/about");
  const footer = page.getByRole("contentinfo");
  await footer.getByLabel("Email", { exact: true }).fill(subscriber);
  await footer.getByRole("button", { name: "Subscribe" }).click();
  await expect(footer.getByText("You're subscribed")).toBeVisible();
  await emailTo(subscriber, /^You're subscribed/);

  const adminTab = await adminPage(browser);
  const subject = `Studio news ${Date.now()}`;
  await adminTab.goto("/admin/newsletter");
  await adminTab.getByLabel("Subject").fill(subject);
  await adminTab.getByLabel("Message").fill("New brushes are in.\n\nSee you in the shop.");
  await adminTab.getByRole("button", { name: /^Send to \d+ subscribers?$/ }).click();
  await adminTab.getByRole("alertdialog").getByRole("button", { name: "Send newsletter" }).click();
  await expect(adminTab.getByText("Newsletter on its way").first()).toBeVisible();

  const newsletter = await emailTo(subscriber, new RegExp(`^${subject}$`));
  expect(newsletter.text).toContain("New brushes are in.");
  expect(linkIn(newsletter.text, /^\/unsubscribe\//)).toMatch(/^\/unsubscribe\/\w+/);
});
