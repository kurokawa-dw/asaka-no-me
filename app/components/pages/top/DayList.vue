<script setup lang="ts">
type EventItem = {
  slug: string;
  title: string;
};

type DayWithEvents = {
  date: string;
  events: EventItem[];
};

const props = defineProps<{
  filteredListByDate: DayWithEvents[];
  formatDisplayDate: (dateStr: string) => string;
}>();

const activeDay = computed(() => {
  return props.filteredListByDate.filter((day) => day.events.length);
});

// イベントがない表示させたい場合は filteredListByDate
// イベントがある日のみを表示する場合は activeDay

const emit = defineEmits<{
  (e: "set-day-ref", payload: { date: string; el: HTMLElement | null }): void;
}>();

const onSetRef = (date: string, el: Element | null) => {
  emit("set-day-ref", { date, el: el as HTMLElement | null });
};
</script>

<template>
  <section class="section-day-list">
    <h2 class="ttl">イベント一覧（カレンダー形式）</h2>

    <ul class="day-list">
      <li
        v-for="day in activeDay"
        :key="day.date"
        class="day-list__row"
        :ref="(el) => onSetRef(day.date, el)"
      >
        <div class="day-list__date">
          {{ formatDisplayDate(day.date) }}
        </div>

        <div class="day-list__events">
          <template v-if="day.events.length">
            <p v-for="event in day.events" :key="event.slug">
              <NuxtLink :to="`/event/${event.slug}`">
                {{ event.title }}
              </NuxtLink>
            </p>
          </template>

          <p v-else class="day-list__no-event">イベントなし</p>
        </div>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";
.section-day-list {
  width: rem(1024);
  margin: rem(20) auto;
}
.day-list {
  li {
    padding: 20px 0;
    border-top: 1px solid #000;
  }
}
</style>
