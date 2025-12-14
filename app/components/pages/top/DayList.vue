<script setup lang="ts">
type EventItem = {
  slug: string;
  title: string;
};

type DayWithEvents = {
  date: string;
  events: EventItem[];
};

defineProps<{
  filteredListByDate: DayWithEvents[];
  formatDisplayDate: (dateStr: string) => string;
}>();

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
        v-for="day in filteredListByDate"
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
