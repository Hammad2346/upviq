export type Freelancer = {
  searchUrl: string;
  name: string;
  profileId: string;
  profileUrl: string;
  title: string;
  location: string;
  avatarUrl: string;
  rate: number;
  jobSuccess: number;
  earnings: string;
  hasAvailableNow: boolean;
  hasTopRated: boolean;
  skills: string[];
  description: string;
  jobsRelatedCount: number;
  scrapedAt: string;
};

function getRateBucket(rate: number): string {
  if (rate <= 15) return "budget";
  if (rate <= 35) return "mid";
  if (rate <= 75) return "professional";
  return "expert";
}

function cleanDescription(raw: string): string {
  return raw

    .replace(/"[^"]{0,300}"[\s\S]{0,50}?-\s*\w+\d*\n?/g, "")

    .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")
    .replace(/[\u2600-\u27BF]/gu, "")

    .replace(/^\s{0,4}[\*\-•]\s*$/gm, "")

    .replace(/\n{3,}/g, "\n\n")

    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .trim()

    .slice(0, 600);
}

export function structureFreelancerForVectorDB(f: Freelancer) {
  const cleanedDescription = cleanDescription(f.description ?? "");
  const skillList = f.skills?.join(", ") ?? "";
  const topRated = f.hasTopRated ? "Top Rated freelancer" : "";
  const available = f.hasAvailableNow ? "currently available" : "";
  const badges = [topRated, available].filter(Boolean).join(", ");

  const embeddingText = `
${f.name} is a ${f.title} based in ${f.location}.
${badges ? `They are a ${badges}.` : ""}
They charge $${f.rate}/hr and have a ${f.jobSuccess}% job success rate across ${f.jobsRelatedCount} related jobs.
Core skills: ${skillList}.
${cleanedDescription}
  `
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const metadata = {
    name: f.name ?? "",
    profileId: f.profileId ?? "",
    profileUrl: f.profileUrl ?? "",
    avatarUrl: f.avatarUrl ?? "",
    searchUrl: f.searchUrl ?? "",

    title: f.title ?? "",
    location: f.location ?? "",
    skills: Array.isArray(f.skills) ? f.skills : [],

    rate: typeof f.rate === "number" ? f.rate : 0,
    rateBucket: getRateBucket(typeof f.rate === "number" ? f.rate : 0),
    jobSuccess: typeof f.jobSuccess === "number" ? f.jobSuccess : 0,
    earnings: f.earnings ?? "",
    jobsRelatedCount:
      typeof f.jobsRelatedCount === "number" ? f.jobsRelatedCount : 0,

    hasAvailableNow: f.hasAvailableNow ?? false,
    hasTopRated: f.hasTopRated ?? false,

    scrapedAt: f.scrapedAt ?? "",
  };

  return {
    id: f.profileId,
    embeddingText,
    metadata,
  };
}
