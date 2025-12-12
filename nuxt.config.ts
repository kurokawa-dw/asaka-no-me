import fg from "fast-glob";
import { readFile } from "node:fs/promises";
import matter from "gray-matter";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/content"],

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/"], // 念のため
    },
  },

  hooks: {
    // Nitroの設定をビルド時に拡張
    async "nitro:config"(nitroConfig) {
      // イベントMDの場所（あなたの構成に合わせて）
      const files = await fg("content/events/**/*.md");

      const slugs: string[] = [];
      for (const file of files) {
        const raw = await readFile(file, "utf8");
        const { data } = matter(raw);

        // slugが無ければファイル名
        const fallback = file.split("/").pop()!.replace(/\.md$/, "");
        const slug = String(data.slug ?? fallback);

        slugs.push(slug);
      }

      // 重複slugチェック（超おすすめ）
      const dup = slugs.filter((s, i) => slugs.indexOf(s) !== i);
      if (dup.length) {
        console.warn(
          "[prerender] Duplicate slugs found:",
          Array.from(new Set(dup))
        );
        // 厳密にやるなら throw してビルド落としてもOK
        // throw new Error(`Duplicate slugs: ${Array.from(new Set(dup)).join(', ')}`)
      }

      const eventRoutes = Array.from(new Set(slugs)).map(
        (slug) => `/event/${slug}`
      );

      nitroConfig.prerender ||= {};
      nitroConfig.prerender.routes ||= [];
      nitroConfig.prerender.routes.push(...eventRoutes);
      nitroConfig.prerender.routes = Array.from(
        new Set(nitroConfig.prerender.routes)
      );
    },
  },
});
