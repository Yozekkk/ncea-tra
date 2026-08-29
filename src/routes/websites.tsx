import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/site/ServicePage";
import { getService } from "@/lib/services";

const service = getService("websites");

export const Route = createFileRoute("/websites")({
  head: () => ({
    meta: [
      { title: `${service.title} — NCEA` },
      {
        name: "description",
        content: `${service.short}. Заказ и обсуждение напрямую с командой NCEA.`,
      },
      { property: "og:title", content: `${service.title} — NCEA` },
      { property: "og:description", content: service.desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ServicePage id="websites" />,
});
