<!-- components/CalendarMonthSwiper.vue -->
<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

import type { DayWithEvents } from "~/composables/useEventCalendar";

const props = defineProps<{
  listByDate: DayWithEvents[];
  selectedTag: string | null;
}>();

const emit = defineEmits<{
  (e: "month-change", value: string): void; // 'YYYY-MM'
  (e: "date-click", value: string): void; // 'YYYY-MM-DD'
}>();

const onDateClick = (cell: CalendarCell) => {
  if (!cell.dateStr || !cell.hasEvents) return;
  emit("date-click", cell.dateStr); // 'YYYY-MM-DD'
};

// ===== イベントがある日付のセット =====
const eventDateSet = computed(() => {
  const set = new Set<string>();

  props.listByDate.forEach((day) => {
    // タグフィルタを適用
    const events = props.selectedTag
      ? day.events.filter((e) => e.tags.includes(props.selectedTag!))
      : day.events;

    if (events.length > 0) {
      set.add(day.date);
    }
  });

  return set;
});

// ===== 日付ユーティリティ =====
// Date → 'YYYY-MM-DD'（ローカル時間ベース）
const fmtYmd = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fmtYearMonth = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

// ===== 1年分の「月スライド」配列を作る =====
// 例：今が 2025/12 の場合 → 2025/07〜2026/06 の12ヶ月
const today = new Date();
const monthsWindow = computed(() => {
  const baseYear = today.getFullYear();
  const baseMonth = today.getMonth(); // 0-11 (今月)

  const arr: { key: string; year: number; month: number; label: string }[] = [];

  for (let offset = -5; offset <= 6; offset++) {
    const d = new Date(baseYear, baseMonth + offset, 1);
    const key = fmtYearMonth(d); // 'YYYY-MM'
    arr.push({
      key,
      year: d.getFullYear(),
      month: d.getMonth(), // 0-11
      label: `${d.getFullYear()}年 ${d.getMonth() + 1}月`,
    });
  }

  return arr;
});

// 初期スライドは「今月」が入っている index（基本的に真ん中）
const initialIndex = computed(() => {
  const thisKey = fmtYearMonth(today);
  const idx = monthsWindow.value.findIndex((m) => m.key === thisKey);
  return idx === -1 ? 0 : idx;
});

// ===== Swiper スライド変更時に親へ通知 =====
const onSlideChange = (swiper: any) => {
  const idx = swiper.realIndex ?? swiper.activeIndex;
  const month = monthsWindow.value[idx];
  if (month) {
    emit("month-change", month.key); // 'YYYY-MM'
  }
};

// ===== 各スライド内のカレンダーセルを生成 =====
type CalendarCell = {
  dateStr: string | null;
  dayNumber: number | null;
  hasEvents: boolean;
};

const buildCalendarCells = (year: number, month: number): CalendarCell[] => {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay(); // 0:日〜6:土
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: CalendarCell[] = [];

  // 前の空白
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({
      dateStr: null,
      dayNumber: null,
      hasEvents: false,
    });
  }

  // 各日

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateStr = fmtYmd(d); // ← ここを変更
    cells.push({
      dateStr,
      dayNumber: day,
      hasEvents: eventDateSet.value.has(dateStr),
    });
  }

  return cells;
};

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
</script>

<template>
  <!-- Swiper は client-only で動かしたいので、Nuxt の ClientOnly で包むと安全 -->
  <ClientOnly>
    <div class="calendar-swiper">
      <Swiper
        :slides-per-view="1"
        :centered-slides="true"
        :initial-slide="initialIndex"
        @slideChange="onSlideChange"
      >
        <SwiperSlide v-for="(m, idx) in monthsWindow" :key="m.key">
          <div class="calendar-swiper__month">
            <div class="calendar-swiper__header">
              <span class="calendar-swiper__title">
                {{ m.label }}
              </span>
            </div>

            <div class="calendar-swiper__weekdays">
              <div
                v-for="w in weekdays"
                :key="w"
                class="calendar-swiper__weekday"
              >
                {{ w }}
              </div>
            </div>

            <div class="calendar-swiper__grid">
              <div
                v-for="(cell, i) in buildCalendarCells(m.year, m.month)"
                :key="`${m.key}-${i}`"
                class="calendar-swiper__cell"
                :class="{
                  'calendar-swiper__cell--empty': cell.dayNumber === null,
                  'calendar-swiper__cell--has-event': cell.hasEvents,
                  'calendar-swiper__cell--clickable': cell.hasEvents,
                }"
                @click="onDateClick(cell)"
              >
                <span v-if="cell.dayNumber !== null">
                  {{ cell.dayNumber }}
                </span>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </ClientOnly>
</template>

<style scoped>
.calendar-swiper {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  max-width: 420px;
}

.calendar-swiper__month {
  width: 100%;
}

.calendar-swiper__header {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.calendar-swiper__title {
  font-weight: 600;
}

.calendar-swiper__weekdays,
.calendar-swiper__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-swiper__weekday {
  text-align: center;
  font-size: 12px;
  color: #666;
}

.calendar-swiper__cell {
  aspect-ratio: 1 / 1;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-swiper__cell--empty {
  background-color: transparent;
}

.calendar-swiper__cell--has-event {
  background-color: #ffe9a3;
  font-weight: 600;
}
.calendar-swiper__cell--clickable {
  cursor: pointer;
}
</style>
