import axios from "axios";

const main = async (prompt) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in environment variables");
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are an expert blog author. Write a high-quality, engaging, and detailed blog post in clean Markdown format with headings (##, ###), paragraphs, and bullet points where appropriate. Do NOT wrap the entire output in ```markdown code blocks. Do NOT include conversational filler such as 'Here is your blog:' or 'Hope this helps!'. Output ONLY the blog post content directly.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY.trim()}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30s timeout
      }
    );

    let content = response.data?.choices?.[0]?.message?.content || "";

    // Clean up code block wrappers if model still outputs ```markdown ... ```
    if (content.startsWith("```markdown")) {
      content = content.replace(/^```markdown\s*/, "").replace(/\s*```$/, "");
    } else if (content.startsWith("```")) {
      content = content.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    return content.trim();
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const apiMessage =
        error.response.data?.error?.message || error.response.statusText;
      if (status === 401) {
        throw new Error("Invalid GROQ API Key. Please check your GROQ_API_KEY.");
      }
      if (status === 429) {
        throw new Error("Groq API rate limit exceeded. Please try again shortly.");
      }
      throw new Error(`Groq API Error (${status}): ${apiMessage}`);
    } else if (error.code === "ECONNABORTED") {
      throw new Error("AI generation request timed out after 30 seconds");
    }
    throw error;
  }
};

export default main;