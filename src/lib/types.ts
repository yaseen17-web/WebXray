export interface Technology {
  name: string;
  version?: string;
  confidence: number;
  categories: string[];
  website?: string;
  icon?: string;
  cpe?: string;
}

export interface CVEInfo {
  id: string;
  description: string;
  severity?: string;
  score?: number;
  published?: string;
  references?: string[];
  exploitUrls?: string[];
}

export interface DetectionResult {
  url: string;
  technologies: Technology[];
  headers?: Record<string, string>;
  scannedAt: string;
}

export interface ExploitLink {
  source: string;
  url: string;
  label: string;
}