import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import {
  buildSearchIndex,
  searchIndex,
  type SearchItem,
} from "@/lib/search";

const KIND_LABEL: Record<SearchItem["kind"], string> = {
  track: "Track",
  course: "Course",
  lesson: "Lesson",
  drill: "Drill",
};

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const index = useMemo(() => buildSearchIndex(), []);
  const results = useMemo(() => searchIndex(index, query), [index, query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(item: SearchItem): void {
    setOpen(false);
    setQuery("");
    void navigate({ to: item.href });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        aria-label="Search (Ctrl+K)"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Ctrl+K</span>
      </button>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Search Zero2One"
        className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-card shadow-xl"
      >
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search tracks, courses, lessons, drills..."
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && query.trim() !== "" && (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No matches for “{query.trim()}”.
            </p>
          )}
          {results.map((item) => (
            <Command.Item
              key={item.id}
              value={`${item.title} ${item.subtitle}`}
              onSelect={() => go(item)}
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm aria-selected:bg-primary/10"
            >
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {KIND_LABEL[item.kind]}
              </span>
              <span className="flex-1 truncate font-medium">{item.title}</span>
              <span className="truncate font-mono text-[11px] text-muted-foreground">
                {item.subtitle}
              </span>
            </Command.Item>
          ))}
        </Command.List>
      </Command.Dialog>
    </>
  );
}
