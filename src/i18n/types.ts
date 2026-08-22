export type Locale = "zh" | "en";

export interface TranslationSet {
  hero: {
    tagline: string;
    description: string;
    scroll: string;
    stats: readonly { num: number; suffix: string; label: string }[];
  };
  about: {
    label: string;
    highlights: readonly string[];
    paragraph: readonly { text: string; highlight?: boolean }[];
    quote: string;
    cite: string;
  };
  projects: {
    label: string;
    title: string;
    accent: string;
    description: string;
    items: readonly {
      title: string;
      subtitle: string;
      time: string;
      summary: string;
      highlights: readonly { title: string; desc: string }[];
      metrics: readonly { value: string; label: string }[];
      extras: readonly string[];
    }[];
  };
  architecture: {
    label: string;
    title: string;
    accent: string;
    competencies: readonly { id: string; title: string; desc: string }[];
    performanceBefore: string;
    performanceAfter: string;
    metrics: readonly { id: string; label: string }[];
    domainsLabel: string;
    domains: readonly { id: string; title: string }[];
  };
  timeline: {
    careerLabel: string;
    careerTitle: string;
    careerAccent: string;
    careerItems: readonly {
      company: string;
      subtitle?: string;
      roles: readonly {
        role: string;
        context?: string;
        points: readonly string[];
      }[];
    }[];
    careerKeywords: readonly string[];
    educationLabel: string;
    school: string;
    major: string;
    honorsLabel: string;
    awards: readonly { text: string; detail?: string; year?: string }[];
  };
  community: {
    label: string;
    title: string;
    accent: string;
    featuredTitle: string;
    featuredSubtitle: string;
    featuredDesc: string;
    featuredStats: readonly { value: string; unit: string; label: string }[];
    prTitle: string;
    prs: readonly { id: string; desc: string }[];
  };
  contact: {
    label: string;
    title: string;
    accent: string;
    resumeValue: string;
    copyright: string;
  };
}
