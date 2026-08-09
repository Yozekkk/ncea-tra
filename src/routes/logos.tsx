import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/site/ServicePage";
import { getService, startingPrice } from "@/lib/services";

const service = getService("logos");

export const Route = createFileRoute("/logos")({
  head: () => ({
    meta: [
      { title: `${service.title} — NCEA` },
      { name: "description", content: `${service.short}. Онлайн-расчёт стоимости, от ${startingPrice(service)} €.` },
      { property: "og:title", content: `${service.title} — NCEA` },
      { property: "og:description", content: service.desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ServicePage id="logos" />,
});
