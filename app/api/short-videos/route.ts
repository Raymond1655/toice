type Source = { channelId: string; channel: string; url: string };
const sources: Source[] = [
  {
    channelId: "UCHaHD477h-FeBbVh9Sh7syA",
    channel: "BBC Learning English",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCHaHD477h-FeBbVh9Sh7syA",
  },
  {
    channelId: "UCKyTokYo0nK2OA-az-sDijA",
    channel: "VOA Learning English",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCKyTokYo0nK2OA-az-sDijA",
  },
];

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();
}

function element(entry: string, tag: string) {
  const match = entry.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"),
  );
  return match?.[1] ? decodeXml(match[1]) : "";
}

async function readSource(source: Source) {
  const response = await fetch(source.url, {
    headers: { "User-Agent": "TOICE English learning recommendations" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Feed unavailable: ${source.channel}`);
  const xml = await response.text();
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)]
    .map((match) => {
      const entry = match[1];
      const id = element(entry, "yt:videoId");
      const title = element(entry, "title");
      const published = element(entry, "published");
      const description = element(entry, "media:description");
      const hasShortLabel = /#shorts\b|\bshorts\b/i.test(
        `${title} ${description}`,
      );
      if (!id || !title || !hasShortLabel) return null;
      const category = /pronunc|shadow|sound|accent/i.test(title)
        ? "發音跟讀"
        : /grammar|tense|preposition|idiom/i.test(title)
          ? "文法片語"
          : /listen|understand|hear|conversation/i.test(title)
            ? "聽力理解"
            : /what to say|how do we say|phrase|idiom|bottle of/i.test(title)
              ? "實用片語"
              : "情境字彙";
      return {
        id,
        title,
        description: description.slice(0, 260),
        channel: source.channel,
        channelUrl: `https://www.youtube.com/channel/${source.channelId}`,
        published,
        category,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${id}`,
      };
    })
    .filter((video): video is NonNullable<typeof video> => !!video);
}

export const dynamic = "force-dynamic";

export async function GET() {
  const results = await Promise.allSettled(sources.map(readSource));
  if (results.every((result) => result.status === "rejected")) {
    return Response.json(
      { videos: [], updatedAt: new Date().toISOString(), sources: [] },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  const videos = results
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published))
    .slice(0, 18);
  return Response.json(
    {
      videos,
      updatedAt: new Date().toISOString(),
      sources: sources.map(({ channel, channelId }) => ({
        channel,
        channelId,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
      },
    },
  );
}
