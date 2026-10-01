"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Input } from "../ui/input";
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

// Uploads the chosen image straight away; the form then saves the key the API returns. The API names
// the file and checks that it really is a JPEG, PNG or WebP image of at most 5 MB.
const ImageUpload = ({ imageUrl, label, onUploaded, onError }: Props) => {
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
      <Image
        src={uploading ? "/assets/spinner.svg" : preview ?? "/assets/image.png"}
        alt={preview ? "The current image" : ""}
        width={96}
        height={96}
        className="aspect-square rounded-lg object-cover"
      />
      <div className="grid gap-1">
        <label htmlFor={inputId} className="text-sm font-medium">{label}</label>
        <Input
          id={inputId}
          type="file"
          accept={allowedTypes.join(",")}
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <p className="text-sm text-gray-500">JPEG, PNG or WebP, up to 5 MB.</p>
      </div>
    </div>
  );
};

export default ImageUpload;
