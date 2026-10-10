"use client";

import Image, { type ImageProps } from "next/image";
import { imageLoader } from "@/lib/image-loader";

/**
 * next/image with the storage-aware loader. A loader is a function, so
 * it can only be attached on the client; server components render this
 * instead of next/image directly.
 */
export default function AppImage(props: ImageProps) {
  // eslint-disable-next-line jsx-a11y/alt-text -- alt is part of props
  return <Image loader={imageLoader} {...props} />;
}
