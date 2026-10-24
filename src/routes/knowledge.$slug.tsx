import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "iconoir-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { knowledgeArticles } from "@/features/knowledge/articles";
import "@/styles-ncea-redesign.css";

export const Route = createFileRoute("/knowledge/$slug")({
  loader: ({ params }) => {
    const article = knowledgeArticles.find((item) => item.slug === params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Статья"} — База знаний NCEA` },
      {
        name: "description",
        content: loaderData?.summary ?? "Материалы NCEA о Minecraft-проектах.",
      },
    ],
  }),
  component: KnowledgeArticlePage,
});

function KnowledgeArticlePage() {
  const article = Route.useLoaderData();
  const related = knowledgeArticles.filter(
    (item) => item.slug !== article.slug && item.category === article.category,
  );
  return (
    <div className="ref-site ncea-knowledge-page">
      <SiteHeader />
      <main className="ncea-article-page">
        <nav aria-label="Навигация назад">
          <Link to="/knowledge">
            <ArrowLeft aria-hidden="true" /> База знаний
          </Link>
        </nav>
        <article>
          <header>
            <span className="ncea-section-label">
              {article.category} / {article.readingMinutes} мин чтения
            </span>
            <h1>{article.title}</h1>
            <p>{article.summary}</p>
          </header>
          <div className="ncea-article-content">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
        </article>
        {related.length > 0 && (
          <aside className="ncea-related-articles">
            <h2>Похожие материалы</h2>
            {related.map((item) => (
              <Link key={item.slug} to="/knowledge/$slug" params={{ slug: item.slug }}>
                {item.title}
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </aside>
        )}
        <Link className="ncea-article-back" to="/knowledge">
          <ArrowLeft aria-hidden="true" /> Ко всем материалам
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
