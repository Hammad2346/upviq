import axios from "axios";
import { Freelancer } from "./dataStructuring";

export interface SaveAnalysisInput {
  overallScore: number;
  parameters: {
    titleOptimization:  { score: number; maxScore: number; percentage: number; reasoning: string };
    overviewQuality:    { score: number; maxScore: number; percentage: number; reasoning: string };
    skillTagsCoverage:  { score: number; maxScore: number; percentage: number; reasoning: string };
    ratePositioning:    { score: number; maxScore: number; percentage: number; reasoning: string };
    engagementSignals:  { score: number; maxScore: number; percentage: number; reasoning: string };
  };
  benchmarks: {
    avgRateTopProfiles:   number;
    avgJobSuccessTop:     number;
    commonSkillsInTop10:  string[];
    topRatedCountInTop10: number;
  };
}

export interface AIAnalysisResult {
  id: number;
  user_id: number;
  freelancer_profile_id: number;
  overall_score: number;
  title_score: number;
  title_max_score: number;
  title_percentage: number;
  title_reasoning: string;
  overview_score: number;
  overview_max_score: number;
  overview_percentage: number;
  overview_reasoning: string;
  skills_score: number;
  skills_max_score: number;
  skills_percentage: number;
  skills_reasoning: string;
  rate_score: number;
  rate_max_score: number;
  rate_percentage: number;
  rate_reasoning: string;
  engagement_score: number;
  engagement_max_score: number;
  engagement_percentage: number;
  engagement_reasoning: string;
  avg_rate_top_profiles: number;
  avg_job_success_top: number;
  top_rated_count_in_top10: number;
  created_at: string;
  updated_at: string;
}

export async function saveProfile(userId: number, profile: Freelancer) {
  const { data } = await axios.post("/api/profiles", { user_id: userId, profile });
  return data as { success: boolean; freelancerProfileId: number };
}

export async function saveAnalysis(
  dbProfileId: number,
  userId: number,
  input: SaveAnalysisInput
) {
  const { data } = await axios.post(`/api/profiles/${dbProfileId}/analysis`, {
    user_id: userId,
    ...input,
  });
  return data as { success: boolean; analysisId: number };
}

export async function getAnalysis(dbProfileId: number, userId: number) {
  const { data } = await axios.get(`/api/profiles/${dbProfileId}/analysis`, {
    params: { user_id: userId },
  });
  return data as { success: boolean; data: AIAnalysisResult };
}