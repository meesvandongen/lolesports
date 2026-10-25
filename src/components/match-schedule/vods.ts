import type { Vod } from "@/api/types";

/**
 * The VOD to offer first: one in the viewer's language, else English, else
 * whatever there is. `languages` is in order of preference, like
 * `navigator.languages`.
 */
export function preferredVod(vods: Vod[], languages: readonly string[]): Vod | undefined {
  const playable = vods.filter((vod) => vodUrl(vod) !== undefined);
  const wanted = [...languages, "en-US", "en-GB", "en"];
  for (const language of wanted) {
    const exact = playable.find((vod) => vod.locale.toLowerCase() === language.toLowerCase());
    if (exact) return exact;
    const prefix = language.split("-")[0].toLowerCase();
    const sameLanguage = playable.find((vod) => vod.locale.toLowerCase().startsWith(`${prefix}-`));
    if (sameLanguage) return sameLanguage;
  }
  return playable[0];
}

/** A link that starts the video where the game starts. */
export function vodUrl(vod: Vod) {
  const seconds = Math.max(0, Math.floor((vod.startMillis ?? 0) / 1000));
  switch (vod.provider) {
    case "youtube":
      return `https://www.youtube.com/watch?v=${encodeURIComponent(vod.parameter)}${seconds > 0 ? `&t=${seconds}s` : ""}`;
    case "twitch": {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `https://www.twitch.tv/videos/${encodeURIComponent(vod.parameter)}?t=${hours}h${minutes}m${seconds % 60}s`;
    }
    default:
      return undefined;
  }
}

/** Game length in minutes, from where the game starts and ends in the video. */
export function gameMinutes(vods: Vod[]) {
  const timed = vods.find((vod) => vod.startMillis !== undefined && vod.endMillis !== undefined);
  return timed ? Math.round((timed.endMillis! - timed.startMillis!) / 60000) : undefined;
}

export function languageName(vod: Vod) {
  return vod.mediaLocale?.englishName ?? vod.locale;
}
