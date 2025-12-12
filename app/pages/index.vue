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

const initialMonth =
  typeof route.query.month === "string" &&
  /^\d{4}-\d{2}$/.test(route.query.month)
    ? route.query.month
    : currentYearMonth;

const initialTag =
  typeof route.query.tag === "string" && route.query.tag.length > 0
    ? route.query.tag
    : null;

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
    <!-- <pre>{{ rawDocs }}</pre> -->
    <!-- <pre>{{ listByDate }}</pre> -->
    <!-- ① 本日開催イベント -->
    <section class="section">
      <h2>本日開催されているイベント</h2>
      <div v-if="todayEvents.length">
        <ul>
          <li v-for="event in todayEvents" :key="event.slug">
            <NuxtLink :to="`/event/${event.slug}`">
              {{ event.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>
      <p v-else>本日のイベントはありません。</p>
    </section>

    <section class="section">
      <h2>カレンダー</h2>
      <CalendarMonthSwiper
        :listByDate="listByDate"
        :selectedTag="selectedTag"
        :currentMonth="selectedMonth"
        @month-change="selectedMonth = $event"
        @date-click="scrollToDate"
      />
    </section>

    <!-- ③ タグフィルター -->
    <section class="section">
      <h2>タグで絞り込む</h2>
      <div class="tag-filter">
        <button
          type="button"
          :class="{ 'is-active': selectedTag === null }"
          @click="selectedTag = null"
        >
          すべて
        </button>
        <button
          v-for="tag in allTags"
          :key="tag"
          type="button"
          :class="{ 'is-active': selectedTag === tag }"
          @click="selectedTag = tag"
        >
          {{ tag }}
        </button>
      </div>
    </section>

    <section class="section">
      <h2>イベント一覧（カレンダー形式）</h2>
      <ul class="day-list">
        <li
          v-for="day in filteredListByDate"
          :key="day.date"
          class="day-list__row"
          :ref="(el) => setDayRef(day.date, el as HTMLElement | null)"
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
  </main>
</template>
