export type { Freelancer as FreelancerProfile } from "@/lib/dataStructuring";

export type ParameterScore = {
  score: number;       // actual points scored
  maxScore: number;    // max possible for this parameter
  percentage: number;  // score/maxScore * 100
  reasoning: string;   // why this score was given
};

export type AnalyzeResult = {
  profileId: string;
  name: string;
  overallScore: number; // 0–100
  parameters: {
    titleOptimization:  ParameterScore;
    overviewQuality:    ParameterScore;
    skillTagsCoverage:  ParameterScore;
    ratePositioning:    ParameterScore;
    engagementSignals:  ParameterScore;
  };
  suggestions: {
    title: {
      current:   string;
      rewritten: string;
      reason:    string;
    };
    overview: {
      current:   string;
      rewritten: string;
      reason:    string;
    };
    skills: {
      current:  string[];
      missing:  string[];
      reorder:  string[];
      reason:   string;
    };
  };
  benchmarks: {
    avgRateTopProfiles:     number;
    avgJobSuccessTop:       number;
    commonSkillsInTop10:    string[];
    topRatedCountInTop10:   number;
  };
};