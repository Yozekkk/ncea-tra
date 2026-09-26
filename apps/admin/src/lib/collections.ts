/** Shared pure helpers for filtering/pagination and selection. */
export function searchRows<T>(rows: T[], query: string, text: (row: T) => string): T[] {
  const needle = query.trim().toLocaleLowerCase();
  return needle ? rows.filter((row) => text(row).toLocaleLowerCase().includes(needle)) : rows;
}
export function pageRows<T>(rows: T[], page: number, size = 25) {
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.max(0, Math.min(page, pages - 1));
  return { rows: rows.slice(current * size, (current + 1) * size), page: current, pages };
}
export function selectedRows<T extends { id: string | number }>(rows: T[], ids: Set<string>) {
  return rows.filter((row) => ids.has(String(row.id)));
}
