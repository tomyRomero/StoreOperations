// Generates lib/api/schema.d.ts, the TypeScript types for every API endpoint, from the API's
// OpenAPI contract: npm run api:types
//
// With the API running (dotnet run in api/), it first downloads the contract into lib/api/openapi.json.
// With --offline it only regenerates the types from the committed copy, which is what CI checks.
// An API test fails when that copy is out of date, so a renamed field breaks a build, not a page.

import { readFile, writeFile } from "node:fs/promises";
import openapiTS, { astToString } from "openapi-typescript";

const contractPath = "lib/api/openapi.json";
const typesPath = "lib/api/schema.d.ts";

async function downloadContract(): Promise<unknown> {
  const apiUrl = process.env.API_URL ?? "http://localhost:5200";
  const response = await fetch(`${apiUrl}/openapi/v1.json`).catch(() => undefined);
  if (!response?.ok) {
    throw new Error(`Couldn't read the contract from ${apiUrl}/openapi/v1.json. Is the API running in Development?`);
  }
  const contract = await response.json();
  await writeFile(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  return contract;
}

async function main() {
  const offline = process.argv.includes("--offline");
  const contract = offline ? JSON.parse(await readFile(contractPath, "utf8")) : await downloadContract();

  const types = astToString(await openapiTS(contract));
  await writeFile(typesPath, `// Generated from openapi.json by npm run api:types. Don't edit it by hand.\n\n${types}`);
  console.log(`Wrote ${offline ? "" : `${contractPath} and `}${typesPath}`);
}

main().catch((error: Error) => {
  console.error(error.message);
  process.exit(1);
});
