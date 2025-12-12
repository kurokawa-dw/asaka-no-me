<script setup lang="ts">
const route = useRoute();

// events コレクションから全部取って、その中から slug 一致のものを探す
const { data: rawDocs } = await useAsyncData("event-detail", () =>
  queryCollection("events").all()
);

const eventDoc = computed<any | null>(() => {
  if (!rawDocs.value) return null;

  // frontmatter の slug（meta.slug）で探す
  return (
    rawDocs.value.find((doc: any) => doc.meta?.slug === route.params.slug) ??
    null
  );
});

// 404 ハンドリング
if (!eventDoc.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "イベントが見つかりません",
  });
}

// 日付表示用（12/1(日) みたいなやつ）
const formatDisplayDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${m}/${day}（${w}）`;
};
</script>

<template>
  <article v-if="eventDoc" class="event-detail">
    <header class="event-detail__hero">
      <div v-if="eventDoc.meta?.heroImage" class="event-detail__hero-image">
        <img :src="eventDoc.meta.heroImage" :alt="eventDoc.title" />
      </div>
      <div class="event-detail__hero-text">
        <p class="event-detail__label">イベント情報</p>
        <h1 class="event-detail__title">
          {{ eventDoc.title }}
        </h1>
        <p v-if="eventDoc.meta?.subtitle" class="event-detail__subtitle">
          {{ eventDoc.meta.subtitle }}
        </p>
        <p class="event-detail__period">
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
      <p v-if="eventDoc.meta?.summary">
        {{ eventDoc.meta.summary }}
      </p>
    </section>

    <section class="event-detail__section">
      <h2>詳細</h2>
      <!-- Markdown 本文を表示 -->
      <ContentRenderer :value="eventDoc" />
    </section>
  </article>
</template>
