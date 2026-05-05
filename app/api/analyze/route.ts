import { freelancers } from "@/lib/dataset";
import { analyzeUser } from "@/lib/analysis";
import { scoreProfile } from "@/lib/scoring";
import { generateSuggestions } from "@/lib/ai";

export async function POST(req: Request) {
  const body = await req.json();
  const userProfile = body.profile;

  // STEP 1: analyze
  const analysis = analyzeUser(userProfile, freelancers);

  // STEP 2: score
  const score = scoreProfile(userProfile, analysis);

  // STEP 3: AI suggestions
  const suggestions = await generateSuggestions(userProfile, analysis, score);

  return Response.json({
    score,
    missingSkills: analysis.missingSkills,
    suggestions,
  });
}