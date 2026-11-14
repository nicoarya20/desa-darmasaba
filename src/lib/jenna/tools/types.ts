// Kontrak tool Jenna. `spec` sengaja sebentuk dengan ToolSpec provider ({name, description, parameters})
// tanpa mengimpornya, supaya modul ini bebas dari lapisan provider.

export interface JennaToolSpec {
  name: string;
  description: string;
  /** JSON Schema object untuk argumen. */
  parameters: Record<string, unknown>;
}

export interface ToolContext {
  signal: AbortSignal;
  /** Hasil `getVisiblePublicRoutes()` — dasar visibilitas sumber & tautan. */
  routes: Set<string>;
}

export type ToolItem = { title: string; url: string; text: string };

export type ToolOutput = { ok: true; items: ToolItem[] } | { ok: false; message: string };

export interface JennaTool {
  spec: JennaToolSpec;
  run(args: unknown, ctx: ToolContext): Promise<ToolOutput>;
}
