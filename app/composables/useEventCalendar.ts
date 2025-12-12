// composables/useEventCalendar.ts
import type { Ref } from "vue";

export type EventMeta = {
  slug: string;
  title: string;
  subtitle?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  openingTime?: string;
  tags: string[];
  placeName?: string;
  isFree?: boolean;
};

export type DayWithEvents = {
  date: string;
  events: EventMeta[];
};

const toDate = (s: string | Date) => new Date(s);
const fmt = (d: Date) => d.toISOString().slice(0, 10);

// ✅ useAsyncData の型に合わせて undefined を許可
export const useEventCalendar = (rawDocs: Ref<any[] | undefined>) => {
  // ① MD → EventMeta 配列
  const events = computed<EventMeta[]>(() => {
    const docs = rawDocs.value ?? [];

    const mapped = docs
      .map((doc: any) => {
        const start = doc.startDate;
        const end = doc.endDate;

        return {
          slug: String(doc.slug),
          title: String(doc.title),
          subtitle: doc.subtitle ? String(doc.subtitle) : undefined,
          startDate: start,
          endDate: end,
          openingTime: doc.openingTime ? String(doc.openingTime) : undefined,
          tags: Array.isArray(doc.tags)
            ? doc.tags.map((t: any) => String(t))
            : [],
          placeName: doc.placeName ? String(doc.placeName) : undefined,
          isFree: typeof doc.isFree === "boolean" ? doc.isFree : undefined,
        } as EventMeta;
      })
      // start / end がないものは除外
      .filter((e) => !!e.startDate && !!e.endDate);

    if (process.dev) {
      console.log("[useEventCalendar] rawDocs", docs);
      console.log("[useEventCalendar] events(mapped)", mapped);
    }

    return mapped;
  });

  // ② 日付ごとの展開
  const listByDate = computed<DayWithEvents[]>(() => {
    const map: Record<string, EventMeta[]> = {};

    for (const e of events.value) {
      const start = toDate(e.startDate);
      const end = toDate(e.endDate);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        if (process.dev) {
          console.warn("[useEventCalendar] invalid date", e);
        }
        continue;
      }

      const d = new Date(start);
      while (d <= end) {
        const key = fmt(d);
        if (!map[key]) map[key] = [];
        map[key].push(e);
        d.setDate(d.getDate() + 1);
      }
    }

    const dates = Object.keys(map).sort();
    const result = dates.map((date) => ({
      date,
      // ✅ TS 的にも runtime 的にも必ず配列にする
      events: (map[date] ?? []) as EventMeta[],
    }));

    if (process.dev) {
      console.log("[useEventCalendar] listByDate", result);
    }

    return result;
  });

  // ③ 本日
  const todayStr = fmt(new Date());
  const todayEvents = computed<EventMeta[]>(() => {
    const day = listByDate.value.find((d) => d.date === todayStr);
    return day?.events ?? [];
  });

  // ④ タグ一覧
  const allTags = computed<string[]>(() => {
    const set = new Set<string>();
    events.value.forEach((e) => e.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  });

  return {
    events,
    listByDate,
    todayEvents,
    allTags,
  };
};
