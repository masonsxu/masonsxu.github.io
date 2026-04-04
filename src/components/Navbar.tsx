import { Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { GitHubIcon } from "./GitHubIcon";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrollPercent);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px]">
      <div
        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "";
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight >= docHeight - 50) {
        const lastSection = sections[sections.length - 1];
        if (lastSection) {
          setActiveSection(lastSection.id);
          return;
        }
      }

      sections.forEach((s) => {
        if (scrollY >= (s as HTMLElement).offsetTop - 120) current = s.id;
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    setSheetOpen(false);
    const target = document.querySelector(href);
    if (target) {
      const offsetPosition =
        target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const navLinks = [
    { href: "#projects", label: "架构实践" },
    { href: "#about", label: "架构能力" },
    { href: "#skills", label: "技术域" },
    { href: "#experience", label: "职业经历" },
    { href: "#showreel", label: "动态影集" },
    { href: "#opensource", label: "开源与教育" },
  ];

  return (
    <nav className="fixed w-full z-50 top-0 glass transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a
          href="#hero"
          onClick={(e) => handleAnchorClick(e, "#hero")}
          className="group"
          aria-label="返回首页首屏"
        >
          <img
            src={theme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"}
            alt="Masons Xu 个人技术作品集 Logo"
            className="h-10 w-auto"
          />
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className={`hover:text-text transition-colors ${activeSection === link.href.slice(1) ? "nav-active" : ""}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-md border border-border/20 text-muted hover:text-primary hover:border-primary/50"
            aria-label={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <a
            href="https://github.com/masonsxu"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-border/20 text-xs font-mono text-muted hover:text-text hover:border-primary/50 transition-all"
          >
            <GitHubIcon size={16} />
            GitHub
          </a>
          <button
            onClick={() => setSheetOpen(true)}
            className="md:hidden text-muted hover:text-text"
          >
            <Menu size={24} />
          </button>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent
              side="right"
              className="w-[300px] bg-bg/95 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, link.href)}
                    className="text-muted hover:text-text text-lg"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <ScrollProgressBar />
    </nav>
  );
}
