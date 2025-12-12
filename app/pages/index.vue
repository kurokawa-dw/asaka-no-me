<script setup lang="ts">
const { data: rawDocs } = await useAsyncData("events", () =>
  queryCollection("events").all()
);

// 型定義（ページ内だけで使う簡易版）
type EventItem = {
  slug: string;
  title: string;
  startDate: string;
  endDate: string;
  tags: string[];
};

type DayWithEvents = {
  date: string; // 'YYYY-MM-DD'
  events: EventItem[];
};

// ===== イベント配列（MD → frontmatter 整形） =====
const events = computed<EventItem[]>(() => {
  const docs = rawDocs.value ?? [];

  const mapped = docs
    .map((doc: any) => {
      const meta = doc.meta ?? {};

      return {
        slug: String(meta.slug ?? doc.slug ?? doc.id),
        title: String(doc.title),
        startDate: String(meta.startDate ?? ""),
        endDate: String(meta.endDate ?? ""),
        tags: Array.isArray(meta.tags)
          ? meta.tags.map((t: any) => String(t))
          : [],
      };
    })
    // start / end が両方入っているものだけ残す
    .filter((e) => e.startDate && e.endDate);

  if (process.dev) {
    console.log("[index] events(mapped)", mapped);
  }

  return mapped;
});

// ===== 日付ごとの展開 listByDate =====
// 'YYYY-MM-DD' → Date（ローカル）
const parseYmd = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d); // 月は0始まり
};

const toDate = (s: string | Date): Date => {
  if (s instanceof Date) return s;
  // 'YYYY-MM-DD' 前提でパース
  return parseYmd(s);
};

// Date → 'YYYY-MM-DD'（ローカル）
const fmtDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const listByDate = computed<DayWithEvents[]>(() => {
  const map: Record<string, EventItem[]> = {};

  for (const e of events.value) {
    const start = toDate(e.startDate);
    const end = toDate(e.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      if (process.dev) console.warn("[index] invalid date", e);
      continue;
    }

    const d = new Date(start);
    while (d <= end) {
      const key = fmtDate(d); // ← ここ
      if (!map[key]) map[key] = [];
      map[key].push(e);
      d.setDate(d.getDate() + 1);
    }
  }

  const dates = Object.keys(map).sort();
  return dates.map((date) => ({
    date,
    events: map[date] ?? [],
  }));
});

// ===== 本日開催イベント =====
const todayStr = fmtDate(new Date());

const todayEvents = computed<EventItem[]>(() => {
  const day = listByDate.value.find((d) => d.date === todayStr);
  return day?.events ?? [];
});

// ===== タグ一覧 =====
const allTags = computed<string[]>(() => {
  const set = new Set<string>();
  events.value.forEach((e) => e.tags.forEach((t) => set.add(t)));
  return Array.from(set);
});

// ===== 月選択（Swiper カレンダーと連動） =====
const today = new Date();
const currentYearMonth = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}`; // 'YYYY-MM'

const selectedMonth = ref<string>(currentYearMonth);

// 選択中の「月の全日」を作る（イベントがない日も含める）
const monthDays = computed<DayWithEvents[]>(() => {
  if (!selectedMonth.value) return [];

  const [yStr, mStr] = selectedMonth.value.split("-");
  const year = Number(yStr);
  const month = Number(mStr); // 1-12

  if (!year || !month) return [];

  // その月の最終日
  const daysInMonth = new Date(year, month, 0).getDate(); // month は1-12なのでそのまま使える

  const result: DayWithEvents[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // もともとの listByDate（イベントがある日だけ）から探す
    const existing = listByDate.value.find((d) => d.date === dateStr);

    result.push({
      date: dateStr,
      events: existing?.events ?? [], // イベントがなければ空配列
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
