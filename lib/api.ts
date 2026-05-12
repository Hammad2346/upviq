import axios from "axios";
import { Freelancer } from "./dataStructuring";

export interface SaveAnalysisInput {
  user_id: number;
  overallScore: number;
  parameters: {
    title: { score: number; maxScore: number; percentage: number; reasoning: string };
    overview: { score: number; maxScore: number; percentage: number; reasoning: string };
    skills: { score: number; maxScore: number; percentage: number; reasoning: string };
    rate: { score: number; maxScore: number; percentage: number; reasoning: string };
    engagement: { score: number; maxScore: number; percentage: number; reasoning: string };
  };
  suggestions: {
    title: { current: string; rewritten: string; reason: string };
    overview: { current: string; rewritten: string; reason: string };
    skills: { current: string[]; rewritten: string[]; reason: string };
  };
  benchmarks: {
    avgRate: number;
    avgJobSuccess: number;
    commonSkills: string[];
    topRatedCount: number;
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
  suggested_title: string;
  suggested_overview: string;
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

export async function saveAnalysis(dbProfileId: number, input: SaveAnalysisInput) {
  const { data } = await axios.post(`/api/profiles/${dbProfileId}/analysis`, input);
  return data as { success: boolean; analysisId: number };
}

export async function getAnalysis(dbProfileId: number, userId: number) {
  const { data } = await axios.get(`/api/profiles/${dbProfileId}/analysis`, {
    params: { user_id: userId },
  });
  return data as AIAnalysisResult;
}

export async function saveProfileAndAnalysis(
  userId: number,
  profile: Freelancer,
  analysisInput: Omit<SaveAnalysisInput, "user_id">
) {
  const { profileId } = await saveProfile(userId, profile);
  const { analysisId } = await saveAnalysis(profileId, { ...analysisInput, user_id: userId });
  return { profileId, analysisId };
}