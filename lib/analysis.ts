export function buildSkillStats(dataset: any[]) {
  const skillCount: Record<string, number> = {};

  dataset.forEach(profile => {
    profile.skills.forEach((skill: string) => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });
  });

  return skillCount;
}

export function analyzeUser(user: any, dataset: any[]) {
  const skillStats = buildSkillStats(dataset);

  const missingSkills: string[] = [];
  const userSkills = user.skills || [];

  Object.entries(skillStats).forEach(([skill, count]) => {
    if (count > 2 && !userSkills.includes(skill)) {
      missingSkills.push(skill);
    }
  });

  return {
    missingSkills,
    skillStats,
  };
}