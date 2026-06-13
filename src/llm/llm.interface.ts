export interface LlmClient {
  send(prompt: string): Promise<string>;
}
