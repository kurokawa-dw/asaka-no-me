<script setup lang="ts">
import type { DayWithEvents } from "~/composables/useEventCalendar";

// 親から受け取る
const props = defineProps<{
  listByDate: DayWithEvents[];
}>();

// ===== イベントのある日かどうかを判定する Set =====
const eventDateSet = computed(() => {
  const set = new Set<string>();
  props.listByDate.forEach((day) => {
    if (day.events.length > 0) {
      set.add(day.date);
    }
  });
  return set;
});

// ===== 日付・月計算ユーティリティ =====
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const addMonths = (base: Date, offset: number) =>
  new Date(base.getFullYear(), base.getMonth() + offset, 1);
const monthDiff = (from: Date, to: Date) =>
  (to.getFullYear() - from.getFullYear()) * 12 +
  (to.getMonth() - from.getMonth());

// ===== カルーセル範囲計算 =====
const today = new Date();

// 過去は3ヶ月前まで
const earliestAllowed = new Date(today.getFullYear(), today.getMonth() - 3, 1);

// イベントがある最初／最後の日
const minEventDate = computed<Date | null>(() => {
  if (!props.listByDate.length) return null;
  return new Date(props.listByDate[0].date);
});
const maxEventDate = computed<Date | null>(() => {
  if (!props.listByDate.length) return null;
  return new Date(props.listByDate[props.listByDate.length - 1].date);
});

// イベントがある最初の月（なければ今日）
const earliestEventMonth = computed(() =>
  minEventDate.value
    ? new Date(
        minEventDate.value.getFullYear(),
        minEventDate.value.getMonth(),
        1
      )
    : today
);

// 開始月 = 「3ヶ月前」or「イベント最初月」のうち新しい方
const startMonth = computed(() => {
  const a = earliestAllowed;
  const b = earliestEventMonth.value;
  return a > b ? a : b;
});

// イベントがある最後の月（なければ今日）
const lastEventMonth = computed(() =>
  maxEventDate.value
    ? new Date(
        maxEventDate.value.getFullYear(),
        maxEventDate.value.getMonth(),
        1
      )
    : today
);

// 月数
const totalMonths = computed(() =>
  props.listByDate.length
    ? monthDiff(startMonth.value, lastEventMonth.value) + 1
    : 1
);

// 初回表示は「今日の月」だが、範囲外なら clamp
const initialMonth = computed(() => {
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  if (thisMonth < startMonth.value) return startMonth.value;
  if (thisMonth > lastEventMonth.value) return lastEventMonth.value;
  return thisMonth;
});

// startMonth からのオフセット
const currentIndex = ref(monthDiff(startMonth.value, initialMonth.value));

// 現在の年月
const currentMonthDate = computed(() =>
  addMonths(startMonth.value, currentIndex.value)
);
const currentYear = computed(() => currentMonthDate.value.getFullYear());
const currentMonth = computed(() => currentMonthDate.value.getMonth()); // 0-11

// ===== ナビゲーション（ボタン＆スワイプから呼ぶ） =====
const canPrev = computed(() => currentIndex.value > 0);
const canNext = computed(() => currentIndex.value < totalMonths.value - 1);

const goPrev = () => {
  if (canPrev.value) currentIndex.value -= 1;
};
const goNext = () => {
  if (canNext.value) currentIndex.value += 1;
};

// ===== カレンダーのセル生成 =====
type CalendarCell = {
  dateStr: string | null;
  dayNumber: number | null;
  hasEvents: boolean;
};

const calendarCells = computed<CalendarCell[]>(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
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
    const dateStr = fmt(d);
    cells.push({
      dateStr,
      dayNumber: day,
      hasEvents: eventDateSet.value.has(dateStr),
    });
  }

  return cells;
});

const monthLabel = computed(
  () => `${currentYear.value}年 ${currentMonth.value + 1}月`
);
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

// ===== スワイプ検知（タッチ） =====
const touchStartX = ref<number | null>(null);
const touchStartY = ref<number | null>(null);
const SWIPE_THRESHOLD = 40; // px これ以上動いたら「スワイプ」と判定

const onTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
};

const onTouchEnd = (e: TouchEvent) => {
  if (touchStartX.value === null || touchStartY.value === null) return;

  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - touchStartX.value;
  const deltaY = touch.clientY - touchStartY.value;

  // 縦スクロールと区別するため、横方向が強いときだけ反応
  if (
    Math.abs(deltaX) < SWIPE_THRESHOLD ||
    Math.abs(deltaX) < Math.abs(deltaY)
  ) {
    touchStartX.value = null;
    touchStartY.value = null;
    return;
  }

  if (deltaX < 0) {
    // 左にスワイプ → 次の月
    goNext();
  } else {
    // 右にスワイプ → 前の月
    goPrev();
  }

  touchStartX.value = null;
  touchStartY.value = null;
};
</script>

<template>
  <div
    class="calendar-carousel"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="calendar-carousel__header">
      <button
        type="button"
        class="calendar-carousel__nav"
        :disabled="!canPrev"
        @click="goPrev"
      >
        ‹
      </button>
      <div class="calendar-carousel__title">
        {{ monthLabel }}
      </div>
      <button
        type="button"
        class="calendar-carousel__nav"
        :disabled="!canNext"
        @click="goNext"
      >
        ›
      </button>
    </div>

    <div class="calendar-carousel__weekdays">
      <div v-for="w in weekdays" :key="w" class="calendar-carousel__weekday">
        {{ w }}
      </div>
    </div>

    <div class="calendar-carousel__grid">
      <div
        v-for="(cell, index) in calendarCells"
        :key="index"
        class="calendar-carousel__cell"
        :class="{
          'calendar-carousel__cell--empty': cell.dayNumber === null,
          'calendar-carousel__cell--has-event': cell.hasEvents,
        }"
      >
        <span v-if="cell.dayNumber !== null">
          {{ cell.dayNumber }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-carousel {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  max-width: 420px;
  touch-action: pan-y; /* 縦スクロール優先しつつ横スワイプを許可 */
}

.calendar-carousel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.calendar-carousel__title {
  font-weight: 600;
}

.calendar-carousel__nav {
  border: none;
  background: #f3f3f3;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.calendar-carousel__nav:disabled {
  opacity: 0.4;
  cursor: default;
}

.calendar-carousel__weekdays,
.calendar-carousel__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-carousel__weekday {
  text-align: center;
  font-size: 12px;
  color: #666;
}

.calendar-carousel__cell {
  aspect-ratio: 1 / 1;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-carousel__cell--empty {
  background-color: transparent;
}

.calendar-carousel__cell--has-event {
  background-color: #ffe9a3;
  font-weight: 600;
}
</style>
