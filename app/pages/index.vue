<script setup lang="ts">
import type { DayWithEvents } from "~/composables/useEventCalendar";

const route = useRoute();
const router = useRouter();

const { data: rawDocs } = await useAsyncData("events", () =>
  queryCollection("events").all()
);

// 基本ロジックは composable に任せる
const { listByDate, todayEvents, allTags } = useEventCalendar(rawDocs);

// ===== 月選択（Swiper カレンダーと連動） =====
const today = new Date();
const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`; // 'YYYY-MM'

const selectedMonth = ref<string>(currentYearMonth);

// 選択中の「月の全日」を作る（イベントがない日も含める）
const monthDays = computed<DayWithEvents[]>(() => {
  if (!selectedMonth.value) return [];

  const [yStr, mStr] = selectedMonth.value.split("-");
  const year = Number(yStr);
  const month = Number(mStr); // 1-12

  if (!year || !month) return [];

  // その月の最終日
  const daysInMonth = new Date(year, month, 0).getDate();

  const result: DayWithEvents[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    // もともとの listByDate（イベントがある日だけ）から探す
    const existing = listByDate.value.find((d) => d.date === dateStr);

    result.push({
      date: dateStr,
      events: existing?.events ?? [],
    });
  }

  return result;
});

// ===== タグフィルタ（選択月の全日を対象にする） =====
const selectedTag = ref<string | null>(null);

const filteredListByDate = computed<DayWithEvents[]>(() => {
  const base = monthDays.value;
  if (!selectedTag.value) return base;

  return base.map((day) => ({
    date: day.date,
    events: day.events.filter((e) => e.tags.includes(selectedTag.value!)),
  }));
});

// ===== 日付表示（12/1(日) みたいな表示用） =====
const formatDisplayDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${m}/${day}（${w}）`;
};

// 日付ごとの行要素を保持する ref
const dayRefs = ref<Record<string, HTMLElement | null>>({});

const setDayRef = (date: string, el: HTMLElement | null) => {
  if (!el) return;
  dayRefs.value[date] = el;
};

const scrollToDate = (dateStr: string) => {
  const el = dayRefs.value[dateStr];
  if (!el) return;

  el.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

const isQuerySyncReady = ref(false);

onMounted(() => {
  // ✅ hydration後にクエリを反映
  const qMonth =
    typeof route.query.month === "string" ? route.query.month : null;
  const qTag = typeof route.query.tag === "string" ? route.query.tag : null;

  if (qMonth && /^\d{4}-\d{2}$/.test(qMonth)) selectedMonth.value = qMonth;
  if (qTag) selectedTag.value = qTag;

  // ✅ 反映が終わってからwatchを有効化
  isQuerySyncReady.value = true;
});

// ✅ state → URL 同期（ただし hydration直後は走らせない）
watch(
  selectedMonth,
  (val) => {
    if (!isQuerySyncReady.value) return;
    if (route.query.month === val) return;
    router.replace({ query: { ...route.query, month: val } });
  },
  { flush: "post" }
);

watch(
  selectedTag,
  (val) => {
    if (!isQuerySyncReady.value) return;

    const query: Record<string, any> = {
      ...route.query,
      month: selectedMonth.value,
    };
    if (val) query.tag = val;
    else delete query.tag;

    // 変化がないなら何もしない（無限replace防止）
    const curTag =
      typeof route.query.tag === "string" ? route.query.tag : undefined;
    const nextTag = val ?? undefined;
    if (curTag === nextTag) return;

    router.replace({ query });
  },
  { flush: "post" }
);

// ===== 開発中のデバッグログ =====
// if (process.dev) {
//   watchEffect(() => {
//     console.log("[index] selectedMonth", selectedMonth.value);
//     console.log("[index] filteredListByDate", filteredListByDate.value);
//   });
// }
</script>

<template>
  <main class="l-main">
    <PagesTopKv />

    <PagesTopTodayEvent :today-events="todayEvents" />

    <UiCalendarMonthSwiper
      :listByDate="listByDate"
      :selectedTag="selectedTag"
      :currentMonth="selectedMonth"
      @month-change="selectedMonth = $event"
      @date-click="scrollToDate"
    />

    <!-- ③ タグフィルター -->
    <PagesTopTagFilter :all-tags="allTags" v-model:selectedTag="selectedTag" />

    <!-- 日別一覧 -->
    <PagesTopDayList
      :filtered-list-by-date="filteredListByDate"
      :format-display-date="formatDisplayDate"
      @set-day-ref="({ date, el }) => setDayRef(date, el)"
    />
  </main>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variable" as *;
@use "@/assets/scss/mixin/" as *;
@use "@/assets/scss/component/utiltyPlaceholders";
@use "sass:math";
.ttl {
  font-size: 20px;
  font-weight: 700;
}

a {
  text-decoration: underline;
}

.section-tag-filter {
  margin-top: rem(50);
}

.tag-filter {
  display: flex;
  gap: 10px;
  button {
    border-radius: 10px;
    border: 1px solid #21e5ae;
    @include pc {
      padding: rem(10) rem(20);
    }
    @include sp {
      padding: rem(5) rem(10);
    }

    &.is-active {
      background-color: #21e5ae;
    }
  }
}

.section-day-list {
  @include pc {
    margin-top: rem(100);
  }
  @include sp {
    margin-top: rem(50);
  }
}
.day-list {
  display: flex;
  flex-direction: column;

  li {
    border-top: 1px solid #afafaf;
    padding: rem(20) 0;
    display: grid;
    grid-template-columns: 100px 1fr;
  }
}
</style>
