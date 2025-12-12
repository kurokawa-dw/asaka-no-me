// app/composables/useEventCalendar.ts
import { computed, type Ref } from "vue";

export type EventItem = {
  slug: string;
  title: string;
  startDate: string;
  endDate: string;
  tags: string[];
};

export type DayWithEvents = {
  date: string; // 'YYYY-MM-DD'
  events: EventItem[];
};

// ---------- date utils（ローカル基準） ----------
const parseYmd = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const fmtYmd = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// ---------- slug utils ----------
const slugFromStem = (stem?: string): string => {
  // stem: 'events/event-a' → 'event-a'
  if (!stem) return "";
  const parts = stem.split("/");
  return parts[parts.length - 1] ?? "";
};

const slugFromId = (id?: string): string => {
  // id: 'events/events/event-a.md' → 'event-a'
  if (!id) return "";
  const base = id.split("/").pop() ?? "";
  return base.replace(/\.(md|mdx|yml|yaml|json)$/i, "");
};

const assertUniqueSlugs = (
  items: { slug: string; title: string; _source?: string }[]
) => {
  const map = new Map<string, { title: string; source?: string }[]>();

  for (const it of items) {
    const key = it.slug.trim();
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({ title: it.title, source: it._source });
  }

  const dup = Array.from(map.entries()).filter(([, arr]) => arr.length > 1);

  if (dup.length) {
    const msg =
      "[useEventCalendar] slug が重複しています。slug はユニークにしてください。\n" +
      dup
        .map(([slug, arr]) => {
          const lines = arr
            .map((x) => `  - ${x.title}${x.source ? ` (${x.source})` : ""}`)
            .join("\n");
          return `slug: "${slug}"\n${lines}`;
        })
        .join("\n\n");

    // dev は即気づけるように止める
    if (process.dev) throw new Error(msg);

    // 本番は最低でもログ（好みで throw にしてもOK）
    console.error(msg);
  }
};

export const useEventCalendar = (rawDocs: Ref<any[] | null | undefined>) => {
  // MD → イベント配列（frontmatter整形）
  const events = computed<EventItem[]>(() => {
    const docs = rawDocs.value ?? [];

    const mapped = docs
      .map((doc: any) => {
        const meta = doc.meta ?? {};

        // ✅ slug の優先順位：
        // 1) meta.slug（明示指定）
        // 2) doc.stem の末尾（ファイル名相当）
        // 3) doc.id の末尾（予備）
        const fallbackSlug =
          slugFromStem(doc.stem) ||
          slugFromId(doc.id) ||
          String(doc.slug ?? "");

        const slug = String(meta.slug ?? fallbackSlug).trim();

        const item: EventItem & { _source?: string } = {
          slug,
          title: String(doc.title),
          startDate: String(meta.startDate ?? ""),
          endDate: String(meta.endDate ?? ""),
          tags: Array.isArray(meta.tags)
            ? meta.tags.map((t: any) => String(t))
            : [],
          _source: doc.id ?? doc.stem,
        };

        return item;
      })
      // start / end が両方入っているものだけ残す
      .filter((e) => e.startDate && e.endDate && e.slug);

    // ✅ slug 重複チェック（devで即エラー）
    assertUniqueSlugs(mapped);

    if (process.dev) {
      console.log("[useEventCalendar] events(mapped)", mapped);
    }

    // _source は外に出さない
    return mapped.map(({ _source, ...rest }) => rest);
  });

  // 日付ごとの展開 listByDate（イベントがある日だけ）
  const listByDate = computed<DayWithEvents[]>(() => {
    const map: Record<string, EventItem[]> = {};

    for (const e of events.value) {
      const start = parseYmd(e.startDate);
      const end = parseYmd(e.endDate);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        if (process.dev) console.warn("[useEventCalendar] invalid date", e);
        continue;
      }

      const d = new Date(start);
      while (d <= end) {
        const key = fmtYmd(d);
        if (!map[key]) map[key] = [];
        map[key].push(e);
        d.setDate(d.getDate() + 1);
      }
    }

    const dates = Object.keys(map).sort();
    const result: DayWithEvents[] = dates.map((date) => ({
      date,
      events: map[date] ?? [],
    }));

    if (process.dev) {
      console.log("[useEventCalendar] listByDate", result);
    }

    return result;
  });

  // 本日開催イベント
  const todayStr = fmtYmd(new Date());

  const todayEvents = computed<EventItem[]>(() => {
    const day = listByDate.value.find((d) => d.date === todayStr);
    return day?.events ?? [];
  });

  // タグ一覧
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
