<script setup lang="ts">
type EventItem = {
  slug: string;
  title: string;
};

defineProps<{
  todayEvents: EventItem[];
}>();

const mount = useMountStore();

onMounted(() => mount.setMounted("todayEvent", true));
onBeforeUnmount(() => mount.setMounted("todayEvent", false));
</script>

<template>
  <section class="section" data-trigger="todayEvent">
    <p class="label">
      <img src="/images/top/ttl-label-today-event.svg" alt="今日のイベント" />
    </p>

    <div class="event-contents">
      <ul v-if="todayEvents.length" class="event-list">
        <li v-for="event in todayEvents" :key="event.slug">
          <NuxtLink :to="`/event/${event.slug}`">
            {{ event.title }}
          </NuxtLink>
        </li>
      </ul>
      <p v-else class="no-event-text">本日開催のイベントはありません。</p>

      <!-- <ul v-if="todayEvents.length" class="event-list">
        <li>
          <a href="ddd">あさか 冬のあかりテラス2025</a>
        </li>
        <li>
          <a href="ddd">スタンプラリー</a>
        </li>
        <li>
          <a href="ddd">あさか 冬のあかりテラス2025</a>
        </li>
        <li>
          <a href="ddd">あさか 冬のあかりテラス2025</a>
        </li>
      </ul> -->
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
    // margin-top: rem(180);
  }

  @include sp {
    width: rem($spBaseW);
    padding: rem(40) rem(20) rem(40) rem(10);
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
  border-radius: rem(100);
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

  .event-list {
    display: flex;
    justify-content: center;
    gap: 1em 2em;
    font-size: rem(20);
    flex-wrap: wrap;
    li {
      &::before {
        content: "・";
        color: var(--c-red);
      }
    }
  }
}
</style>
