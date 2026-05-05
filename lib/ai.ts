export async function generateSuggestions(
  user: any,
  analysis: any,
  score: number
) {
  const prompt = `
You are an expert Upwork profile optimizer.

Profile:
Title: ${user.title}
Skills: ${user.skills.join(", ")}
Score: ${score}/100

Missing skills:
${analysis.missingSkills.join(", ")}

Give:
1. A better optimized title
2. Skills to add (based on market demand)
3. 3 clear improvements

Keep it short, direct, and data-driven.
`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Groq API Error: ${errorText}`);
  }

  const data = await res.json();

  return data?.choices?.[0]?.message?.content || "";
}