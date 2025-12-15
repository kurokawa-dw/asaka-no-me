<!-- components/CalendarMonthSwiper.vue -->
<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { Navigation } from "swiper/modules";

import type { DayWithEvents } from "~/composables/useEventCalendar";

const props = defineProps<{
  listByDate: DayWithEvents[];
  selectedTag: string | null;
  currentMonth: string; // 'YYYY-MM'
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

  const arr: {
    key: string;
    year: number;
    month: number;
    monthLabel: string;
    label: string;
  }[] = [];

  for (let offset = -5; offset <= 6; offset++) {
    const d = new Date(baseYear, baseMonth + offset, 1);
    const key = fmtYearMonth(d); // 'YYYY-MM'
    // console.log(d.toLocaleDateString("en-US", { month: "short" }));
    arr.push({
      key,
      year: d.getFullYear(),
      month: d.getMonth(), // 0-11
      monthLabel: d.toLocaleDateString("en-US", { month: "short" }),
      label: `${d.getFullYear()}年 ${d.getMonth() + 1}月`,
    });
  }

  return arr;
});

// 初期スライドは「今月」が入っている index（基本的に真ん中）
const initialIndex = computed(() => {
  const fallbackKey = fmtYearMonth(today);
  const key = props.currentMonth || fallbackKey;
  const idx = monthsWindow.value.findIndex((m) => m.key === key);
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
    const dateStr = fmtYmd(d);
    cells.push({
      dateStr,
      dayNumber: day,
      hasEvents: eventDateSet.value.has(dateStr),
    });
  }

  // 後ろの空白（最終週を土曜まで埋める）
  const remainder = cells.length % 7; // 0ならすでに日〜土で揃ってる
  const trailing = remainder === 0 ? 7 : 7 - remainder; // ★日曜終わりでも7個足す
  for (let i = 0; i < trailing; i++) {
    cells.push({
      dateStr: null,
      dayNumber: null,
      hasEvents: false,
    });
  }

  return cells;
};

const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

onMounted(() => {
  // console.log(buildCalendarCells(2026, 1), "a");
});

const prevRef = ref<HTMLElement | null>(null);
const nextRef = ref<HTMLElement | null>(null);
</script>

<template>
  <!-- Swiper は client-only で動かしたいので、Nuxt の ClientOnly で包むと安全 -->
  <ClientOnly>
    <div class="calender-section">
      <p class="label">
        <img src="/images/top/ttl-label-calener.svg" alt="カレンダー" />
      </p>
      <div class="calendar-swiper">
        <Swiper
          :slides-per-view="1"
          :centered-slides="true"
          :initial-slide="initialIndex"
          :modules="[Navigation]"
          :navigation="{
            prevEl: prevRef,
            nextEl: nextRef,
          }"
          @slideChange="onSlideChange"
        >
          <SwiperSlide v-for="(m, idx) in monthsWindow" :key="m.key">
            <div class="calendar-swiper__month">
              <div class="calendar-swiper__header">
                <span class="calendar-swiper__title">
                  <span class="month">{{ m.month + 1 }}</span>
                  <span class="year">{{ m.year }}</span>
                  <span class="month-label">{{ m.monthLabel }}.</span>
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
                  :class="!cell.dayNumber && 'calendar-swiper__cell--empty'"
                >
                  <div
                    class="calendar-swiper__cell__inner"
                    :class="{
                      'calendar-swiper__cell__inner--empty':
                        cell.dayNumber === null,
                      'calendar-swiper__cell__inner--has-event': cell.hasEvents,
                      'calendar-swiper__cell__inner--clickable': cell.hasEvents,
                    }"
                    @click="onDateClick(cell)"
                  >
                    <span v-if="cell.dayNumber !== null">
                      {{ cell.dayNumber }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        <button
          ref="prevRef"
          type="button"
          class="calender-nav prev-button"
        ></button>
        <button
          ref="nextRef"
          type="button"
          class="calender-nav next-button"
        ></button>
      </div>
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";

.calender-section {
  width: rem(1024);
  margin: rem(150) auto 0;
  // border: 1px solid #000;
  // border-radius: rem(20);
  // padding: rem(30) rem(30) rem(30);
  position: relative;

  @include sp {
    width: rem(360);
  }
}

.label {
  // border: 1px solid #000;
  // background: #fff;
  // border-radius: rem(100);
  // position: absolute;
  // top: rem(-30);
  // inset-inline: 0;
  // margin: auto;
  // padding: rem(5) rem(20);
  width: max-content;
  margin-inline: auto;
  // font-weight: 700;
  // text-align: center;
  // font-size: rem(14);
  img {
    width: rem(120);
  }
}

.calendar-swiper {
  margin-top: rem(20);
  // border: 1px solid #ddd;
  padding: 0 rem(50);
  // padding: 12px;
  // max-width: 420px;

  $bd_color: #b4b4b4;

  &__month {
    width: 100%;
  }
  &__header {
    display: flex;
    justify-content: center;
    margin-bottom: rem(10);
  }

  &__title {
    // font-size: 24px;
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: 1fr 1fr;
    line-height: 1;
    gap: 0 rem(10);

    span {
      place-content: center;
    }

    .month {
      grid-row: 1 / span 2;
      font-size: rem(90);
      // font-weight: 700;
    }

    .month-label {
      border-top: 1px solid #000;
    }
  }

  &__weekdays,
  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: rem(4);
  }

  &__weekdays {
    border-bottom: 2px solid #000;
    margin-bottom: rem(4);
  }

  &__weekday {
    text-align: center;
    font-size: 12px;
    padding-bottom: rem(10);
    // background-color: #000;
    &:nth-child(1) {
      color: #e85151;
    }
  }

  &__cell {
    // aspect-ratio: 1 / 1;
    // border-radius: 4px;
    font-size: rem(18);
    display: flex;
    align-items: center;
    justify-content: center;
    padding-block: rem(10);
    position: relative;

    &:nth-child(7n + 1),
    &:nth-child(1) {
      color: #e85151;
    }

    &:not(&--empty) {
      border-left: 1px solid $bd_color;
      border-bottom: 1px solid $bd_color;
    }
    &__inner {
      width: 40%;
      aspect-ratio: 1 /1;
      padding: 10px 0;
      border-radius: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      &--empty {
        background-color: transparent;
      }
      &--has-event {
        background-color: #62e983;
        font-weight: 600;
      }
      &--clickable {
        cursor: pointer;
      }
    }
  }

  .calender-nav {
    width: rem(50);
    height: rem(50);
    background-color: #000;
    border-radius: 100%;
    position: absolute;
    inset-block: 0;
    top: rem(100);
    margin: auto;
    z-index: 2;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &.swiper-button-disabled {
      opacity: 0.3;
      pointer-events: none;
    }

    &::before {
      content: "";
      display: block;
      width: rem(12);
      height: rem(12);
      border-top: rem(2) solid #fff;
      border-right: rem(2) solid #fff;
    }

    &.prev-button {
      left: rem(-20);
      &::before {
        transform: rotate(-135deg);
        margin-left: rem(5);
      }
    }
    &.next-button {
      right: rem(-20);
      &::before {
        transform: rotate(45deg);
        margin-right: rem(5);
      }
    }
  }
}
</style>
