export type PythonTarget = 
  | "python-requests" 
  | "python-httpx" 
  | "python-httpx-async" 
  | "python-aiohttp" 
  | "python-urllib3"
  | "javascript-fetch"
  | "nodejs-axios";

export interface ConversionOptions {
  addTryExcept: boolean;
  addComments: boolean;
  useSession: boolean;
  addTimeout: boolean;
  customFilename: string;
}

export interface PresetCurl {
  id: string;
  title: string;
  category: "Temel" | "Kimlik Doğrulama" | "JSON / API" | "Form & Dosya" | "Gelişmiş";
  description: string;
  curl: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  curlCommand: string;
  pythonCode: string;
  target: PythonTarget;
  timestamp: number;
}

export interface LiveTestResult {
  loading: boolean;
  status?: number;
  statusText?: string;
  durationMs?: number;
  headers?: Record<string, string>;
  bodyText?: string;
  isJson?: boolean;
  error?: string;
}

export interface ParsedCurlInfo {
  url: string;
  method: string;
  headersCount: number;
  headers: Record<string, string>;
  hasAuth: boolean;
  hasBody: boolean;
  bodyType: "json" | "form" | "raw" | "multipart" | "none";
  dataPayload: string | null;
  parsedJsonPayload: any | null;
}
