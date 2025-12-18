<script setup lang="ts">
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
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${m}/${day}（${w}）`;
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
</script>

<template>
  <article v-if="eventDoc" class="event-detail">
    <header class="event-detail__hero">
      <div v-if="eventDoc.meta?.heroImage" class="event-detail__hero__image">
        <img
          ref="imgRef"
          :src="eventDoc.meta.heroImage"
          :alt="eventDoc.title"
          :class="{ 'is-portrait': imgPortrait }"
          @load="onLoad"
          @error="onError"
        />
      </div>

      <div class="event-detail__hero__text">
        <!-- <p class="event-detail__label">イベント情報</p> -->

        <h1 class="event-detail__title">
          {{ eventDoc.title }}
        </h1>

        <p v-if="eventDoc.meta?.subtitle" class="event-detail__subtitle">
          {{ eventDoc.meta.subtitle }}
        </p>

        <p
          v-if="eventDoc.meta?.startDate && eventDoc.meta?.endDate"
          class="event-detail__period"
        >
          {{ formatDisplayDate(eventDoc.meta.startDate) }}
          〜
          {{ formatDisplayDate(eventDoc.meta.endDate) }}
        </p>

        <p v-if="eventDoc.meta?.openingTime" class="event-detail__time">
          開催時間：{{ eventDoc.meta.openingTime }}
        </p>

        <ul v-if="eventDoc.meta?.tags?.length" class="event-detail__tags">
          <li v-for="tag in eventDoc.meta.tags" :key="tag">#{{ tag }}</li>
        </ul>
      </div>
    </header>

    <section class="event-detail__section">
      <h2>概要</h2>
      <p v-if="eventDoc.meta?.summary">{{ eventDoc.meta.summary }}</p>
    </section>

    <section class="event-detail__section">
      <h2>詳細</h2>
      <ContentRenderer :value="eventDoc" />
    </section>
  </article>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";

.event-detail {
  margin-inline: auto;
  @include pc {
    width: rem($pcBaseW);
  }

  &__hero {
    &__image {
      width: 100%;
      margin-bottom: rem(4 * 10);
      img {
        display: block;
        width: fit-content;
        max-width: 100%;
        min-width: 80%;
        margin-inline: auto;
        border-radius: rem(20);

        &.is-portrait {
          // min-width: auto;
          // max-height: rem(500);
        }
      }
    }

    &__text {
      @include sp {
        padding: 0 rem(20);
      }
    }
  }

  &__title {
    font-weight: 700;
    font-size: rem(4 * 7);
  }
  &__subtitle {
    font-weight: 700;
  }

  &__section {
    margin-top: rem(100);
    @include sp {
      padding: 0 rem(20);
    }
  }
}
</style>
