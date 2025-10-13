export function createGLMService(token?: string) {
  async function generateAnswer(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    if (!token) throw new Error("GLM token is not provided");

    const controller = new AbortController();
    const timeout = 2 * 60 * 1000;
    const timer = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`https://api.z.ai/api/anthropic/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (!response.ok) throw new Error(`error: ${response.statusText}`);

    const data = (await response.json()) as {
      content: { type: string; text: string }[];
    };

    return data.content[0].text;
  }

  async function embed(text: string): Promise<number[]> {
    throw new Error("Not implemented");
  }

  return { generateAnswer, embed };
}
