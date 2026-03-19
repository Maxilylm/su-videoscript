import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { topic, platform, audience, tone } = await request.json();

    if (!topic || !platform || !audience || !tone) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GROQ_API_KEY not configured" },
        { status: 500 }
      );
    }

    const platformDurations: Record<string, string> = {
      tiktok: "15-60 seconds",
      "youtube-shorts": "60 seconds",
      "youtube-long": "5-15 minutes",
      "instagram-reels": "30-90 seconds",
    };

    const duration = platformDurations[platform] || "60 seconds";

    const systemPrompt = `You are an expert video script writer and content strategist for social media creators. You create viral, engaging video scripts optimized for specific platforms.

Always respond with valid JSON only — no markdown, no code fences, no explanation. Just the JSON object.`;

    const userPrompt = `Create a complete video script package for:
- Topic: "${topic}"
- Platform: ${platform} (${duration})
- Target Audience: ${audience}
- Tone: ${tone}

Return ONLY a JSON object with this exact structure:
{
  "hooks": [
    {"text": "hook text here", "style": "Question|Shock|Story|Stat|Controversial", "whyItWorks": "explanation"}
  ],
  "script": {
    "sections": [
      {"timestamp": "[0:00]", "text": "spoken text", "visualNote": "visual direction"}
    ]
  },
  "ctas": [
    {"text": "CTA text", "placement": "end|middle|comment pin"}
  ],
  "storyboard": [
    {"sceneNumber": 1, "duration": "5s", "visualDescription": "what viewer sees", "onScreenText": "text overlay", "audioNote": "background music/sfx note"}
  ],
  "metadata": {
    "estimatedDuration": "e.g. 45 seconds",
    "wordCount": 150,
    "readingPace": "e.g. 3 words/sec"
  }
}

Requirements:
- Generate exactly 5 hooks with different styles (Question, Shock, Story, Stat, Controversial)
- Script sections should have realistic timestamps appropriate for ${duration}
- Include 3-4 CTA options with different placements
- Storyboard should have 4-8 scenes covering the full video
- Make hooks punchy, attention-grabbing, and platform-appropriate
- Script should feel natural when spoken aloud
- Return ONLY valid JSON, no other text`;

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq API error:", errText);
      return Response.json(
        { error: "AI generation failed" },
        { status: 502 }
      );
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json(
        { error: "No content from AI" },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(content);
    return Response.json(parsed);
  } catch (error) {
    console.error("Generate error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
