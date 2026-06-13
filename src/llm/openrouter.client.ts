import { OpenRouter } from "@openrouter/sdk";
import type { LlmClient } from "./llm.interface.js";
import { logger } from "../utils/logger.js";

interface OpenRouterClientOptions {
  apiKey?: string;
  model: string;
}

export class OpenRouterClient implements LlmClient {
  private client: OpenRouter;
  private model: string;

  constructor(options: OpenRouterClientOptions) {
    const apiKey = options.apiKey ?? process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY environment variable is not set. " +
          "Set it or pass apiKey explicitly.",
      );
    }
    this.client = new OpenRouter({ apiKey });
    this.model = options.model;
  }

  async send(prompt: string): Promise<string> {
    logger.info({ model: this.model }, "openrouter: sending request");
    const result = await this.client.chat.send({
      chatRequest: {
        model: this.model,
        messages: [{ role: "user", content: prompt }],
      },
    });
    const content = result.choices[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("OpenRouter returned no text content in the response.");
    }
    logger.info({ model: this.model }, "openrouter: response received");
    return content;
  }
}
