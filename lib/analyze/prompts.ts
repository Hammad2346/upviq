import type { FreelancerProfile } from "./types";

export function buildScoringPrompt(
  userProfile: FreelancerProfile,
  topProfiles: FreelancerProfile[]
): string {
  const topSummaries = topProfiles.map((p, i) => `
--- Top Performer #${i + 1} ---
Title: ${p.title}
Rate: $${p.rate}/hr
Job Success: ${p.jobSuccess}%
Top Rated: ${p.hasTopRated}
Skills: ${p.skills.join(", ")}
Overview (first 400 chars): ${p.description?.slice(0, 400) ?? "N/A"}
  `.trim()).join("\n\n");

  const avgRate = Math.round(topProfiles.reduce((s, p) => s + (p.rate ?? 0), 0) / topProfiles.length);
  const avgJobSuccess = Math.round(topProfiles.reduce((s, p) => s + (p.jobSuccess ?? 0), 0) / topProfiles.length);
  const topRatedCount = topProfiles.filter(p => p.hasTopRated).length;
  const allTopSkills = [...new Set(topProfiles.flatMap(p => p.skills))].slice(0, 30).join(", ");

  return `
You are a senior Upwork marketplace analyst with deep knowledge of how Upwork's search ranking algorithm works and what signals clients use to make hiring decisions. You have reviewed thousands of profiles across every category.

Your task: score the user's profile across 5 parameters by comparing it against the top 10 performing profiles in their exact niche. Be precise, critical, and fair. Do not inflate scores — a score should reflect real competitive standing, not potential.

---

## BENCHMARK SUMMARY (top 10 in this niche)
- Average hourly rate: $${avgRate}/hr
- Average job success: ${avgJobSuccess}%
- Top Rated badge: ${topRatedCount}/10 profiles have it
- Most common skills: ${allTopSkills}

## TOP 10 PROFILES IN DETAIL
${topSummaries}

---

## USER PROFILE
Title: ${userProfile.title}
Rate: $${userProfile.rate}/hr
Job Success: ${userProfile.jobSuccess}%
Top Rated: ${userProfile.hasTopRated}
Available Now: ${userProfile.hasAvailableNow}
Related Jobs Completed: ${userProfile.jobsRelatedCount}
Skills: ${userProfile.skills.join(", ")}
Overview (first 1000 chars):
${userProfile.description?.slice(0, 1000) ?? "N/A"}

---

## SCORING PARAMETERS

### 1. Title Optimization — max 23 points
Award points based on:
- Keyword specificity: does it match how clients search in this niche? (0–8 pts)
- Niche clarity: does it immediately communicate a specialization vs being generic? (0–7 pts)
- Competitive alignment: how does it compare to top performer titles in structure and impact? (0–8 pts)
Deduct for: vague words ("expert", "professional", "freelancer"), missing platform/tech keywords, titles that could apply to any niche

### 2. Overview Quality — max 29 points
Award points based on:
- Hook strength: do the first 2 sentences answer what you do, for whom, and what outcome in <300 chars? (0–8 pts)
- Specificity: does it mention concrete technologies, platforms, methodologies, and experience depth? (0–7 pts)
- Outcome language: does it describe results and impact, not just tasks? (0–7 pts)
- Scannability and structure: headers, bullets, or clear sections that make it easy to read? (0–4 pts)
- CTA quality: does it end with a specific, confident call to action? (0–3 pts)
Deduct for: filler phrases ("passionate about", "feel free"), vague claims without evidence, walls of text with no structure

### 3. Skill Tags Coverage — max 18 points
Award points based on:
- Match rate: what % of the top 10 most common niche skills does the user have? (0–8 pts)
- Priority ordering: are the highest-value skills listed first? (0–5 pts)
- Tag quality: are all tags relevant and high-signal for this niche, no dilution? (0–5 pts)
Deduct for: missing high-frequency skills from top performers, irrelevant or overly broad tags, low-value filler skills

### 4. Rate Positioning — max 12 points
Award points based on:
- Competitive range: is the rate within ±20% of the niche average ($${avgRate}/hr)? (0–5 pts)
- Rate-to-signal ratio: does the rate make sense relative to their job success, badge, and experience signals? (0–4 pts)
- Strategic positioning: neither underpricing (signals low quality) nor severely overpricing without clear justification (0–3 pts)

### 5. Engagement Signals — max 18 points
Award points based on:
- Job Success Score: ${avgJobSuccess}% is the niche average — score relative to that (0–6 pts)
- Top Rated badge: present = full credit, absent = partial (0–5 pts)
- Jobs completed in niche: volume signals proven demand and trust (0–4 pts)
- Available Now: active availability is a ranking signal (0–3 pts)

---

## REASONING RULES
- Each reasoning string must be 2–4 sentences
- Be specific: reference actual title words, specific skills, actual rate numbers, actual job success %
- Compare directly to top performers: "Top performers average $${avgRate}/hr, user is at $${userProfile.rate}/hr which..."
- Never be vague: "good overview" is not acceptable reasoning — explain exactly what is strong or weak and why it affects score

---

## OUTPUT FORMAT
Return ONLY a valid JSON object. No markdown, no backticks, no explanation outside the JSON.

{
  "titleOptimization":  { "score": <0-23>,  "reasoning": "<2-4 sentences, specific, comparative>" },
  "overviewQuality":    { "score": <0-29>,  "reasoning": "<2-4 sentences, specific, comparative>" },
  "skillTagsCoverage":  { "score": <0-18>,  "reasoning": "<2-4 sentences, specific, comparative>" },
  "ratePositioning":    { "score": <0-12>,  "reasoning": "<2-4 sentences, specific, comparative>" },
  "engagementSignals":  { "score": <0-18>,  "reasoning": "<2-4 sentences, specific, comparative>" }
}
  `.trim();
}

export function buildSuggestionsPrompt(
  userProfile: FreelancerProfile,
  topProfiles: FreelancerProfile[]
): string {
  const topTitles = topProfiles.map(p => `- ${p.title}`).join("\n");
  const topSkills = [...new Set(topProfiles.flatMap(p => p.skills))].slice(0, 30).join(", ");
  const topOverviews = topProfiles
    .filter(p => p.description)
    .slice(0, 3)
    .map((p, i) => `### Top Performer ${i + 1}\n${p.description?.slice(0, 400)}`)
    .join("\n\n");

  return `
You are a world-class Upwork profile strategist who has helped thousands of freelancers reach Top Rated Plus status. You deeply understand Upwork's search algorithm, client psychology, and what separates a $150/hr freelancer from a $30/hr one.

Your task: analyze the user's profile against the top 10 performers in their niche and produce surgical, high-impact rewrites — not summaries, not shorter versions. Better versions.

---

## TOP PERFORMER TITLES (what is winning in this niche right now)
${topTitles}

## MOST COMMON SKILLS ACROSS TOP PERFORMERS
${topSkills}

## TOP PERFORMER OVERVIEW SAMPLES (study the tone, structure, and hooks)
${topOverviews}

---

## USER'S CURRENT PROFILE

Title: ${userProfile.title}
Skills: ${userProfile.skills.join(", ")}
Overview:
${userProfile.description?.slice(0, 1200) ?? "N/A"}

---

## YOUR REWRITE RULES — FOLLOW THESE EXACTLY

### TITLE REWRITE
- Study the top performer titles above — match their keyword density and specificity
- Lead with the highest-value skill or outcome (e.g. "Unity Game Developer" not "Experienced Developer")
- Include platform, niche, or tech stack keywords clients actually search for
- Max 10 words, no filler words like "expert", "passionate", "dedicated"
- Do NOT copy a top performer title — synthesize the best elements

### OVERVIEW REWRITE
- CRITICAL: The rewritten overview must be AT LEAST as long as the original. Never shorten it.
- Keep every specific detail, technology, capability, and credential from the original
- Restructure the opening hook — the first 2 sentences must answer: "What do you do, for whom, and what outcome do you deliver?" within 300 characters (this is what clients see before clicking "more")
- After the hook, expand on the original content — do not compress or omit sections
- Add outcome-oriented language where missing: instead of "I build X" write "I build X that [outcome]"
- If the original uses emoji headers (🔥, 🧩, ⭐), keep them — they aid scannability
- Mirror the tone and energy of the top performer overviews above
- Remove only genuine filler ("I am passionate about...", "Feel free to reach out")
- End with a strong CTA that creates urgency or specificity
- The rewritten overview should feel like an upgrade of the original — same voice, higher impact

### SKILLS REWRITE
- Cross-reference user skills against top performer skills
- Identify high-value missing skills the user likely has based on their overview
- Reorder to put highest search-volume / highest-value skills first
- Return top 15 skills in priority order

---

## OUTPUT FORMAT
Return ONLY a valid JSON object. No markdown, no backticks, no explanation outside the JSON.

{
  "title": {
    "rewritten": "<improved title — keyword-rich, specific, max 10 words>",
    "reason": "<exactly what changed and why it will perform better>"
  },
  "overview": {
    "rewritten": "<full improved overview — must be longer than or equal to the original, preserves all detail, stronger hook, outcome language, same structure>",
    "reason": "<what was weak, what changed, what specific improvements were made>"
  },
  "skills": {
    "missing": ["<high-value skill from top performers the user is missing>"],
    "reorder": ["<skill 1>", "<skill 2>", "...top 15 in priority order"],
    "reason": "<which skills were moved up, which added, and why>"
  }
}
  `.trim();
}