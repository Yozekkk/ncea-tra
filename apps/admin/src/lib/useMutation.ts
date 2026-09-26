import { useRef, useState } from "react";

/** Serialize mutations and invalidate loaded lists only after the write succeeds. */
export function useMutation() {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const perform = async (action: () => Promise<unknown>, reload?: () => Promise<unknown>) => {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await action();
      await reload?.();
      setMessage("Изменения сохранены.");
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось сохранить изменения.");
      await reload?.();
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  return { busy, message, error, perform, setError };
}
