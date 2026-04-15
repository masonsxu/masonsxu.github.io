import { contactLinks } from "../../data/site-content";
import { useTranslation } from "../../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function Contact() {
  const { t } = useTranslation();

  return (
    <section className="section-padding relative">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-xs font-mono text-gold tracking-[0.3em] uppercase block mb-4">
              {t.contact.label}
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold">
              {t.contact.title} <span className="gold-text">{t.contact.accent}</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Contact links */}
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group block rounded-xl border border-white/[0.04] bg-white/[0.015] p-5 text-center transition-all duration-300 hover:border-gold/20 hover:bg-gold/[0.02]"
              >
                <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider block mb-2">
                  {link.label}
                </span>
                <span className="text-sm text-foreground/80 group-hover:text-gold transition-colors duration-300">
                  {link.label === "Resume" ? t.contact.resumeValue : link.value}
                </span>
              </a>
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* Footer */}
      <footer className="mt-24 md:mt-32 border-t border-white/[0.04] pt-10 pb-8">
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <img src='/logo-dark.svg' alt="MASONS.XU" className="h-8 opacity-40 hover:opacity-60 transition-opacity" />
            <p className="text-xs text-muted-foreground/40 font-mono">
              {t.contact.copyright}
            </p>
          </div>
        </div>
      </footer>
    </section>
  );
}
