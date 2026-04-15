export type Locale = "zh" | "en";

export interface TranslationSet {
  hero: {
    tagline: string;
    description: string;
    scroll: string;
    stats: readonly { value: string; label: string }[];
  };
  about: {
    label: string;
    highlights: readonly string[];
    paragraph: string;
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
    competencies: readonly { title: string; desc: string }[];
    performanceBefore: string;
    performanceAfter: string;
    metrics: readonly string[];
    domainsLabel: string;
    domains: readonly string[];
  };
  essence: {
    label: string;
    titleBefore: string;
    titleAccent: string;
    description: string;
    pillars: readonly { meaning: string; desc: string }[];
    taurusQuote: string;
    taurusTraits: readonly string[];
  };
  showreel: {
    label: string;
    title: string;
    accent: string;
    description: string;
    videos: readonly { title: string; desc: string }[];
  };
  timeline: {
    careerLabel: string;
    careerTitle: string;
    careerAccent: string;
    careerItems: readonly { role: string; points: readonly string[] }[];
    careerKeywords: readonly string[];
    educationLabel: string;
    school: string;
    major: string;
    honorsLabel: string;
    awards: readonly { text: string; detail?: string }[];
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
    prs: readonly { desc: string }[];
  };
  contact: {
    label: string;
    title: string;
    accent: string;
    resumeValue: string;
    copyright: string;
  };
}
