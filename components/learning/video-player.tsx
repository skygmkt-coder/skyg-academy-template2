import { ExternalLink } from "lucide-react";

import { parseVideoUrl } from "@/lib/engines/learning/video";

type VideoPlayerProps = {
  videoUrl: string | null;
  title: string;
};

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const video = parseVideoUrl(videoUrl);

  if (!video) {
    return (
      <div className="flex aspect-video items-center justify-center bg-slate-900 px-6 text-center text-sm text-slate-300">
        Esta leccion no tiene video configurado.
      </div>
    );
  }

  if (video.provider === "external") {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-slate-900 px-6 text-center">
        <p className="text-sm text-slate-300">Video externo</p>
        <a
          href={video.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Abrir video
          <ExternalLink aria-hidden className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <iframe
      title={title}
      src={video.embedUrl}
      className="aspect-video w-full bg-slate-900"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}
