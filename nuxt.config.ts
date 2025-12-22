import fg from "fast-glob";
import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import { SITE_INFO } from "./app/constants/siteInfo";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  devServer: {
    host: "0.0.0.0", // 例: 固定したいなら '192.168.1.23'
    port: 3000,
    // https: { key: 'path/to/key.pem', cert: 'path/to/cert.pem' } // HTTPSにしたい場合
  },
  modules: [
    // "@nuxtjs/google-fonts",
    "@nuxt/content",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "nuxt-svgo",
  ],

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/"], // 念のため
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "ja",
        prefix: "og: https://ogp.me/ns#",
      },
      charset: "utf-8",
      viewport: "width=device-width",
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&family=Zen+Maru+Gothic:wght@400;700&display=swap",
        },
      ],
    },
  },

  css: [
    "@/assets/css/var.css", // その上に自分のベース（任意）
    "@/assets/scss/main.scss", // その上に自分のベース（任意）
  ],
  // googleFonts: {
  //   families: {
  //     "Noto Serif JP": { wght: [400, 500, 600, 700] },
  //     "Zen Maru Gothic": { wght: [400, 700] },
  //   },
  //   display: "swap",
  //   download: false, // ← これを明示（ローカル生成をやめる）
  // },

  tailwindcss: {
    cssPath: "@/assets/css/tailwind.css",
  },

  content: {
    renderer: {
      anchorLinks: false,
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: SITE_INFO.url,
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
