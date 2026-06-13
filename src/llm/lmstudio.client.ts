import type { LlmClient } from "./llm.interface.js";
import { logger } from "../utils/logger.js";

interface LmStudioClientOptions {
  baseUrl?: string;
  model: string;
  apiToken?: string;
}

interface LmStudioResponse {
  output: Array<{ type: string; content?: string }>;
}

export class LmStudioClient implements LlmClient {
  private baseUrl: string;
  private model: string;
  private apiToken: string | undefined;

  constructor(options: LmStudioClientOptions) {
    this.baseUrl = options.baseUrl ?? "http://127.0.0.1:1234";
    this.model = options.model;
    this.apiToken = options.apiToken ?? process.env.LM_STUDIO_API_TOKEN;
  }

  async send(prompt: string): Promise<string> {
    logger.info(
      { model: this.model, baseUrl: this.baseUrl },
      "lmstudio: sending request",
    );
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiToken) {
      headers["Authorization"] = `Bearer ${this.apiToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api/v1/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({ model: this.model, input: prompt }),
    });

    if (!response.ok) {
      throw new Error(
        `LM Studio request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as LmStudioResponse;
    const message = data.output?.find((item) => item.type === "message");
    if (!message?.content) {
      throw new Error("LM Studio returned no message content in the response.");
    }
    logger.info({ model: this.model }, "lmstudio: response received");

    return message.content;
  }
}
