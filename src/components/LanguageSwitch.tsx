import { useTranslation } from "../i18n";

export function LanguageSwitch() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="fixed top-6 right-6 z-40">
      <div className="flex items-center rounded-full border border-gold/20 bg-obsidian/80 backdrop-blur-sm p-0.5">
        <button
          type="button"
          onClick={() => setLocale("zh")}
          aria-label="切换到中文"
          className={`px-3 py-1 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ${
            locale === "zh"
              ? "bg-gold/15 text-gold shadow-[0_0_12px_rgba(212,175,55,0.1)]"
              : "text-muted-foreground/40 hover:text-muted-foreground/70"
          }`}
        >
          中
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          aria-label="Switch to English"
          className={`px-3 py-1 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ${
            locale === "en"
              ? "bg-gold/15 text-gold shadow-[0_0_12px_rgba(212,175,55,0.1)]"
              : "text-muted-foreground/40 hover:text-muted-foreground/70"
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
}
