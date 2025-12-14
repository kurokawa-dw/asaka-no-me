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
    <p class="label">今日のイベント</p>

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

      <p v-else>本日開催のイベントはありません。</p>
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
  margin: rem(150) auto 0 auto;
  border: 1px solid #000;
  border-radius: rem(20);
  padding: rem(30) rem(30) rem(30);
  position: relative;
}

.label {
  border: 1px solid #000;
  background: #fff;
  border-radius: rem(100);
  position: absolute;
  top: rem(-20);
  left: rem(30);
  padding: rem(5) rem(20);
  // font-weight: 700;
  text-align: center;
  font-size: rem(14);
}

.event-contents {
  font-weight: 700;
  font-size: rem(18);
}
</style>
