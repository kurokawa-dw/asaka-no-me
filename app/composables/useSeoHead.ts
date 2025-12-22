import { joinURL, withoutTrailingSlash, withTrailingSlash } from "ufo";
import { SITE_INFO } from "~/constants/siteInfo";

type UseSeoHeadInput = {
  title?: string; // titleChunk（ページ固有）
  description?: string;
  image?: string; // 絶対URLでも /images/... でもOKにする
  type?: "website" | "article";
  noindex?: boolean;
};

export const useSeoHead = (input: UseSeoHeadInput) => {
  const route = useRoute();
  const config = useRuntimeConfig();

  const siteUrl = withoutTrailingSlash(config.public.siteUrl);

  const canonical = computed(() =>
    joinURL(siteUrl, withTrailingSlash(route.path))
  );

  const fullTitle = computed(() =>
    input.title ? `${input.title} | ${SITE_INFO.siteName}` : SITE_INFO.siteName
  );

  const ogImage = computed(() => {
    if (!input.image) return undefined;
    // すでに絶対URLならそのまま
    if (/^https?:\/\//.test(input.image)) return input.image;
    // 相対なら siteUrl と結合
    return joinURL(
      siteUrl,
      input.image.startsWith("/") ? input.image : `/${input.image}`
    );
  });

  useHead(() => {
    const meta = [
      {
        name: "description",
        content: input.description ?? SITE_INFO.discription,
      },
      {
        property: "og:description",
        content: input.description ?? SITE_INFO.discription,
      },
      { property: "og:url", content: canonical.value },
      { property: "og:title", content: fullTitle.value },
      { property: "og:type", content: input.type ?? "website" },
      { property: "og:image", content: ogImage.value ?? SITE_INFO.ogp },
      { name: "twitter:card", content: "summary_large_image" },
    ] as Array<Record<string, string>>;

    if (input.noindex) {
      meta.push({ name: "robots", content: "noindex,nofollow" });
    }

    return {
      title: input.title, // titleChunk
      // titleTemplate は plugin 側でもいいし、ここに置いてもOK
      titleTemplate: (chunk?: string) =>
        chunk ? `${chunk} | ${SITE_INFO.siteName}` : SITE_INFO.siteName,

      link: [{ rel: "canonical", href: canonical.value }],
      meta,
    };
  });
};
