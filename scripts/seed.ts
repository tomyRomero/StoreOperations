// Fills the local database and image bucket with demo data: npm run seed
//
// It deletes everything in the database first, so it refuses to run unless
// both MongoDB and S3 point at local services (docker compose up -d).

import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getEnv } from "../lib/env";
import { assertLocal } from "./local-only";
import User from "../lib/models/user.model";
import Category from "../lib/models/category.model";
import Product from "../lib/models/product.model";
import Cart from "../lib/models/cart.model";
import Addresses from "../lib/models/addresses.model";
import Orders from "../lib/models/orders.model";
import Activity from "../lib/models/activity.model";
import Store from "../lib/models/store.model";

const DEMO_PASSWORD = "Demo-Pass-123!";

const categories = [
  { title: "Paint", photo: "seed/categories/paint.jpg", file: "categories/paint.jpg" },
  { title: "Brushes", photo: "seed/categories/brushes.jpg", file: "categories/brushes.jpg" },
  { title: "Canvas", photo: "seed/categories/canvas.jpg", file: "categories/canvas.jpg" },
];

// name, category, price, stock, image file, description, optional deal
type SeedProduct = [string, string, number, number, string, string, { oldPrice: number; dealDescription: string }?];

const products: SeedProduct[] = [
  ["Oil Paint Set", "Paint", 34.99, 12, "oilpaint.jpg", "Twelve artist-grade oil colors with rich pigment and a buttery consistency, ready for canvas or panel.", { oldPrice: 44.99, dealDescription: "Spring sale on oils" }],
  ["Chalk Paint", "Paint", 18.5, 0, "chalkpaint.jpg", "A matte, fast-drying chalk finish for furniture, frames and decor. No sanding or priming needed."],
  ["Watercolor Set", "Paint", 22, 30, "watercolorset.jpg", "Twenty-four half pans of vivid, easy-to-blend watercolors in a travel tin with a mixing lid."],
  ["Bucket Paint", "Paint", 45, 8, "bucketpaint.jpg", "One gallon of low-odor acrylic paint for murals and large studio projects."],
  ["Fine Brush", "Brushes", 6.99, 40, "finebrush.jpg", "A round synthetic brush with a sharp point for detail work and clean lines."],
  ["Super Fine Brush", "Brushes", 8.49, 4, "superfine.jpg", "An extra-fine liner brush for lettering, whiskers and the smallest details."],
  ["Wide Brush", "Brushes", 9.5, 25, "widebrush.jpg", "A two-inch flat brush for washes, backgrounds and smooth, even coats."],
  ["Brush Set", "Brushes", 24.99, 15, "brushset.jpg", "Ten brushes in rounds, flats and filberts, for oils, acrylics and watercolor.", { oldPrice: 29.99, dealDescription: "Save on the starter set" }],
  ["Paint Roller", "Brushes", 12, 9, "paintroller.jpg", "A nine-inch roller with a comfortable grip for walls and large surfaces."],
  ["Landscape Canvas", "Canvas", 29, 6, "landscapecanvas.jpg", "A wide, triple-primed cotton canvas stretched over a solid pine frame."],
  ["Rectangle Canvas", "Canvas", 19, 14, "rectanglecanvas.jpg", "A classic 16 by 20 inch primed canvas, ready for any medium."],
  ["Canvas Booklet", "Canvas", 11.25, 22, "canvasbooklet.jpg", "Ten primed canvas sheets bound in a pad, ideal for studies and practice."],
  ["Canvas Sign", "Canvas", 15, 3, "canvassign.jpg", "A small canvas panel with a hanging cord, made for lettering and gifts."],
];

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const productId = (name: string) => `prod_seed_${slug(name)}`;
const photoKey = (file: string) => `seed/products/${file}`;
const today = () => new Date().toISOString().slice(0, 10);

async function uploadImages(env: ReturnType<typeof getEnv>) {
  const client = new S3Client({
    region: env.AWS_REGION,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY },
  });
  const assets = path.join(process.cwd(), "public", "assets");
  const uploads = [
    ...categories.map((c) => ({ key: c.photo, file: c.file })),
    ...products.map((p) => ({ key: photoKey(p[4]), file: `products/${p[4]}` })),
  ];
  for (const { key, file } of uploads) {
    const body = await readFile(path.join(assets, file));
    await client.send(new PutObjectCommand({ Bucket: env.BUCKET_NAME, Key: key, Body: body, ContentType: "image/jpeg" }));
  }
  return uploads.length;
}

async function main() {
  loadEnvConfig(process.cwd());
  const env = getEnv();
  assertLocal("MONGODB_URL", env.MONGODB_URL);
  assertLocal("S3_ENDPOINT", env.S3_ENDPOINT);

  await mongoose.connect(env.MONGODB_URL);
  await mongoose.connection.dropDatabase();
  const models = [User, Category, Product, Cart, Addresses, Orders, Activity, Store];
  await Promise.all(models.map((model) => model.syncIndexes()));

  const imageCount = await uploadImages(env);

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [, customer] = await User.create([
    { email: "admin@example.test", username: "demo-admin", password, admin: true, stripeId: "cus_seed_admin" },
    { email: "customer@example.test", username: "demo-customer", password, admin: false, stripeId: "cus_seed_customer" },
  ]);

  await Category.create(categories.map(({ title, photo }) => ({ title, photo })));

  await Product.create(
    products.map(([name, category, price, stock, file, description, deal], i) => ({
      stripeProductId: productId(name),
      name,
      description,
      stock,
      price,
      category,
      photo: photoKey(file),
      createdAt: new Date(Date.now() - i * 60_000),
      ...(deal ? { deal: true, ...deal } : {}),
    }))
  );

  const address = {
    name: "Demo Customer",
    address: { line1: "1 Demo Street", line2: null, city: "Springfield", country: "US", postal_code: "12345", state: "IL" },
  };
  await Addresses.create({ user: customer._id, addresses: [{ address }] });
  await Cart.create({
    user: customer._id,
    products: [
      { product: productId("Watercolor Set"), quantity: 1 },
      { product: productId("Fine Brush"), quantity: 2 },
    ],
  });

  const orders = [
    { orderId: "seedOrder001", status: "Delivered", items: [["Brush Set", 1], ["Rectangle Canvas", 2]], daysAgo: 12, trackingNumber: "1Z999AA10123456784" },
    { orderId: "seedOrder002", status: "Shipped", items: [["Landscape Canvas", 1]], daysAgo: 3, trackingNumber: "1Z999AA10123456785" },
    { orderId: "seedOrder003", status: "Pending", items: [["Oil Paint Set", 1], ["Fine Brush", 3]], daysAgo: 0 },
  ] as const;

  await Orders.create(
    orders.map((order) => {
      const items = order.items.map(([name, quantity]) => {
        const [, , price, , file] = products.find((p) => p[0] === name)!;
        return { productId: productId(name), productName: name, productPrice: price.toFixed(2), productImage: photoKey(file), quantity };
      });
      const subtotal = items.reduce((sum, item) => sum + Number(item.productPrice) * item.quantity, 0);
      const createdAt = new Date(Date.now() - order.daysAgo * 86_400_000);
      return {
        orderId: order.orderId,
        user: customer._id,
        items,
        status: order.status,
        address,
        pricing: { subtotal: subtotal.toFixed(2), shipping: "10.00", taxAmount: "0.00", total: (subtotal + 10).toFixed(2), taxtId: "taxcalc_seed" },
        trackingNumber: "trackingNumber" in order ? order.trackingNumber : "",
        date: createdAt.toISOString().slice(0, 10),
        createdAt,
      };
    })
  );

  await Activity.create([
    { action: "user_created", timestamp: new Date(Date.now() - 3_600_000), details: { userId: customer._id.toString() }, date: today() },
    { action: "order_created", timestamp: new Date(Date.now() - 1_800_000), details: { orderId: "seedOrder003", user: customer._id.toString() }, date: today() },
    { action: "user_subscribed", timestamp: new Date(Date.now() - 600_000), details: { userEmail: "reader@example.test" }, date: today() },
  ]);
  await Store.create({ newsletter: ["reader@example.test", "customer@example.test"] });

  console.log(`Seeded ${products.length} products, ${categories.length} categories, ${orders.length} orders and ${imageCount} images.`);
  console.log(`Sign in with admin@example.test or customer@example.test, password ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
