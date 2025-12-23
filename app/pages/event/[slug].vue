<script setup lang="ts">
import "~/assets/scss/pages/event/style.scss";
import { SITE_INFO } from "~/constants/siteInfo";

const route = useRoute();

const slugFromStem = (stem?: string) => {
  // stem: 'events/event-a' → 'event-a'
  if (!stem) return "";
  const parts = stem.split("/");
  return parts[parts.length - 1] ?? "";
};

const slugFromId = (id?: string) => {
  // id: 'events/events/event-a.md' → 'event-a'
  if (!id) return "";
  const base = id.split("/").pop() ?? "";
  return base.replace(/\.(md|mdx|yml|yaml|json)$/i, "");
};

const getDocSlug = (doc: any): string => {
  const meta = doc?.meta ?? {};
  return String(
    meta.slug ?? slugFromStem(doc.stem) ?? slugFromId(doc.id) ?? doc.slug ?? ""
  ).trim();
};

// events コレクションから全部取得して slug 一致を探す
const { data: rawDocs } = await useAsyncData("event-detail", () =>
  queryCollection("events").all()
);

// その slug に一致する doc を探す（重複してたら dev でエラー）
const eventDoc = computed<any | null>(() => {
  const docs = rawDocs.value ?? [];
  const target = String(route.params.slug ?? "").trim();

  const matches = docs.filter((doc: any) => getDocSlug(doc) === target);

  if (process.dev && matches.length > 1) {
    // slug 重複は危険なので dev で止める（useEventCalendarでも止まる想定）
    throw new Error(
      `[event/[slug]] slug "${target}" が複数存在します: ${matches
        .map((d: any) => d.id ?? d.stem ?? d.title)
        .join(" / ")}`
    );
  }

  return matches[0] ?? null;
});

const hasBody = computed(() => {
  const v = eventDoc.value?.body?.value;
  if (!Array.isArray(v)) return false;

  // 配列要素の中に「実質的に何かある」ものが1つでもあれば true
  const hasMeaningful = (node: any): boolean => {
    if (node == null) return false;
    if (typeof node === "string") return node.trim().length > 0;
    if (Array.isArray(node)) return node.some(hasMeaningful);
    if (typeof node === "object") {
      // 万一 object が混ざってても拾えるように
      if (typeof node.value === "string" && node.value.trim()) return true;
      if (Array.isArray((node as any).children))
        return (node as any).children.some(hasMeaningful);
    }
    return false;
  };

  return v.some(hasMeaningful);
});

// watchEffect(() => {
//   if (eventDoc.value) {
//     console.log("body:", eventDoc.value.body);
//   }
// });

// 404
if (!eventDoc.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "イベントが見つかりません",
  });
}

// 日付表示（見た目用）
const formatDisplayDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${y}年 ${m}月${day}日（${w}）`;
};

const imgRef = ref<HTMLImageElement | null>(null);
const imgPortrait = ref(false);

const readSize = () => {
  const img = imgRef.value;
  if (!img) return;
  console.log(img.naturalWidth, img.naturalHeight);
  if (img.naturalWidth < img.naturalHeight) {
    imgPortrait.value = true;
  }
};

const onLoad = () => {
  readSize();
};

const onError = () => {
  console.warn("image load error");
};

onMounted(() => {
  const img = imgRef.value;
  if (!img) return;

  // すでに読み込み済み（キャッシュ等）だと @load を取り逃すことがある
  // ただし complete=true でも失敗してる可能性があるので naturalWidth も見るのが安全
  if (img.complete && img.naturalWidth > 0) {
    readSize();
  }
});

// console.log(eventDoc.value);
// console.log(eventDoc.value.meta.endDate);

// if (eventDoc.value.meta.startDate === eventDoc.value.meta.endDate) {
//   console.log("同じ");
// } else {
//   console.log("違う");
// }

useSeoHead({
  title: eventDoc.value.title,
  type: "article",
});
</script>

<template>
  <div class="event-page">
    <article v-if="eventDoc" class="event-detail">
      <header class="hero">
        <div v-if="eventDoc.meta?.heroImage" class="hero__image">
          <div class="inner">
            <img
              ref="imgRef"
              :src="eventDoc.meta.heroImage"
              :alt="eventDoc.title"
              :class="{ 'is-portrait': imgPortrait }"
              @load="onLoad"
              @error="onError"
            />
          </div>
        </div>
        <div v-else class="hero__image fallback">
          <div class="inner">
            <img src="/images/event/event-fallback-img.jpg" alt="あさかの目" />
          </div>
        </div>

        <ul v-if="eventDoc.meta?.tags?.length" class="hero__tags">
          <li v-for="tag in eventDoc.meta.tags" :key="tag">#{{ tag }}</li>
        </ul>

        <div class="hero__text">
          <h1 class="hero__title">
            {{ eventDoc.title }}
          </h1>

          <!-- <p v-if="eventDoc.meta?.subtitle" class="event-detail__subtitle">
            {{ eventDoc.meta.subtitle }}
          </p> -->
          <dl class="hero__data">
            <div v-if="eventDoc.meta?.startDate" class="hero__data__item date">
              <dt>🕒日時</dt>
              <dd>
                <p class="hero__data__day">
                  <span> {{ formatDisplayDate(eventDoc.meta.startDate) }}</span>
                  <span v-if="eventDoc.meta.startDate !== eventDoc.meta.endDate"
                    >〜 {{ formatDisplayDate(eventDoc.meta.endDate) }}
                  </span>
                </p>
                <p v-if="eventDoc.meta?.openingTime" class="hero__data__time">
                  {{ eventDoc.meta.openingTime }}
                </p>
              </dd>
            </div>

            <div v-if="eventDoc.meta?.placeName" class="hero__data__item place">
              <dt>📍場所</dt>
              <dd>
                <p class="preline">{{ eventDoc.meta?.placeName }}</p>
              </dd>
            </div>

            <div v-if="eventDoc.meta?.fee" class="hero__data__item fee">
              <dt>💰参加費</dt>
              <dd>{{ eventDoc.meta?.fee }}</dd>
            </div>

            <div
              v-if="eventDoc.meta?.reservation"
              class="hero__data__item reserve"
            >
              <dt>📮予約</dt>
              <dd>{{ eventDoc.meta?.reservation }}</dd>
            </div>

            <div v-if="eventDoc.meta?.note" class="hero__data__item note">
              <dt>📝備考</dt>
              <dd>{{ eventDoc.meta?.note }}</dd>
            </div>

            <div
              v-if="eventDoc.meta?.officialUrl"
              class="hero__data__item official-url"
            >
              <dt>💻公式サイト</dt>
              <dd>
                <a
                  class="u-link-underline word-break"
                  :href="eventDoc.meta?.officialUrl"
                  target="_blank"
                  >{{ eventDoc.meta?.officialUrlLabel }}</a
                >
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <p v-if="eventDoc.meta?.summary" class="event-detail__summary preline">
        {{ eventDoc.meta.summary }}
      </p>

      <section v-if="hasBody" class="event-detail__section">
        <div class="inner">
          <h2 class="event-detail__section__ttl">イベント詳細</h2>
          <div class="event-detail__section__detail">
            <ContentRenderer :value="eventDoc" />
          </div>
        </div>
      </section>
    </article>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";

.preline {
  white-space: pre-line;
}
.word-break {
  word-break: break-all;
}

.event-detail {
  .hero {
    @include pc {
      width: rem($pcBaseW);
      margin-inline: auto;
    }
    @include sp {
      padding: 0 rem(20);
    }
    &__image {
      // width: 100%;
      margin: 0 auto rem(4 * 10);
      position: relative;
      border: 1px solid #000;
      @include pc {
        width: max-content;
        max-width: 100%;
        border-radius: rem(25);
        padding: rem(8);
      }
      @include tab {
        max-width: 100%;
        // width: 100%;
        // min-width: max-content;
      }
      @include sp {
        border-radius: rem(12);
        padding: rem(3);
      }

      .inner {
        position: relative;
        overflow: hidden;
        @include pc {
          border-radius: rem(15);
        }
        @include sp {
          border-radius: rem(10);
        }
      }
      img {
        display: block;
        // max-width: 100%;
        // min-width: 80%;
        margin-inline: auto;
        // border-radius: rem(15);
        @include pc {
          width: max-content;
          max-height: rem(500);
        }
        @include tab {
          max-width: 100%;
          max-height: initial;
        }
      }

      &.fallback {
        .inner {
          aspect-ratio: 1024 / 300;
          &::after {
            content: "";
            display: block;
            width: 100%;
            height: 100%;
            // background-color: #fff;
            position: absolute;
            top: 0;
            left: 0;
            backdrop-filter: blur(20px);
          }
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }

    &__tags {
      display: flex;
      gap: rem(8);
      margin-bottom: rem(34);

      li {
        border: 1px solid #000;
        width: fit-content;
        border-radius: rem(5);
        font-weight: 700;
        @include pc {
          padding: rem(6) rem(20);
          font-size: rem(12);
        }
        @include sp {
          padding: rem(3) rem(10);
          font-size: rem(10);
        }
      }
    }

    // &__text {
    //   @include sp {
    //     // padding: 0 rem(20);
    //   }
    // }

    &__title {
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: rem(34);
      @include pc {
        font-size: rem(30);
      }
      @include sp {
        font-size: rem(24);
        line-height: 1.5;
      }
    }

    &__data {
      &__item {
        display: grid;
        grid-template-columns: rem(140) 1fr;
        gap: rem(20);
        font-weight: 700;
        border-top: 1px solid var(--c-border);
        padding: rem(24) 0;
        @include pc {
          grid-template-columns: rem(140) 1fr;
        }
        @include sp {
          grid-template-columns: rem(100) 1fr;
        }
        &:last-child {
          border-bottom: 1px solid var(--c-border);
        }
      }
      dt {
        border-right: 1px solid var(--c-border);
      }
    }
  }

  // &__subtitle {
  //   font-weight: 700;
  // }

  // &__section {
  //   margin-top: rem(100);
  //   @include sp {
  //     padding: 0 rem(20);
  //   }
  // }

  &__summary {
    font-weight: 700;
    line-height: 1.8;
    @include pc {
      width: rem($pcBaseW);
      margin-top: rem(80);
      margin-inline: auto;
      font-size: rem(18);
    }
    @include sp {
      margin-top: rem(40);
      padding: 0 rem(20);
    }
  }

  &__section {
    // background-color: #f7ffc2;
    @include pc {
      padding-block: rem(80);
      margin-top: rem(80);
    }
    @include sp {
      padding-block: rem(40);
      margin-top: rem(40);
    }

    .inner {
      @include pc {
        width: rem($pcBaseW);
        margin-inline: auto;
      }
      @include sp {
        padding: 0 rem(20);
      }
    }
  }
}
</style>
