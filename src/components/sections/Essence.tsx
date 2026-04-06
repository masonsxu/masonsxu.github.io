import { ScrollReveal, SectionLabel } from "../ScrollReveal";

export function Essence() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Rich atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-gold/[0.025] blur-[140px] animate-[pulseGlow_12s_ease-in-out_infinite]" />
        <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-gold-deep/[0.035] blur-[120px] animate-[pulseGlow_15s_ease-in-out_5s_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-transparent to-obsidian opacity-60" />
      </div>

      <div className="section-container relative z-10">
        <ScrollReveal>
          <SectionLabel>灵魂底色 / The Essence</SectionLabel>
          <h2 className="text-3xl md:text-5xl font-semibold mt-1 leading-tight">
            设计与架构的<br />
            <span className="gold-shimmer">华丽交响</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <p className="text-foreground/50 text-[15px] leading-[1.9] mt-8 max-w-2xl">
            我认为，一段优雅的代码应当如顶级奢侈品般，在隐秘处追求极致的细节。
            <span className="text-foreground/80 font-medium">Midnight Pearl</span> 不仅仅是一套配色方案，
            它代表了我对系统架构的追求：深邃、稳定且散发着理性的光芒。
          </p>
        </ScrollReveal>

        {/* Design Principles — Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[
            {
              color: "#0C0C0E",
              border: "border-white/[0.08]",
              name: "Obsidian",
              meaning: "Stability / 稳健",
              desc: "如同分布式系统的基石，沉稳可靠，承载一切",
            },
            {
              color: "#FCFCFC",
              border: "border-white/[0.15]",
              name: "Pearl",
              meaning: "Clarity / 纯粹",
              desc: "代码的纯净与逻辑的透明，每一行都经得起审视",
            },
            {
              color: "#D4AF37",
              border: "border-gold/30",
              name: "Gold",
              meaning: "Excellence / 卓越",
              desc: "对细节的极致追求，在隐秘处散发理性的光芒",
            },
          ].map((pillar, i) => (
            <ScrollReveal key={pillar.name} delay={i * 120 + 300}>
              <div className={`rounded-2xl border ${pillar.border} bg-white/[0.015] p-8 text-center transition-all duration-500 hover:bg-white/[0.03]`}>
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-5 border-2"
                  style={{
                    backgroundColor: pillar.color,
                    borderColor: pillar.name === "Gold" ? "#D4AF37" : pillar.name === "Pearl" ? "#FCFCFC" : "#1E1E21",
                    boxShadow: pillar.name === "Gold" ? "0 0 30px rgba(212,175,55,0.2)" : "none",
                  }}
                />
                <h3 className="text-lg font-semibold mb-1">{pillar.name}</h3>
                <p className="text-xs font-mono text-gold/60 tracking-wider mb-3">{pillar.meaning}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Taurus Constellation */}
        <ScrollReveal delay={200}>
          <div className="mt-16 flex flex-col md:flex-row items-center gap-8 rounded-2xl border border-gold/[0.08] bg-gold/[0.015] p-8 md:p-10">
            {/* Taurus symbol */}
            <div className="shrink-0 text-center">
              <div className="text-5xl md:text-6xl gold-text font-light select-none">♉</div>
              <p className="text-xs font-mono text-gold/60 mt-2 tracking-wider">TAURUS</p>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">4.20 — 5.20</p>
            </div>
            <div className="h-px md:h-16 md:w-px w-full bg-gold/10 shrink-0" />
            <div>
              <blockquote className="text-foreground/60 italic text-sm leading-relaxed">
                "Luxury is balance of design and function, much like steady heart of the Bull."
              </blockquote>
              <div className="flex gap-3 mt-4">
                {["Reliable（可靠）", "Artistic（艺术感）"].map((trait) => (
                  <span key={trait} className="text-xs font-mono text-gold/70 bg-gold/[0.06] px-3 py-1 rounded-full">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
