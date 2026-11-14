export interface JennaKnowledgeSourceDTO {
  key: string;
  label: string;
  domain: string;
  tier: "A" | "B" | "C" | "D";
  /** false = menu hidden on the public site, so the source is left out of the snapshot and the tools. */
  visible: boolean;
  /** Public page this source points to (base href). */
  href: string;
  /** Rows loaded into the snapshot (at most `take`); 0 when not visible. */
  rows: number;
  take: number;
  /** Reachable through the cari_konten tool. */
  searchable: boolean;
}

export interface JennaKnowledgeToolDTO {
  name: string;
  description: string;
}

/** data of GET /api/developer/jenna/knowledge */
export interface JennaKnowledgeResponse {
  snapshot: {
    /** Exact text sent to the AI as knowledge, built fresh for this request. */
    text: string;
    chars: number;
    maxChars: number;
    truncated: boolean;
    /** Seconds the public chat keeps its cached copy. */
    revalidateSeconds: number;
    generatedAt: string;
  };
  sources: JennaKnowledgeSourceDTO[];
  tools: JennaKnowledgeToolDTO[];
}
