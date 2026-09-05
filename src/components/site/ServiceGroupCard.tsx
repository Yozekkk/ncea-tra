import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { Service } from "@/lib/services";
import { workersDirectionalReveal } from "@/lib/motion";

type GroupVariant = "primary" | "creative" | "compact";

type ArtAsset = {
  src: string;
  role: string;
};

type ServiceGroupCardProps = {
  number: string;
  label: string;
  title: readonly string[];
  description: string;
  services: readonly Service[];
  variant: GroupVariant;
  art: readonly ArtAsset[];
  ctaTitle: string;
  ctaCopy: string;
};

const ORDER_URL = "https://t.me/lisiy_bob";

export function ServiceGroupCard({
  number,
  label,
  title,
  description,
  services,
  variant,
  art,
  ctaTitle,
  ctaCopy,
}: ServiceGroupCardProps) {
  const entranceDirection = number === "02" ? 1 : -1;

  return (
    <motion.div
      className={`services-group-slot services-group-slot--${variant}`}
      variants={workersDirectionalReveal(entranceDirection > 0 ? "right" : "left")}
    >
      <article className={`services-group services-group--${variant}`}>
        <span className="services-group-light" aria-hidden="true" />
        <span className="services-group-corners" aria-hidden="true" />
        <span className="services-group-art" aria-hidden="true">
          <span className="services-group-art-stage">
            {art.map((asset, index) => (
              <img
                src={asset.src}
                alt=""
                width={280}
                height={280}
                loading="lazy"
                className={`services-group-art-${asset.role}`}
                key={`${asset.src}-${index}`}
              />
            ))}
          </span>
        </span>

        <header className="services-group-header">
          <span className="services-group-number">{number}</span>
          <span className="services-group-label">{label}</span>
          <span className="services-group-count">
            {String(services.length).padStart(2, "0")} направлений
          </span>
        </header>

        <div className="services-group-intro">
          <h2 aria-label={title.join(" ")}>
            {title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
          <p>{description}</p>
        </div>

        <nav className="services-group-links" aria-label={`Услуги: ${title.join(" ")}`}>
          {services.map((service, index) => (
            <Link to={service.path} className="services-group-link" key={service.id}>
              <span className="services-group-link-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="services-group-link-copy">
                <strong>{service.title}</strong>
                <small>{service.short}</small>
              </span>
              <span className="services-group-link-arrow" aria-hidden="true">
                <ArrowUpRight />
              </span>
            </Link>
          ))}
        </nav>

        <a className="services-group-cta" href={ORDER_URL} target="_blank" rel="noreferrer">
          <span>
            <strong>{ctaTitle}</strong>
            <small>{ctaCopy}</small>
          </span>
          <span className="services-group-cta-action">
            Обсудить проект
            <span className="services-inline-arrow" aria-hidden="true">
              <ArrowUpRight />
            </span>
          </span>
        </a>
      </article>
    </motion.div>
  );
}
