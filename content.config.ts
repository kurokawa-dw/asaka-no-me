// content.config.ts
import { defineContentConfig, defineCollection } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    events: defineCollection({
      type: "page",
      source: "events/*.md", // content/events/*.md を対象にする
    }),
  },
});
