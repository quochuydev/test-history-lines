export function createOllamaService(
  llm: "codellama:7b" | "gemma3:4b" | "llama3.1:8b"
) {
  const baseUrl = "http://localhost:11434";

  async function generateAnswer(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const controller = new AbortController();
    const timeout = 2 * 60 * 1000;
    const timer = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: llm,
        system: systemPrompt,
        prompt: userPrompt,
        stream: false,
        options: {
          temperature: 0.4,
        },
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (!response.ok) throw new Error(`error: ${response.statusText}`);

    const data = (await response.json()) as { response: string };

    return data.response ?? "";
  }

  async function embed(text: string): Promise<number[]> {
    const response = await fetch(`${baseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "nomic-embed-text:latest",
        input: text,
      }),
    });

    if (!response.ok) throw new Error(`Embed error: ${response.statusText}`);
    const data = (await response.json()) as { embedding: number[] };

    return data.embedding ?? [];
  }

  return { generateAnswer, embed };
}
