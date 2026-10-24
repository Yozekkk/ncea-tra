import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "iconoir-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BrandMarquee } from "@/components/site/BrandMarquee";
import { knowledgeArticles } from "@/features/knowledge/articles";
import "@/styles-ncea-redesign.css";

export const Route = createFileRoute("/knowledge/")({
  head: () => ({
    meta: [
      { title: "База знаний — NCEA Studio" },
      {
        name: "description",
        content: "Практические материалы NCEA о запуске, оптимизации и защите Minecraft-серверов.",
      },
    ],
  }),
  component: KnowledgePage,
});

const categories = [
  "Все материалы",
  ...new Set(knowledgeArticles.map((article) => article.category)),
];

function KnowledgePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все материалы");
  const filtered = useMemo(
    () =>
      knowledgeArticles.filter((article) => {
        const matchesCategory = category === "Все материалы" || article.category === category;
        const text = `${article.title} ${article.summary}`.toLocaleLowerCase("ru");
        return matchesCategory && text.includes(query.trim().toLocaleLowerCase("ru"));
      }),
    [query, category],
  );
  return (
    <div className="ref-site ncea-knowledge-page">
      <SiteHeader />
      <main id="main-content">
        <section className="ncea-knowledge-hero">
          <p className="ncea-section-label">NCEA / МАТЕРИАЛЫ</p>
          <h1>
            БАЗА <span>ЗНАНИЙ</span>
          </h1>
          <p>Практические материалы о запуске, настройке и развитии Minecraft-проектов.</p>
          <a href="#articles">
            Читать статьи <ArrowRight aria-hidden="true" />
          </a>
        </section>
        <BrandMarquee text="ГАЙДЫ • ОБНОВЛЕНИЯ • СОВЕТЫ • ЗАЩИТА • ОПТИМИЗАЦИЯ • " />
        <section className="ncea-knowledge-catalog" id="articles" aria-labelledby="articles-title">
          <div className="ncea-knowledge-heading">
            <p className="ncea-section-label">БИБЛИОТЕКА NCEA</p>
            <h2 id="articles-title">Материалы</h2>
          </div>
          <div className="ncea-knowledge-controls">
            <label className="ncea-knowledge-search">
              <Search aria-hidden="true" />
              <span className="sr-only">Поиск статей</span>
              <input
                type="search"
                placeholder="Поиск по статьям"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="ncea-knowledge-categories" role="group" aria-label="Категории статей">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={category === item ? "is-active" : ""}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          {filtered.length ? (
            <div className="ncea-article-grid">
              {filtered.map((article, index) => (
                <article className="ncea-article-card" key={article.slug}>
                  <Link to="/knowledge/$slug" params={{ slug: article.slug }}>
                    <div className={`ncea-article-art ncea-article-art-${index % 3}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{article.category}</strong>
                    </div>
                    <div className="ncea-article-copy">
                      <span>
                        {article.category} · {article.readingMinutes} мин чтения
                      </span>
                      <h3>{article.title}</h3>
                      <p>{article.summary}</p>
                      <span className="ncea-article-link">
                        Читать статью <ArrowRight aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="ncea-knowledge-empty">
              <strong>Материалов не найдено</strong>
              <p>Попробуйте другой запрос или категорию.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("Все материалы");
                }}
              >
                Сбросить фильтры
              </button>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
