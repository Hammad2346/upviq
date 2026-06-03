import type { FreelancerProfile } from "./types";

export function buildScoringPrompt(
  userProfile: FreelancerProfile,
  topProfiles: FreelancerProfile[]
): string {
  const avgRate = Math.round(
    topProfiles.reduce((s, p) => s + (p.rate ?? 0), 0) / topProfiles.length
  );
  const avgJobSuccess = Math.round(
    topProfiles.reduce((s, p) => s + (p.jobSuccess ?? 0), 0) / topProfiles.length
  );
  const topRatedCount = topProfiles.filter((p) => p.hasTopRated).length;

  const skillFrequency: Record<string, number> = {};
  topProfiles.forEach((p) =>
    p.skills?.forEach((s) => {
      skillFrequency[s] = (skillFrequency[s] ?? 0) + 1;
    })
  );
  const topSkills = Object.entries(skillFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([s]) => s)
    .join(", ");

  const topTitles = topProfiles.map((p) => p.title).join(" | ");

  const userSkillSet = new Set(userProfile.skills.map((s) => s.toLowerCase()));
  const missingSkills = Object.entries(skillFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .filter(([s]) => !userSkillSet.has(s.toLowerCase()))
    .map(([s]) => s);

  return `You are a senior Upwork marketplace analyst. Score this freelancer profile against the top 10 performers in their niche. Be critical. Do not inflate scores.

## NICHE BENCHMARK
- Avg rate: $${avgRate}/hr | Avg job success: ${avgJobSuccess}% | Top Rated: ${topRatedCount}/10
- Top titles: ${topTitles}
- High-frequency skills: ${topSkills}

## USER PROFILE
Title: ${userProfile.title}
Rate: $${userProfile.rate}/hr | Job Success: ${userProfile.jobSuccess}% | Top Rated: ${userProfile.hasTopRated} | Available Now: ${userProfile.hasAvailableNow}
Jobs completed in niche: ${userProfile.jobsRelatedCount}
Skills: ${userProfile.skills.join(", ")}
Overview (first 800 chars):
${userProfile.description?.slice(0, 800) ?? "N/A"}

## PRE-COMPUTED (use these directly, do not recalculate)
- Skills user is missing from top performers: ${missingSkills.join(", ")}
- Rate vs benchmark: user $${userProfile.rate}/hr vs avg $${avgRate}/hr (${userProfile.rate > avgRate ? "+" : ""}${userProfile.rate - avgRate}/hr)
- Job success vs benchmark: ${userProfile.jobSuccess}% vs ${avgJobSuccess}% avg

## SCORING

### 1. titleOptimization — max 23 pts
- Keyword specificity for how clients search in this niche (0–8)
- Niche clarity vs generic (0–7)
- Competitive alignment vs top titles above (0–8)
Deduct for: vague words (expert/professional/freelancer), missing platform/tech keywords

### 2. overviewQuality — max 29 pts
- Hook: first 2 sentences answer what/for whom/what outcome in <300 chars (0–8)
- Specificity: concrete tech, platforms, methodologies (0–7)
- Outcome language: results not tasks (0–7)
- Scannability: headers/bullets/clear sections (0–4)
- CTA: specific confident close (0–3)
Deduct for: filler phrases, vague claims, walls of text

### 3. skillTagsCoverage — max 18 pts
- Match rate vs top 10 most common niche skills (0–8)
- Priority ordering: highest-value skills listed first (0–5)
- Tag quality: relevant, no dilution (0–5)
The missing skills are already listed above — use them directly in reasoning.

### 4. ratePositioning — max 12 pts
- Within ±20% of niche avg $${avgRate}/hr (0–5)
- Rate-to-signal ratio: makes sense vs job success + badge (0–4)
- Strategic positioning: not underpricing or overpricing without justification (0–3)

### 5. engagementSignals — max 18 pts
- Job success vs ${avgJobSuccess}% niche avg (0–6)
- Top Rated badge (0–5)
- Jobs completed in niche: volume = trust (0–4)
- Available Now (0–3)

## REASONING RULES
- 2–3 sentences per parameter
- Lead with what is WRONG and why it costs points — criticism first, praise minimal
- Be specific: quote actual title words, cite actual numbers, name actual skills
- For skillTagsCoverage end with: "Missing high-value skills: X, Y, Z. Add immediately: [skill1, skill2, skill3]"
- Never write vague praise like "good overview" — state exactly what is weak and what fixing it would do to the score

## OUTPUT
Return ONLY valid JSON, no markdown, no backticks.

{
  "titleOptimization":  { "score": <0-23>, "reasoning": "<2-3 sentences, criticism-first, specific>" },
  "overviewQuality":    { "score": <0-29>, "reasoning": "<2-3 sentences, criticism-first, specific>" },
  "skillTagsCoverage":  { "score": <0-18>, "reasoning": "<2-3 sentences, ends with Missing high-value skills>" },
  "ratePositioning":    { "score": <0-12>, "reasoning": "<2-3 sentences, criticism-first, specific>" },
  "engagementSignals":  { "score": <0-18>, "reasoning": "<2-3 sentences, criticism-first, specific>" }
}`.trim();
}

export function buildSuggestionsPrompt(
  userProfile: FreelancerProfile,
  topProfiles: FreelancerProfile[],
  scoringResults: Record<string, { score: number; reasoning: string }>
): string {
  const topTitles = topProfiles.map((p) => `- ${p.title}`).join("\n");

  const skillFrequency: Record<string, number> = {};
  topProfiles.forEach((p) =>
    p.skills?.forEach((s) => {
      skillFrequency[s] = (skillFrequency[s] ?? 0) + 1;
    })
  );
  const topSkills = Object.entries(skillFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([s]) => s)
    .join(", ");

  const topOverviews = topProfiles
    .filter((p) => p.description)
    .slice(0, 2)
    .map((p, i) => `### Top Performer ${i + 1}\n${p.description?.slice(0, 300)}`)
    .join("\n\n");

  const maxScores: Record<string, number> = {
    titleOptimization: 23,
    overviewQuality: 29,
    skillTagsCoverage: 18,
    ratePositioning: 12,
    engagementSignals: 18,
  };

  const priorities = Object.entries(scoringResults)
    .sort((a, b) => {
      const pctA = a[1].score / (maxScores[a[0]] ?? 100);
      const pctB = b[1].score / (maxScores[b[0]] ?? 100);
      return pctA - pctB;
    })
    .map(([key, val]) => {
      const pct = Math.round((val.score / (maxScores[key] ?? 100)) * 100);
      const flag =
        pct < 50
          ? "CRITICAL — rewrite must directly fix this"
          : pct < 75
          ? "IMPORTANT — meaningful improvement needed"
          : "STRONG — preserve what works, minor polish only";
      return `- ${key} (${pct}%): ${flag}\n  Weakness: ${val.reasoning}`;
    })
    .join("\n");

  return `You are a world-class Upwork profile strategist. Produce surgical, high-impact rewrites based on the scoring analysis below.

## PRIORITY FIXES (ordered worst to best — address CRITICAL items first)
${priorities}

## WINNING TITLES IN THIS NICHE
${topTitles}

## HIGH-VALUE SKILLS IN THIS NICHE
${topSkills}

## TOP PERFORMER OVERVIEW SAMPLES (study hook structure and tone)
${topOverviews}

## USER CURRENT PROFILE
Title: ${userProfile.title}
Skills: ${userProfile.skills.join(", ")}
Overview:
${userProfile.description?.slice(0, 1200) ?? "N/A"}

## REWRITE RULES

### TITLE
- Max 10 words, lead with highest-value skill or outcome
- Match keyword density of winning titles above
- No filler: expert / passionate / dedicated / professional
- Directly fix the CRITICAL/IMPORTANT weaknesses flagged above
- Do NOT copy a top performer title — synthesize the best elements

### OVERVIEW
- Must be AT LEAST as long as the original — never shorten
- Keep every specific tech, platform, credential, and capability from the original
- Rewrite the opening hook: first 2 sentences must answer what/for whom/what outcome in <300 chars
- Add outcome language where missing: "I build X that [outcome]" not "I build X"
- Preserve emoji headers if present — they aid scannability
- Remove only genuine filler: "I am passionate about…", "Feel free to reach out"
- End with a strong specific CTA
- Fix every weakness called out in the scoring analysis

### SKILLS
- Use the missing skills from skillTagsCoverage reasoning — these are confirmed high-value gaps
- Reorder: highest search-volume / highest-value skills first
- Return top 15 in priority order

## OUTPUT
Return ONLY valid JSON, no markdown, no backticks.

{
  "title": {
    "rewritten": "<improved title, max 10 words>",
    "reason": "<exactly what changed and why it will perform better>"
  },
  "overview": {
    "rewritten": "<full improved overview, at least as long as original>",
    "reason": "<what was weak, what changed, what specific improvements were made>"
  },
  "skills": {
    "missing": ["<high-value skill from top performers user is missing>"],
    "reorder": ["<skill 1>", "<skill 2>"],
    "reason": "<which skills moved up, which added, and why>"
  }
}`.trim();
}