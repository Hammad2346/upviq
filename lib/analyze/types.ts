export type { Freelancer as FreelancerProfile } from "@/lib/dataStructuring";

export type ParameterScore = {
  score: number;
  maxScore: number;
  percentage: number;
  reasoning: string;
};

export type AnalyzeResult = {
  profileId: string;
  name: string;
  overallScore: number;
  parameters: {
    titleOptimization:  ParameterScore;
    overviewQuality:    ParameterScore;
    skillTagsCoverage:  ParameterScore;
    ratePositioning:    ParameterScore;
    engagementSignals:  ParameterScore;
  };
  benchmarks: {
    avgRateTopProfiles:   number;
    avgJobSuccessTop:     number;
    commonSkillsInTop10:  string[];
    topRatedCountInTop10: number;
  };
};

export type RewriteResult = {
  id: number;
  user_id: number;
  freelancer_profile_id: number;
  suggested_title: string;
  title_reason: string;
  suggested_overview: string;
  overview_reason: string;
  skills_reason: string;
  skills: Array<{
    id: number;
    skill: string;
    skill_type: "missing" | "reorder";
    position: number;
  }>;
  created_at: string;
  updated_at: string;
};