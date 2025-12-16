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
  border: 1px solid #000;
  position: relative;
  margin-inline: auto;
  background-color: #fff;

  @include pc {
    width: rem($pcBaseW);
    padding: rem(50) rem(30) rem(40);
    border-radius: rem(20);
    margin-top: rem(180);
  }

  @include sp {
    width: rem($spBaseW);
    padding: rem(40) rem(30) rem(40);
    border-radius: rem(20);
  }
}

.label {
  // border: 1px solid #000;
  width: max-content;
  background: #fff;
  position: absolute;
  inset-inline: 0;
  margin: auto;
  text-align: center;
  @include pc {
    font-size: rem(14);
    top: rem(-28);
    padding: rem(5) rem(20);
  }
  @include sp {
    top: rem(-25);
    padding: rem(10) rem(15);
  }
  img {
    display: block;
    @include pc {
      width: rem(343);
    }
    @include sp {
      width: rem(200);
    }
  }
}

.event-contents {
  font-weight: 700;
  text-align: center;

  .no-event-text {
    @include pc {
      font-size: rem(18);
    }
    @include sp {
      font-size: rem(16);
    }
  }
}
</style>
