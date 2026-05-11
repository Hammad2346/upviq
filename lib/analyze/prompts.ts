import type { FreelancerProfile } from "./types";

export function buildScoringPrompt(
  userProfile: FreelancerProfile,
  topProfiles: FreelancerProfile[]
): string {
  const topSummaries = topProfiles.map((p, i) => `
--- Top Performer #${i + 1} ---
Name: ${p.name}
Title: ${p.title}
Rate: $${p.rate}/hr
Job Success: ${p.jobSuccess}%
Top Rated: ${p.hasTopRated}
Skills: ${p.skills.join(", ")}
Overview (first 300 chars): ${p.description?.slice(0, 300) ?? "N/A"}
  `.trim()).join("\n\n");

  return `
You are an expert Upwork profile analyst. You will score a freelancer's profile across 5 parameters based on how it compares to the top 10 performing profiles in the same niche.

## Scoring Parameters

1. Title Optimization — max 23 points
   - Is the title keyword-rich and niche-specific?
   - Does it highlight a specialization like top performers?
   - Does it avoid generic terms like "freelancer" or "developer"?

2. Overview Quality — max 29 points
   - Does it clearly communicate value proposition in the first 2 lines?
   - Is it specific about experience, results, and technologies?
   - Does it avoid filler phrases and emoji clutter?
   - Does it mention measurable outcomes?

3. Skill Tags Coverage — max 18 points
   - Do the skills match what clients search for in this niche?
   - Are the most in-demand skills from top profiles present?
   - Are there irrelevant or weak skill tags diluting the profile?

4. Rate Positioning — max 12 points
   - Is the rate competitive relative to top performers with similar success rates?
   - Is it appropriately priced for the niche (not too low, not pricing out)?

5. Engagement Signals — max 18 points
   - Job success rate strength
   - Top Rated badge presence
   - Number of related jobs completed
   - Availability signal

## User Profile to Score
Name: ${userProfile.name}
Title: ${userProfile.title}
Rate: $${userProfile.rate}/hr
Job Success: ${userProfile.jobSuccess}%
Top Rated: ${userProfile.hasTopRated}
Available Now: ${userProfile.hasAvailableNow}
Related Jobs: ${userProfile.jobsRelatedCount}
Skills: ${userProfile.skills.join(", ")}
Overview: ${userProfile.description?.slice(0, 800) ?? "N/A"}

## Top 10 Performing Profiles (Benchmark Context)
${topSummaries}

## Instructions
Return ONLY a valid JSON object. No markdown, no explanation, no backticks. Exactly this shape:
{
  "titleOptimization":  { "score": <0-23>,  "reasoning": "<string>" },
  "overviewQuality":    { "score": <0-29>,  "reasoning": "<string>" },
  "skillTagsCoverage":  { "score": <0-18>,  "reasoning": "<string>" },
  "ratePositioning":    { "score": <0-12>,  "reasoning": "<string>" },
  "engagementSignals":  { "score": <0-18>,  "reasoning": "<string>" }
}
  `.trim();
}

export function buildSuggestionsPrompt(
  userProfile: FreelancerProfile,
  topProfiles: FreelancerProfile[]
): string {
  const topTitles   = topProfiles.map(p => `- ${p.title}`).join("\n");
  const topSkills   = [...new Set(topProfiles.flatMap(p => p.skills))].slice(0, 30).join(", ");

  return `
You are an expert Upwork profile optimizer. Based on the top performing profiles in this niche, generate specific rewrite suggestions for the user's profile.

## Top Performer Titles
${topTitles}

## Most Common Skills Across Top Performers
${topSkills}

## User Profile
Title: ${userProfile.title}
Skills: ${userProfile.skills.join(", ")}
Overview: ${userProfile.description?.slice(0, 800) ?? "N/A"}

## Instructions
Return ONLY a valid JSON object. No markdown, no explanation, no backticks. Exactly this shape:
{
  "title": {
    "rewritten": "<improved title string>",
    "reason": "<why this is better>"
  },
  "overview": {
    "rewritten": "<improved first 2-3 sentences of overview>",
    "reason": "<what was weak and what changed>"
  },
  "skills": {
    "missing": ["<skill>", "<skill>"],
    "reorder": ["<most important first>", "...top 8 skills in priority order"],
    "reason": "<explanation>"
  }
}
  `.trim();
}