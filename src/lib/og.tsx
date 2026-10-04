import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { PUBLIC_DIR } from "@/lib/content/load";

/**
 * Social preview cards (1200×630). Real project imagery when available,
 * branded type on top. Fonts are read from disk at build time.
 */

export const OG_SIZE = { width: 1200, height: 630 };

const fontDir = path.join(process.cwd(), "src", "assets", "fonts");
const fonts = Promise.all([
  readFile(path.join(fontDir, "Archivo-Bold.woff")),
  readFile(path.join(fontDir, "Archivo-Regular.woff")),
  readFile(path.join(fontDir, "JetBrainsMono-Regular.woff")),
]);

const INK = "#08080a";
const FG = "#ece9e2";
const MUTED = "#a09d95";
const ACCENT = "#ffa463";

export async function renderOgImage({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** A /public path (.jpg/.png) or an https URL. */
  image?: string | null;
}) {
  const [bold, regular, mono] = await fonts;
  const background = image ? await toImageSrc(image) : null;
  title = ogText(title);
  subtitle = subtitle && ogText(subtitle);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: INK, position: "relative" }}>
        {background && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={background}
            alt=""
            width={1200}
            height={630}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            // Satori renders gradients from backgroundImage, not the background shorthand.
            backgroundColor: background ? "transparent" : INK,
            ...(background && {
              backgroundImage:
                "linear-gradient(to top, rgba(8,8,10,0.97) 0%, rgba(8,8,10,0.92) 40%, rgba(8,8,10,0.45) 75%, rgba(8,8,10,0.2) 100%)",
            }),
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "56px 64px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Mono", fontSize: 20, color: MUTED, letterSpacing: 2 }}>
            <span>{site.name.toUpperCase()}</span>
            <span>{new URL(site.url).host.toUpperCase()}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "Mono", fontSize: 22, color: ACCENT, letterSpacing: 2, marginBottom: 20 }}>
              {eyebrow.toUpperCase()}
            </span>
            <span
              style={{
                fontFamily: "Archivo",
                fontWeight: 700,
                fontSize: title.length > 28 ? 64 : 84,
                lineHeight: 1,
                letterSpacing: -2,
                color: FG,
                maxWidth: 1000,
              }}
            >
              {title}
            </span>
            {subtitle && (
              <span
                style={{ fontFamily: "Archivo", fontSize: 26, lineHeight: 1.35, color: MUTED, marginTop: 24, maxWidth: 960 }}
              >
                {subtitle.length > 140 ? `${subtitle.slice(0, 137)}…` : subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Archivo", data: bold, weight: 700, style: "normal" },
        { name: "Archivo", data: regular, weight: 400, style: "normal" },
        { name: "Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}

/**
 * The bundled fonts are Latin subsets; anything else would make Satori try
 * (and fail) to download a fallback font at build time.
 */
function ogText(text: string): string {
  return text.replace(/√/g, "sqrt ").replace(/[^\u0000-ɏ -⁯←-⇿]/g, "");
}

/** Satori needs PNG/JPEG; local files become data URLs, remote URLs pass through. */
async function toImageSrc(src: string): Promise<string | null> {
  if (src.startsWith("https://")) return src;
  const ext = path.extname(src).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : null;
  if (!mime) return null;
  try {
    const data = await readFile(path.join(PUBLIC_DIR, decodeURI(src)));
    return `data:${mime};base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
}
