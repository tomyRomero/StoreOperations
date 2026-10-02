"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Monitor, Moon, Smartphone, Sun } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage, type ApiProblem } from "@/lib/api/problems";
import type { AdminStorefront, StoreThemeName } from "@/lib/api/types";
import { accentFamily, contrast, isHexColor } from "@/lib/brand-colors";
import { homeSectionLabels } from "@/lib/storefront";
import { encodeDraft } from "@/lib/storefront-draft";
import { storeThemes } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { SwatchButton, ThemeSwatch, Toggle } from "./EditorControls";
import { FormSchema, formFieldFor, initialValues, pages, socialFields, swatches, toDraft, toRequest, type Values } from "./storefront-form";
import { StorefrontPreview } from "./StorefrontPreview";

// Theme and brand. The preview beside the form is the real storefront with the unsaved values, so
// every change can be seen before it's published.
export function StorefrontEditor({ storefront }: { storefront: AdminStorefront }) {
  const router = useRouter();
  const defaults = useMemo(() => initialValues(storefront), [storefront]);
  const form = useForm<Values>({ resolver: zodResolver(FormSchema), defaultValues: defaults });
  const values = useWatch({ control: form.control }) as Values;
  const [publishing, setPublishing] = useState(false);
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [page, setPage] = useState<string>("/");

  // The fields that differ from the published store
  const changed = (Object.keys(defaults) as (keyof Values)[]).filter((key) => JSON.stringify(values[key]) !== JSON.stringify(defaults[key]));

  // Typing settles for a moment before the preview reloads
  const draft = toDraft(values, mode);
  const address = `${page}?draft=${encodeDraft(page === "/about" ? draft : { ...draft, aboutText: null })}`;
  const [previewSrc, setPreviewSrc] = useState(address);
  useEffect(() => {
    const timer = setTimeout(() => setPreviewSrc(address), 450);
    return () => clearTimeout(timer);
  }, [address]);

  // Leaving with unpublished changes asks first
  const dirty = changed.length > 0;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const onSubmit = async (v: Values) => {
    setPublishing(true);
    const { data, error } = await api.PUT("/api/admin/storefront", { body: toRequest(v, storefront.rowVersion) });
    setPublishing(false);

    if (data) {
      toast({ variant: "success", title: "Published to the store", description: "Shoppers see the changes on their next page." });
      router.refresh();
      return;
    }
    if ((error as ApiProblem | undefined)?.code === "EDIT_CONFLICT") {
      toast({ variant: "destructive", title: "Someone else published changes", description: "Their version is loaded. Make your changes again." });
      router.refresh();
      return;
    }
    for (const [field, message] of Object.entries(fieldErrors(error))) {
      const name = formFieldFor[field] ?? field;
      if (name in v) form.setError(name as keyof Values, { message });
    }
    toast({ variant: "destructive", title: "Couldn't publish", description: problemMessage(error) });
  };

  const sections = values.sections ?? defaults.sections;
  const move = (index: number, by: -1 | 1) => {
    const next = [...sections];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    form.setValue("sections", next, { shouldDirty: true });
  };

  const theme = storeThemes[values.theme as StoreThemeName];
  const family = isHexColor(values.accentColor) ? accentFamily(values.accentColor, theme.surfaces) : null;
  const worst = (hex: string, surfaces: string[]) => Math.min(...surfaces.map((s) => contrast(hex, s))).toFixed(1);

  const fieldset = "grid gap-4 border-b py-6 last:border-b-0";
  const legend = "mb-1 text-[15px] font-semibold";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-1">
            <h1 className="font-sans text-[28px] font-semibold leading-tight tracking-[-0.03em]">Theme and brand</h1>
            <p className="text-muted-foreground">How the store looks and what it says. The preview shows every change before you publish it.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p role="status" className="mr-1 inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-ink-2">
              {dirty ? (
                <>
                  <span aria-hidden className="size-1.5 rounded-full bg-warning" />
                  {changed.length === 1 ? "1 unpublished change" : `${changed.length} unpublished changes`}
                </>
              ) : (
                <>
                  <Check className="size-3.5 text-success" aria-hidden />
                  Published
                </>
              )}
            </p>
            <Button type="button" variant="secondary" disabled={!dirty || publishing} onClick={() => form.reset(defaults)}>
              Discard
            </Button>
            <Button type="submit" loading={publishing} disabled={!dirty}>
              Publish to store
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-xl border bg-card px-5 sm:px-6">
            <fieldset className={fieldset}>
              <legend className={legend}>Theme</legend>
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-3">
                      {(Object.keys(storeThemes) as StoreThemeName[]).map((key) => {
                        const selected = field.value === key;
                        return (
                          <label key={key} className={cn("grid cursor-pointer gap-2 rounded-lg border p-2 transition-colors", selected ? "border-accent ring-1 ring-accent" : "hover:border-foreground/30")}>
                            <ThemeSwatch theme={key} />
                            <span className="flex items-center gap-2 text-sm font-semibold">
                              <input type="radio" name="theme" value={key} checked={selected} onChange={() => field.onChange(key)} className="accent-(--accent)" />
                              {storeThemes[key].label}
                            </span>
                            <span className="text-xs text-muted-foreground">{storeThemes[key].description}</span>
                          </label>
                        );
                      })}
                    </div>
                  </FormItem>
                )}
              />
            </fieldset>

            <fieldset className={fieldset}>
              <legend className={legend}>Logo and name</legend>
              <ImageUpload
                imageUrl={values.logoUrl}
                label="Logo"
                onUploaded={(key) => {
                  form.setValue("logoImageKey", key, { shouldDirty: true });
                  form.setValue("logoUrl", `/api/images/${key}`, { shouldDirty: true });
                }}
                onError={(message) => toast({ variant: "destructive", title: "Couldn't upload the logo", description: message })}
              />
              <p className="-mt-2 text-xs text-muted-foreground">A square mark works best. It also becomes the browser tab&apos;s icon.</p>
              {values.logoImageKey && (
                <Button
                  type="button"
                  variant="link"
                  className="-mt-2 w-fit text-sm"
                  onClick={() => {
                    form.setValue("logoImageKey", null, { shouldDirty: true });
                    form.setValue("logoUrl", null, { shouldDirty: true });
                  }}
                >
                  Use the theme&apos;s mark instead
                </Button>
              )}
              <TextField form={form} name="storeName" label="Store name" />
              <TextField form={form} name="tagline" label="Tagline (optional)" description="The About page's headline: a short line about what the store is for." />
              <TextField form={form} name="description" label="Description (optional)" description="Under the About headline, and what search engines show." multiline />
            </fieldset>

            <fieldset className={fieldset}>
              <legend className={legend}>Accent color</legend>
              <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Accent color">
                <SwatchButton label={`${theme.label}'s own`} selected={!values.accentColor} onSelect={() => form.setValue("accentColor", "", { shouldDirty: true })} />
                {swatches.map(([name, hex]) => (
                  <SwatchButton key={hex} label={name} hex={hex} selected={values.accentColor.toUpperCase() === hex} onSelect={() => form.setValue("accentColor", hex, { shouldDirty: true })} />
                ))}
              </div>
              <FormField
                control={form.control}
                name="accentColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Any color</FormLabel>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        aria-label="Pick a color"
                        value={isHexColor(field.value) ? field.value : "#5b3fd9"}
                        onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                        className="h-10 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
                      />
                      <FormControl>
                        <Input {...field} placeholder={`${theme.label}'s own`} className="font-mono uppercase" spellCheck={false} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {family ? (
                <div className="grid gap-2 rounded-lg bg-muted p-3 text-sm">
                  <p className="flex items-center gap-2">
                    <span aria-hidden className="size-4 rounded-sm border" style={{ background: family.accent.light }} />
                    On light pages links use <span className="font-mono">{family.accent.light}</span>, {worst(family.accent.light, theme.surfaces.light)} : 1
                  </p>
                  <p className="flex items-center gap-2">
                    <span aria-hidden className="size-4 rounded-sm border" style={{ background: family.accent.dark }} />
                    On dark pages, <span className="font-mono">{family.accent.dark}</span>, {worst(family.accent.dark, theme.surfaces.dark)} : 1
                  </p>
                  <p className="text-muted-foreground">StoreOps keeps the color&apos;s hue and adjusts its shade until text in it is easy to read, in both modes.</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">The theme&apos;s own accent, already checked for contrast in both modes.</p>
              )}
            </fieldset>

            <fieldset className={fieldset}>
              <legend className={legend}>Home page</legend>
              <TextField form={form} name="heroHeadline" label="Headline (optional)" description="Without one, the store's name." />
              <TextField form={form} name="heroHighlight" label="Second line (optional)" description="Set in the accent, under the headline." />
              <TextField form={form} name="heroText" label="Line under it (optional)" description="The shipping promise follows it." multiline />
              <TextField form={form} name="heroButtonLabel" label="Button (optional)" description={`Without one, "Shop all ${values.productNounPlural || "products"}".`} />
              <div className="grid gap-2">
                <p id="rows-label" className="text-sm font-semibold">
                  Rows under the headline
                </p>
                <ul aria-labelledby="rows-label" className="grid gap-1.5">
                  {sections.map((section, i) => (
                    <li key={section.key} className="flex items-center gap-3 rounded-md border px-3 py-2">
                      <Switch
                        checked={section.on}
                        aria-label={`Show ${homeSectionLabels[section.key]}`}
                        onCheckedChange={(on) =>
                          form.setValue(
                            "sections",
                            sections.map((s) => (s.key === section.key ? { ...s, on } : s)),
                            { shouldDirty: true },
                          )
                        }
                      />
                      <span className={cn("flex-1 text-sm", !section.on && "text-muted-foreground")}>{homeSectionLabels[section.key]}</span>
                      <Button type="button" variant="ghost" size="icon-sm" disabled={i === 0} aria-label={`Move ${homeSectionLabels[section.key]} up`} onClick={() => move(i, -1)}>
                        <ArrowUp aria-hidden />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" disabled={i === sections.length - 1} aria-label={`Move ${homeSectionLabels[section.key]} down`} onClick={() => move(i, 1)}>
                        <ArrowDown aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </fieldset>

            <fieldset className={fieldset}>
              <legend className={legend}>What you sell</legend>
              <div className="grid grid-cols-2 gap-3">
                <TextField form={form} name="productNoun" label="One" />
                <TextField form={form} name="productNounPlural" label="Many" />
              </div>
              <p className="-mt-2 text-xs text-muted-foreground">
                As in &quot;1 {values.productNoun || "product"}&quot; and &quot;Search {values.productNounPlural || "products"}&quot; across the store.
              </p>
            </fieldset>

            <fieldset className={fieldset}>
              <legend className={legend}>Store pages</legend>
              <TextField form={form} name="aboutText" label="Your story (optional)" description="On the About page. Leave a blank line between paragraphs." multiline rows={6} />
              <TextField form={form} name="contactPhone" label="Phone (optional)" />
              <TextField form={form} name="contactAddress" label="Address (optional)" description="One line per line of the address." multiline />
              {socialFields.map(([name, label]) => (
                <TextField key={name} form={form} name={name} label={`${label} (optional)`} placeholder="https://" />
              ))}
            </fieldset>
          </div>

          <section aria-labelledby="preview-heading" className="grid min-w-0 grid-cols-1 content-start gap-3 xl:sticky xl:top-20 xl:self-start">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="preview-heading" className="sr-only">
                Preview
              </h2>
              <Toggle
                label="Preview size"
                value={device}
                onChange={setDevice}
                options={[
                  ["desktop", "Desktop", Monitor],
                  ["phone", "Phone", Smartphone],
                ]}
              />
              <Toggle
                label="Light or dark"
                value={mode}
                onChange={setMode}
                options={[
                  ["light", "Light", Sun],
                  ["dark", "Dark", Moon],
                ]}
              />
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Page</span>
                <select value={page} onChange={(event) => setPage(event.target.value)} className="h-9 rounded-md border border-input bg-card px-2 text-sm">
                  {pages.map(([path, label]) => (
                    <option key={path} value={path}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                <span aria-hidden className="size-1.5 rounded-full bg-success" />
                Updates as you type
              </p>
            </div>
            <StorefrontPreview src={previewSrc} device={device} />
          </section>
        </div>
      </form>
    </Form>
  );
}

type TextFieldProps = {
  form: ReturnType<typeof useForm<Values>>;
  name: "storeName" | "tagline" | "description" | "productNoun" | "productNounPlural" | "heroHeadline" | "heroHighlight" | "heroText" | "heroButtonLabel" | "aboutText" | "contactPhone" | "contactAddress" | (typeof socialFields)[number][0];
  label: string;
  description?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
};

function TextField({ form, name, label, description, placeholder, multiline, rows = 3 }: TextFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>{multiline ? <Textarea rows={rows} placeholder={placeholder} {...field} /> : <Input placeholder={placeholder} {...field} />}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
