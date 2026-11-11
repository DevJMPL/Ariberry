import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { STORE } from "@/lib/config";

// Imagen que aparece al compartir la página principal en Facebook o WhatsApp.
export const alt = `${STORE.name}: ${STORE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const svg = await readFile(join(process.cwd(), "public/brand/logo.svg"));
  const logo = `data:image/svg+xml;base64,${svg.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f7f4f9",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={logo} width={860} height={226} alt="" />
          <div style={{ fontSize: 46, marginTop: 36, color: "#34174f" }}>{STORE.tagline}</div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "30px 0",
            background: "#5c2d80",
            color: "#fff",
            fontSize: 34,
          }}
        >
          {`Pide por WhatsApp. Entregas en ${STORE.deliveryZone}`}
        </div>
      </div>
    ),
    size,
  );
}
