import * as z from "zod";

// The API's rules for a new password (ASP.NET Core Identity, set in the API's AuthServiceCollectionExtensions).
// The form checks them first so people see every problem at once; the API still decides.
export const newPassword = z
  .string()
  .min(9, "Use at least 9 characters.")
  .max(128, "Use at most 128 characters.")
  .regex(/[A-Z]/, "Add at least one capital letter.")
  .regex(/[0-9]/, "Add at least one number.")
  .regex(/[^A-Za-z0-9]/, "Add at least one symbol, such as ! or -.");
