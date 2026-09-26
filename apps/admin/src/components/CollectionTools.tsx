import { useEffect, useState, type ReactNode } from "react";
import { Button } from "./ui";
import { pageRows, searchRows } from "../lib/collections";

export function CollectionTools<T>({
  rows,
  text,
  children,
  filters,
  sort,
  sorts = ["Исходный порядок", "А–Я", "Я–А"],
}: {
  rows: T[];
  text: (row: T) => string;
  children: (rows: T[]) => ReactNode;
  filters?: ReactNode;
  sort?: (a: T, b: T) => number;
  sorts?: string[];
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(query);
      setPage(0);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  const matching = searchRows(rows, debounced, text);
  const ordered = order
    ? [...matching].sort(
        (a, b) =>
          (sort ? sort(a, b) : text(a).localeCompare(text(b), "ru")) * (order === 1 ? 1 : -1),
      )
    : matching;
  const result = pageRows(ordered, page);
  return (
    <>
      <div className="toolbar">
        <label className="search-control">
          <input
            aria-label="Поиск"
            placeholder="Поиск…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {filters}
        <select
          aria-label="Сортировка"
          value={order}
          onChange={(e) => {
            setOrder(Number(e.target.value));
            setPage(0);
          }}
        >
          {sorts.map((name, index) => (
            <option value={index} key={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
      {ordered.length ? (
        children(result.rows)
      ) : (
        <div className="empty-state">Нет результатов. Измените поиск или фильтры.</div>
      )}
      <div className="toolbar pagination">
        <span role="status">
          Найдено: {ordered.length} · Страница {result.page + 1} / {result.pages}
        </span>
        <Button
          className="button-secondary"
          disabled={!result.page}
          onClick={() => setPage(result.page - 1)}
        >
          Назад
        </Button>
        <Button
          className="button-secondary"
          disabled={result.page + 1 >= result.pages}
          onClick={() => setPage(result.page + 1)}
        >
          Далее
        </Button>
      </div>
    </>
  );
}
