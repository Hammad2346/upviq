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

  const overviewCharCount = userProfile.description?.length ?? 0;
  const first250 = userProfile.description?.slice(0, 250) ?? "N/A";

  return `You are a senior Upwork marketplace analyst. Score this freelancer profile against the top 10 performers in their niche. Be critical. Do not inflate scores.

## UPWORK PLATFORM LIMITS (enforced — violations cost points)
- Title: 70 characters hard cap. Under 40 chars = wasted keyword space. Over 70 = truncated by platform.
- Overview: 5,000 characters hard cap. First 250 characters are the only content visible before "Read More" fold.
- Skills: 20 tags maximum.

## NICHE BENCHMARK
- Avg rate: $${avgRate}/hr | Avg job success: ${avgJobSuccess}% | Top Rated: ${topRatedCount}/10
- Top titles: ${topTitles}
- High-frequency skills: ${topSkills}

## USER PROFILE
Title: ${userProfile.title} [${userProfile.title?.length ?? 0} chars]
Rate: $${userProfile.rate}/hr | Job Success: ${userProfile.jobSuccess}% | Top Rated: ${userProfile.hasTopRated} | Available Now: ${userProfile.hasAvailableNow}
Jobs completed in niche: ${userProfile.jobsRelatedCount}
Skills (${userProfile.skills.length}/20): ${userProfile.skills.join(", ")}
Overview length: ${overviewCharCount} characters
Overview first 250 chars (what clients see before fold):
${first250}
Overview first 800 chars (for quality assessment):
${userProfile.description?.slice(0, 800) ?? "N/A"}

## PRE-COMPUTED (use these directly, do not recalculate)
- Skills user is missing from top performers: ${missingSkills.join(", ")}
- Rate vs benchmark: user $${userProfile.rate}/hr vs avg $${avgRate}/hr (${userProfile.rate > avgRate ? "+" : ""}${userProfile.rate - avgRate}/hr)
- Job success vs benchmark: ${userProfile.jobSuccess}% vs ${avgJobSuccess}% avg
- Unused skill slots: ${20 - userProfile.skills.length} (each empty slot is a lost search keyword)

## SCORING

### 1. titleOptimization — max 23 pts
- Keyword specificity for how clients search in this niche (0–8)
- Niche clarity vs generic (0–7)
- Competitive alignment vs top titles above (0–8)
Deduct for: vague words (expert/professional/freelancer/passionate/dedicated), missing platform/tech keywords, title under 40 chars (wasted keyword space), title over 70 chars (truncated by platform)

### 2. overviewQuality — max 29 pts
- Hook: first 250 characters answer what/for whom/what outcome — this is the fold clients see (0–8)
- Specificity: concrete tech, platforms, methodologies (0–7)
- Outcome language: results not tasks (0–7)
- Scannability: headers/bullets/clear sections (0–4)
- CTA: specific confident close (0–3)
Deduct for: opening with "I am a..." or "I have X years...", filler phrases, vague claims, walls of text, hook that doesn't land within first 250 chars

### 3. skillTagsCoverage — max 18 pts
- Match rate vs top 10 most common niche skills (0–8)
- Priority ordering: highest-value skills listed first (0–5)
- Tag quality: relevant, no dilution, slots fully used (0–5)
The missing skills and unused slots are already listed above — use them directly in reasoning.

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

  const skillsReasoning = scoringResults.skillTagsCoverage?.reasoning ?? "";
  const missingMatch = skillsReasoning.match(/Missing high-value skills:\s*([^\n.]+)/i);
  const confirmedMissing = missingMatch
    ? missingMatch[1]
        .replace(/Add immediately:.*$/i, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const currentOverviewLength = userProfile.description?.length ?? 0;
  const targetMin = Math.max(800, Math.round(currentOverviewLength * 0.85));
  const targetMax = Math.min(2500, Math.round(currentOverviewLength * 1.15));

  return `You are a world-class Upwork profile strategist. Produce surgical, high-impact rewrites based on the scoring analysis below.

These weaknesses are FINAL — do not re-evaluate scores or re-derive gaps. Only fix what is listed here.

## UPWORK PLATFORM LIMITS — HARD CONSTRAINTS, NON-NEGOTIABLE
- Title: 70 characters maximum. Count your characters before returning. Truncation at 70 is enforced by the platform.
- Overview: 5,000 characters maximum. Target 1,500–2,500 characters — do not pad beyond this.
- Skills: 20 tags maximum. Return exactly 20 — filling all slots maximises search visibility.

## PRIORITY FIXES (ordered worst to best — address CRITICAL items first)
${priorities}

## WINNING TITLES IN THIS NICHE
${topTitles}

## HIGH-VALUE SKILLS IN THIS NICHE
${topSkills}

## TOP PERFORMER OVERVIEW SAMPLES (study hook structure and tone)
${topOverviews}

## USER CURRENT PROFILE
Title: ${userProfile.title} [${userProfile.title?.length ?? 0} chars]
Skills (${userProfile.skills.length}/20): ${userProfile.skills.join(", ")}
Overview [${currentOverviewLength} chars]:
${userProfile.description?.slice(0, 1200) ?? "N/A"}

## REWRITE RULES

### TITLE
- Hard limit: 70 characters — count before returning, truncation is enforced by the platform
- Use as close to 70 characters as possible — every unused character is a lost keyword
- Preferred structure: Primary Skill | Secondary Skill | Niche or Tool
- Your title MUST contain at least one exact keyword phrase from the winning titles above
- If the user's current title already contains a strong keyword, keep it — only replace weak words
- No filler: expert / passionate / dedicated / professional / skilled
- Do NOT copy a top performer title — synthesize the best elements
- Directly fix the CRITICAL/IMPORTANT title weaknesses flagged above

### OVERVIEW
- Hard cap: 5,000 characters — never exceed
- Target length: ${targetMin}–${targetMax} characters — do not pad beyond this to hit a word count
- CRITICAL: first 250 characters are the only content clients see before "Read More" — the hook must land entirely within this window
- The first 250 chars must contain: primary keyword + what you do + who for + one concrete outcome or number
- Do NOT open with "I am a..." or "I have X years..." — open with a result, a number, or the client's problem
- Keep every specific tech, platform, credential, and capability from the original
- Add outcome language where missing: "I build X that [concrete outcome]" not "I build X"
- Preserve emoji headers if present — they aid scannability
- Remove only genuine filler: "I am passionate about…", "Feel free to reach out", "I am a hard worker"
- End with a strong specific CTA
- Fix every weakness called out in the scoring analysis above

### SKILLS
- Current skills in order: ${userProfile.skills.join(", ")}
- Confirmed missing high-value skills (ADD THESE): ${confirmedMissing.length > 0 ? confirmedMissing.join(", ") : "none identified — reorder existing skills only"}
- Rules:
  - Start from the current skills list — do not drop any existing skill unless it is genuinely irrelevant spam
  - Insert the confirmed missing skills at the highest-priority positions
  - Fill all 20 slots — if fewer than 20 skills exist after merging, add the next highest-frequency niche skills from the list above
  - "missing" array = only the confirmed missing skills listed above, nothing else invented
  - "reorder" array = the complete final ordered list of all 20 skills (existing + missing merged, highest value first)

## OUTPUT
Return ONLY valid JSON, no markdown, no backticks.

{
  "title": {
    "rewritten": "<improved title, strictly under 70 characters — count before returning>",
    "reason": "<what changed, which keywords added, why it will rank better>"
  },
  "overview": {
    "rewritten": "<full improved overview, first 250 chars must hook the client, target ${targetMin}–${targetMax} chars total>",
    "reason": "<what was weak, what changed, what specific improvements were made>"
  },
  "skills": {
    "missing": ["<only confirmed missing skills from the list above — do not invent>"],
    "reorder": ["<skill 1>", "<skill 2>", "... all 20 in priority order"],
    "reason": "<which skills moved up, which added, why>"
  }
}`.trim();
}