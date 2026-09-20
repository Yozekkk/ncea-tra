import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { parseSafeHttpUrl } from "../lib/validation";

export function UrlImagePreview({ url, alt }: { url: string; alt: string }) {
  const normalized = url.trim();
  const safeUrl = normalized ? parseSafeHttpUrl(normalized)?.href : null;
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [safeUrl]);

  return (
    <div className="image-url-preview" aria-live="polite">
      {safeUrl && !failed ? (
        <img src={safeUrl} alt={alt} onError={() => setFailed(true)} />
      ) : (
        <span>
          <ImageOff size={24} aria-hidden="true" />
          {normalized
            ? safeUrl
              ? "Изображение недоступно. Проверьте прямую ссылку."
              : "Нужна безопасная ссылка http:// или https:// без credentials."
            : "Preview появится после ввода URL изображения."}
        </span>
      )}
    </div>
  );
}
