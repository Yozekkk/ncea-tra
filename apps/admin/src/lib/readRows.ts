/** Read every RLS-visible row across PostgREST's row cap; stable ordering is required. */
export async function readRows<T>(
  load: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  limit?: number,
): Promise<T[]> {
  const rows: T[] = [];
  const size = Math.min(limit ?? 500, 500);
  if (size <= 0) return rows;
  for (let from = 0; ; from += size) {
    const { data, error } = await load(from, Math.min(from + size, limit ?? Infinity) - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < size || (limit !== undefined && rows.length >= limit)) return rows;
  }
}
