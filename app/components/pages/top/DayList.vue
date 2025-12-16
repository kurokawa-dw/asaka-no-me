<script setup lang="ts">
type EventItem = {
  slug: string;
  title: string;
};

type DayWithEvents = {
  date: string;
  events: EventItem[];
};

const route = useRoute();

const selectedTag = ref<string | null>(null);

// console.log(selectedTag.value);

type DisplayDate = { m: number; day: number; w: string };

const props = defineProps<{
  filteredListByDate: DayWithEvents[];
  formatDisplayDate: (dateStr: string) => DisplayDate;
}>();

const activeDay = computed(() => {
  return props.filteredListByDate.filter((day) => day.events.length);
});

// console.log(props.filteredListByDate);

const year = computed(() => {
  return props.filteredListByDate[0]?.date.split("-")[0];
});

const month = computed(() => {
  return props.filteredListByDate[0]?.date.split("-")[1];
});

// イベントがない表示させたい場合は filteredListByDate
// イベントがある日のみを表示する場合は activeDay

const emit = defineEmits<{
  (e: "set-day-ref", payload: { date: string; el: HTMLElement | null }): void;
}>();

const onSetRef = (date: string, el: Element | null) => {
  emit("set-day-ref", { date, el: el as HTMLElement | null });
};

watch(
  () => route.query.tag,
  (tag) => {
    selectedTag.value =
      typeof tag === "string"
        ? tag
        : Array.isArray(tag)
          ? (tag[0] ?? null)
          : null;
  },
  { immediate: true }
);
</script>

<template>
  <section class="section-day-list">
    <!-- <h2 class="ttl">
      <img src="/images/top/ttl-label-event-list.svg" alt="イベント一覧" />
    </h2> -->

    <div class="list-header">
      <h2 class="year-month u-ff-maru">
        <span class="num">{{ year }}</span
        ><span class="fz-s">年 </span><span class="num"> {{ month }} </span
        ><span class="fz-s">月 の</span>イベント一覧
      </h2>
    </div>

    <ul class="day-list" v-if="activeDay.length">
      <li
        v-for="day in activeDay"
        :key="day.date"
        class="day-list__row"
        :ref="(el) => onSetRef(day.date, el)"
      >
        <div
          class="day-list__date"
          :class="[
            formatDisplayDate(day.date).w === '日' && 'sun',
            formatDisplayDate(day.date).w === '土' && 'sat',
          ]"
        >
          <p class="year">{{ year }}</p>
          <p class="day-week">
            <span class="day">
              {{ formatDisplayDate(day.date).m }}/{{
                formatDisplayDate(day.date).day
              }}
            </span>
            <span class="week">（{{ formatDisplayDate(day.date).w }}）</span>
          </p>
        </div>

        <div class="day-list__events">
          <ul v-if="day.events.length" class="event-list">
            <li v-for="event in day.events" :key="event.slug">
              <NuxtLink :to="`/event/${event.slug}`">
                {{ event.title }}
              </NuxtLink>
            </li>
          </ul>

          <p v-else class="day-list__no-event">イベントなし</p>
        </div>
      </li>
    </ul>

    <div v-else class="no-event-block">
      <p v-if="selectedTag">
        【#{{
          selectedTag
        }}】のイベントはありません！<br />上のジャンルボタンを変更してみて！
      </p>
      <p v-else>
        イベントはありません！<br />または、更新が追いついてなくてごめんね<span
          class="emoji"
          >🙇‍♂️</span
        >
      </p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";
.section-day-list {
  margin-inline: auto;
  @include pc {
    max-width: rem($pcBaseW);
    margin-top: rem(80);
  }
  @include sp {
    margin-top: rem(50);
  }
}
// .ttl {
//   width: rem(200);
//   margin: 0 auto;
// }

.list-header {
  text-align: center;
  font-weight: 700;
  @include pc {
    font-size: rem(28);
    // margin-block: rem(32) rem(20);
  }
  @include sp {
    font-size: rem(22);
  }

  .num {
    letter-spacing: 0.05em;
    font-size: 120%;
    @include pc {
    }
  }

  .fz-s {
    font-size: 70%;
  }
}
.day-list {
  @include pc {
    margin-top: rem(20);
  }
  @include sp {
    margin-top: rem(15);
  }
  &__row {
    border-top: 1px solid #000;
    display: grid;
    @include pc {
      grid-template-columns: rem(180) 1fr;
      gap: rem(30);
      padding: rem(20) 0;
    }
    @include sp {
      grid-template-columns: rem(120) 1fr;
      gap: rem(20);
      padding: rem(10) 0;
    }
  }

  &__date {
    border-right: 1px solid #000;
    font-weight: 700;
    line-height: 1;
    @include pc {
      padding-block: rem(20);
    }
    @include sp {
      padding-block: rem(10);
      padding-left: rem(10);
    }
    &.sun {
      color: var(--c-red);
    }
    &.sat {
      color: var(--c-blue);
    }
    .year {
      letter-spacing: 0.05em;
      @include pc {
        font-size: rem(16);
      }
      @include sp {
        font-size: rem(12);
      }
    }
    .day-week {
      @include pc {
        margin-top: 0.5em;
      }
      @include sp {
        margin-top: 0.5em;
      }
    }
    .day {
      letter-spacing: 0.1em;
      @include pc {
        font-size: rem(22);
      }
      @include sp {
        // display: block;
        margin-top: 0.5em;
        font-size: rem(18);
      }
    }
  }

  &__events {
    display: flex;
    align-items: center;
    @include pc {
      padding-block: rem(10);
    }
    @include sp {
      padding-block: rem(10);
    }
    .event-list {
      font-weight: 700;
      display: flex;
      flex-direction: column;
      @include pc {
        font-size: rem(24);
        gap: rem(20);
      }
      @include sp {
        font-size: rem(16);
      }
      a {
        text-decoration: underline;
        text-decoration-thickness: 1px;
      }
    }
  }
}
.no-event-block {
  min-height: rem(200);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  .emoji {
    font-size: 200%;
  }
}
</style>
