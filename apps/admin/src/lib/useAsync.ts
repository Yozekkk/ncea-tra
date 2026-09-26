import { useCallback, useEffect, useRef, useState } from "react";

export function useAsync<T>(load: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const version = useRef(0);

  const reload = useCallback(async () => {
    const current = ++version.current;
    setLoading(true);
    setError("");
    try {
      const result = await load();
      if (current === version.current) setData(result);
    } catch (reason) {
      if (current === version.current)
        setError(reason instanceof Error ? reason.message : "Unexpected error.");
    } finally {
      if (current === version.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    const requestVersion = version;
    void reload();
    return () => {
      requestVersion.current++;
    };
  }, [reload]);
  return { data, error, loading, reload };
}
