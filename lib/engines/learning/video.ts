import type { ParsedVideo } from "@/lib/engines/learning/types";

export function parseVideoUrl(videoUrl: string | null): ParsedVideo | null {
  if (!videoUrl) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(videoUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.replace("/", "");
    return id ? { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` } : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v") ?? url.pathname.split("/").filter(Boolean).at(-1);
    return id ? { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` } : null;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).at(-1);
    return id ? { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${id}` } : null;
  }

  return { provider: "external", url: videoUrl };
}
