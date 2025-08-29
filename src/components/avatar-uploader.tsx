"use client";

import { useRef, useState, ChangeEvent } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  src?: string | null;
  alt?: string;
  onUploaded?: (url: string) => void;
};

export default function AvatarUploader({ src, alt = "Profile image", onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(src ?? null);
  const [isUploading, setIsUploading] = useState(false);

  const onPick = () => {
    inputRef.current?.click();
  };

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setIsUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/dashboard/upload", {
        method: "POST",
        body: form,
      });

      const data = (await res.json()) as { success: boolean; url?: string; error?: string };
      if (!data.success || !data.url) {
        throw new Error(data.error || "Upload failed");
      }

      setPreview(data.url);
      onUploaded?.(data.url);
      toast.success("Profile image updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
      setPreview(src ?? null);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onPick}
        className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border/50 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Change profile image"
        disabled={isUploading}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-sm text-muted-foreground">Add</div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/30 grid place-items-center text-white text-xs">Uploading…</div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
      <Button type="button" variant="outline" onClick={onPick} disabled={isUploading}>
        Change
      </Button>
    </div>
  );
}


