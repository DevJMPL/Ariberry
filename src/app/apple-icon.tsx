import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Ícono que usa el iPhone si alguien agrega la tienda a su pantalla de inicio.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const svg = await readFile(join(process.cwd(), "public/brand/logo-icono.svg"));
  const icon = `data:image/svg+xml;base64,${svg.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <img src={icon} width={140} height={140} alt="" />
      </div>
    ),
    size,
  );
}
