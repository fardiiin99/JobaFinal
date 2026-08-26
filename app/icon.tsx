import { ImageResponse } from "next/og";

/* The legacy site had no favicon and no <link rel="icon">, so every
   page load 404'd for one and tabs showed the browser default. */

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e44c6b",
          color: "#fffdf7",
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
          borderRadius: 7,
        }}
      >
        J
      </div>
    ),
    size,
  );
}
