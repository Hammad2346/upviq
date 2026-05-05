export function scoreProfile(user: any, analysis: any) {
  let score = 100;
  score -= analysis.missingSkills.length * 3;

  if (!user.title || user.title.length < 30) score -= 10;

  if (!user.description || user.description.length < 200) score -= 15;

  if (user.jobSuccess >= 90) score += 5;

  return Math.max(0, Math.min(100, score));
}