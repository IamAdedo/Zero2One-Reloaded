import {
  listCourses,
  listDrills,
  listTracks,
  lessonsForModule,
  modulesForCourse,
  modulesForTrack,
  getLesson,
} from "@/data/seed";

export type SearchKind = "track" | "course" | "lesson" | "drill";

export interface SearchItem {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
}

export const MAX_SEARCH_RESULTS = 12;

export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];
  for (const t of listTracks()) {
    items.push({
      id: `track:${t.slug}`,
      kind: "track",
      title: t.title,
      subtitle: `${t.primaryLanguage} · track`,
      href: `/tracks/${t.slug}`,
    });
    for (const m of modulesForTrack(t.id)) {
      for (const l of lessonsForModule(m.id)) {
        items.push({
          id: `lesson:${l.id}`,
          kind: "lesson",
          title: l.title,
          subtitle: `${t.title} · ${m.title}`,
          href: `/lessons/${l.id}`,
        });
      }
    }
  }
  for (const c of listCourses()) {
    items.push({
      id: `course:${c.slug}`,
      kind: "course",
      title: c.title,
      subtitle: `${c.technology} · ${c.level}`,
      href: `/courses/${c.slug}`,
    });
    for (const m of modulesForCourse(c.id)) {
      for (const l of lessonsForModule(m.id)) {
        const key = `lesson:${l.id}`;
        if (!items.some((i) => i.id === key)) {
          items.push({
            id: key,
            kind: "lesson",
            title: l.title,
            subtitle: `${c.title} · ${m.title}`,
            href: `/lessons/${l.id}`,
          });
        }
      }
    }
  }
  for (const d of listDrills()) {
    const lesson = d.lessonId ? getLesson(d.lessonId) : undefined;
    items.push({
      id: `drill:${d.id}`,
      kind: "drill",
      title: d.title,
      subtitle: `${d.content.language} · drill${lesson ? ` · ${lesson.title}` : ""}`,
      href: `/workspace/${d.id}`,
    });
  }
  return items;
}

export function searchIndex(items: readonly SearchItem[], query: string): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts: SearchItem[] = [];
  const contains: SearchItem[] = [];
  for (const item of items) {
    const hay = `${item.title} ${item.subtitle}`.toLowerCase();
    if (!hay.includes(q)) continue;
    if (item.title.toLowerCase().startsWith(q)) starts.push(item);
    else contains.push(item);
    if (starts.length + contains.length >= MAX_SEARCH_RESULTS) break;
  }
  return [...starts, ...contains].slice(0, MAX_SEARCH_RESULTS);
}
