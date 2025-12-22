<!-- components/CalendarMonthSwiper.vue -->
<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper/modules";
import "swiper/css";

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

  // console.log(cell);
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

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

onMounted(() => {
  // console.log(buildCalendarCells(2026, 1), "a");
});

const prevRef = ref<HTMLElement | null>(null);
const nextRef = ref<HTMLElement | null>(null);

const shown = ref(false);

const onClientMounted = async () => {
  shown.value = false;
  await nextTick();
  requestAnimationFrame(() => {
    shown.value = true;
  });
};
</script>

<template>
  <div class="calender-section">
    <ClientOnly @vue:mounted="onClientMounted">
      <div class="calendar-swiper" :class="{ 'is-shown': shown }">
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
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";

.calender-section {
  position: relative;
  margin-inline: auto;

  @include pc {
    width: rem($pcBaseW);
    margin-top: rem(50);
    aspect-ratio: 1024 / 587;
  }

  @include sp {
    width: rem($spBaseW);
    margin-top: rem(30);
    aspect-ratio: 350 / 420;
  }
}

.calendar-swiper {
  opacity: 0;
  transition: opacity 0.3s;
  @include pc {
    padding: 0 rem(50);
  }
  @include sp {
    // padding: 0 rem(30);
  }
  &.is-shown {
    opacity: 1;
  }

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
      // font-weight: 700;
      @include pc {
        font-size: rem(90);
      }
      @include sp {
        font-size: rem(60);
      }
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
    &:nth-child(1) {
      color: var(--c-red);
    }
  }

  &__cell {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    @include pc {
      padding-block: rem(10);
      font-size: rem(20);
    }
    @include sp {
      font-size: rem(16);
      padding-block: rem(8);
    }

    &:nth-child(7n + 1),
    &:nth-child(1) {
      color: var(--c-red);
    }

    &:not(&--empty) {
      border-left: 1px solid $bd_color;
      border-bottom: 1px solid $bd_color;
    }
    &__inner {
      aspect-ratio: 1 /1;
      border-radius: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      @include pc {
        width: 40%;
      }
      @include sp {
        width: 70%;
      }

      &::before {
        content: "";
        display: block;
        width: 100%;
        height: rem(8);
        position: absolute;
        bottom: rem(6);
        border-radius: rem(8);
        left: 0;
        transition: background 0.2s;
      }
      &--empty {
      }
      &--has-event {
        font-weight: 600;
        &::before {
          background-color: var(--c-green);
        }
      }
      &--clickable {
        cursor: pointer;
      }

      span {
        display: block;
        aspect-ratio: 1 /1;
      }
    }
  }

  .calender-nav {
    background-color: #000;
    border-radius: 100%;
    position: absolute;
    z-index: 2;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    @include pc {
      width: rem(50);
      height: rem(50);
      margin: auto;
      bottom: 0;
      top: rem(50);
    }
    @include sp {
      width: rem(30);
      height: rem(30);
      top: rem(20);
    }

    &.swiper-button-disabled {
      opacity: 0.3;
      pointer-events: none;
    }

    &::before {
      content: "";
      display: block;
      width: 24%;
      aspect-ratio: 1 / 1;
      border-top: rem(2) solid #fff;
      border-right: rem(2) solid #fff;
    }

    &.prev-button {
      @include pc {
        left: rem(-20);
      }
      @include sp {
        left: rem(10);
      }
      &::before {
        transform: rotate(-135deg);
        @include pc {
          margin-left: rem(5);
        }
        @include sp {
          margin-left: rem(3);
        }
      }
    }
    &.next-button {
      @include pc {
        right: rem(-20);
      }
      @include sp {
        right: rem(10);
      }
      &::before {
        transform: rotate(45deg);
        @include pc {
          margin-right: rem(5);
        }
        @include sp {
          margin-right: rem(3);
        }
      }
    }
  }
}
</style>
