import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { getCurrentUser } from "../session";
import { decodeDraft, draftHeader, type StorefrontDraft } from "../storefront-draft";

// The unsaved storefront the Theme and brand preview asked for. Only an admin's request gets it; anyone
// else sees the published store.
export const getPreviewDraft = cache(async (): Promise<StorefrontDraft | null> => {
  const draft = decodeDraft((await headers()).get(draftHeader));
  if (!draft) return null;
  return (await getCurrentUser())?.isAdmin ? draft : null;
});
