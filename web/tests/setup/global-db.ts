import { MongoMemoryServer } from "mongodb-memory-server";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    mongoUri: string;
  }
}

// Starts one in-memory MongoDB before any test file runs and stops it at the end
export default async function setup(project: TestProject) {
  // Generous launch timeout: the first start of a freshly downloaded binary can be slow
  const server = await MongoMemoryServer.create({ instance: { launchTimeout: 60_000 } });
  project.provide("mongoUri", server.getUri());
  return async () => {
    await server.stop();
  };
}
