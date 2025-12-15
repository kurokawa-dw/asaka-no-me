<script setup lang="ts">
type EventItem = {
  slug: string;
  title: string;
};

defineProps<{
  todayEvents: EventItem[];
}>();
</script>

<template>
  <section class="section">
    <p class="label">
      <img src="/images/top/ttl-label-today-event.svg" alt="今日のイベント" />
    </p>

    <div class="event-contents">
      <div v-if="todayEvents.length">
        <ul class="event-list">
          <li v-for="event in todayEvents" :key="event.slug">
            <NuxtLink :to="`/event/${event.slug}`">
              {{ event.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <p v-else class="no-event-text">本日開催のイベントはありません。</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";

.section {
  width: rem(1024);
  margin: rem(180) auto 0 auto;
  border: 1px solid #000;
  border-radius: rem(20);
  padding: rem(50) rem(30) rem(40);
  position: relative;
}

.label {
  // border: 1px solid #000;
  width: max-content;
  background: #fff;
  border-radius: rem(100);
  position: absolute;
  top: rem(-28);
  inset-inline: 0;
  margin: auto;
  padding: rem(5) rem(20);
  // font-weight: 700;
  text-align: center;
  font-size: rem(14);
  img {
    width: rem(343);
    display: block;
  }
}

.event-contents {
  font-weight: 700;
  text-align: center;

  .no-event-text {
    font-size: rem(18);
  }
}
</style>
