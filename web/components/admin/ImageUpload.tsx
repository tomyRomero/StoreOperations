"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage } from "@/lib/api/problems";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxBytes = 5 * 1024 * 1024;

type Props = {
  // The image already saved, if any
  imageUrl: string | null;
  label: string;
  onUploaded: (key: string) => void;
  onError: (message: string) => void;
};

// Uploads as soon as a file is chosen; the form then saves the key the API returns
export function ImageUpload({ imageUrl, label, onUploaded, onError }: Props) {
  const [preview, setPreview] = useState(imageUrl);
  const [uploading, setUploading] = useState(false);
  const inputId = useId();

  const upload = async (file: File) => {
    // The API checks both too; checking here first gives a clear message without sending 5 MB for nothing
    if (!allowedTypes.includes(file.type)) return onError("Use a JPEG, PNG or WebP image.");
    if (file.size > maxBytes) return onError("Images can be up to 5 MB.");

    setUploading(true);
    const { data, error } = await api.POST("/api/admin/images", {
      body: {},
      bodySerializer: () => {
        const form = new FormData();
        form.append("file", file);
        return form;
      },
    });
    setUploading(false);

    if (!data) {
      onError(fieldErrors(error).file ?? problemMessage(error));
      return;
    }
    setPreview(data.url);
    onUploaded(data.key);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {preview ? (
          <Image src={preview} alt="The chosen image" fill sizes="96px" className="object-cover" />
        ) : (
          <ImagePlus className="size-6 text-muted-foreground" aria-hidden />
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-card/70">
            <LoaderCircle className="size-6 animate-spin" aria-hidden />
            <span className="sr-only">Uploading</span>
          </span>
        )}
      </div>
      <div className="grid gap-1.5">
        <span className="text-sm font-semibold">{label}</span>
        {/* The real file input, styled as a button through its label */}
        <input
          id={inputId}
          type="file"
          // Says what the image is for, and still contains the button's visible words
          aria-label={`${label}: ${preview ? "replace image" : "choose image"}`}
          accept={allowedTypes.join(",")}
          disabled={uploading}
          className="peer sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
        <label
          htmlFor={inputId}
          className="inline-flex h-9 w-fit cursor-pointer items-center rounded-md border-[1.5px] border-foreground px-3 text-sm font-semibold transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring peer-disabled:cursor-not-allowed peer-disabled:opacity-60 hover:bg-muted"
        >
          {preview ? "Replace image" : "Choose image"}
        </label>
        <p className="text-xs text-muted-foreground">JPEG, PNG or WebP, up to 5 MB</p>
      </div>
    </div>
  );
}
