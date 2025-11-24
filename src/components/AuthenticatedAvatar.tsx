"use client";

import Image from "next/image";
import { useAuthenticatedImage } from "@/lib/image-utils";

interface AuthenticatedAvatarProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function AuthenticatedAvatar({
  src,
  alt,
  width = 64,
  height = 64,
  className = "",
}: AuthenticatedAvatarProps) {
  const { imageSrc, isLoading } = useAuthenticatedImage(src);

  return (
    <div className="relative" style={{ width, height }}>
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-full">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
