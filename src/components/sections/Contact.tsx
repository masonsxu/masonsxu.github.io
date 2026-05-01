import { contactLinks } from "../../data/site-content";
import { useTranslation } from "../../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function Contact() {
  const { t } = useTranslation();

  return (
    <section className="section-padding relative">
      <div className="section-container">
        <ScrollReveal>
          <div className="silicon-eyebrow justify-center mb-4 mx-auto inline-flex">
            0x0FFE · {t.contact.label}
          </div>
          <div className="text-center">
            <h2 className="font-display font-medium text-3xl md:text-5xl tracking-[-0.04em] leading-[1.0]">
              {t.contact.title}{" "}
              <span className="text-gold">{t.contact.accent}</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* CTA push-button — GitHub is the most valuable signal for a tech portfolio */}
        <ScrollReveal delay={140}>
          <div className="mt-10 flex justify-center">
            <a
              href="https://github.com/masonsxu"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pill btn-gold font-mono text-[12.5px] tracking-[0.16em] uppercase"
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-gold mr-2"
                style={{
                  boxShadow: "0 0 8px rgba(212, 175, 55, 0.7)",
                  animation: "clkBlink 1.4s steps(1) infinite",
                }}
              />
              github.com/masonsxu
              <span className="ml-1">→</span>
            </a>
          </div>
        </ScrollReveal>

        {/* IO Port grid */}
        <ScrollReveal delay={220}>
          <div
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto rounded-md overflow-hidden"
            style={{ boxShadow: "inset 0 0 0 1px rgba(0, 153, 255, 0.14)" }}
          >
            {contactLinks
              .filter((link) => link.label !== "GitHub")
              .map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="group p-5 transition-colors duration-300 hover:bg-white/[0.025] border-r border-b sm:border-b lg:border-b-0 last:border-r-0 sm:[&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r border-blue/8"
              >
                <div className="font-mono text-[9.5px] tracking-[0.22em] uppercase text-gold/85 mb-2.5">
                  {["UART0", "USB0", "I2C0"][i]} · {link.label}
                </div>
                <div className="font-mono text-[12.5px] text-foreground/85 group-hover:text-gold transition-colors truncate leading-snug">
                  {link.label === "Resume" ? t.contact.resumeValue : link.value}
                </div>
              </a>
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* Footer — silk-print bottom edge */}
      <footer
        className="mt-24 md:mt-32 pt-8 pb-6"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(212, 175, 55, 0.025))",
          boxShadow: "inset 0 1px 0 rgba(0, 153, 255, 0.14)",
        }}
      >
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-sm border border-gold/55 text-gold font-display"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                M
              </span>
              <span className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-foreground/50">
                MX-CORE · v2026
              </span>
            </div>
            <p className="font-mono text-[10.5px] text-foreground/35 tracking-[0.14em]">
              {t.contact.copyright}
            </p>
          </div>
        </div>
      </footer>
    </section>
  );
}
