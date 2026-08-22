import { ArrowUpRight, FileDown, Github, Globe, Mail } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { contactLinks } from "../../../data/site-content";
import { MagneticButton, Reveal } from "../bits";

const ICONS: Record<string, typeof Mail> = {
  Email: Mail,
  GitHub: Github,
  Resume: FileDown,
  Online: Globe,
};

const MARQUEE = ["Go", "Kitex", "Hertz", "Iceberg", "Airflow", "Trino", "Polars", "OpenTelemetry", "Etcd", "Docker", "Kubernetes", "MongoDB"];

export function Connect() {
  const { t } = useTranslation();

  return (
    <section className="w5-section w5-connect" id="contact">
      <div className="w5-container">
        <Reveal>
          <div className="w5-eyebrow">{t.contact.label} — 06</div>
          <h2 className="w5-connect-title">
            {t.contact.title}
            <em>{t.contact.accent}</em>
          </h2>
        </Reveal>
        <div className="w5-connect-grid">
          <Reveal delay={100}>
            <div className="w5-contact-links">
              {contactLinks.map(l => {
                const Icon = ICONS[l.label] ?? Globe;
                return (
                  <a key={l.label} className="w5-contact-link" href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel={l.href.startsWith("http") ? "noreferrer" : undefined}>
                    <Icon size={19} strokeWidth={1.5} />
                    <span>
                      <small>{l.label}</small>
                      <span>{l.value}</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </Reveal>
          <Reveal delay={180}>
            <MagneticButton href="mailto:masonsxu@foxmail.com">
              <ArrowUpRight size={22} strokeWidth={1.5} />
              Say Hello
            </MagneticButton>
          </Reveal>
        </div>
      </div>
      <div className="w5-marquee" aria-hidden="true">
        <div className="w5-marquee-track">
          {[0, 1].map(dup => (
            <span key={dup} style={{ display: "inline-flex" }}>
              {MARQUEE.map(m => <span key={m} style={{ display: "inline-flex", alignItems: "center", gap: 22 }}><b>·</b>{m}</span>)}
            </span>
          ))}
        </div>
      </div>
      <div className="w5-container">
        <footer className="w5-footer-bar">
          <span>{t.contact.copyright}</span>
          <span>masonsxu@go — built with react + canvas2d, no frameworks</span>
        </footer>
      </div>
    </section>
  );
}
