// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/content"],

  nitro: {
    preset: "static", // nuxi generate で .output/public に静的ファイルを吐く
  },
});
