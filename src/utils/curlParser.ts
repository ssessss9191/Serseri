import { ParsedCurlInfo, PythonTarget, ConversionOptions } from "../types";

/**
 * Tokenizes a cURL command string into discrete bash-style arguments,
 * properly preserving quotes, escaped characters, and multi-line continuation.
 */
export function tokenizeCurl(curl: string): string[] {
  if (!curl) return [];

  const args: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inAnsiCQuote = false;
  let isEscaped = false;

  // Clean up backslash line continuations
  const cleanCurl = curl.replace(/\\\r?\n/g, " ");

  for (let i = 0; i < cleanCurl.length; i++) {
    const char = cleanCurl[i];

    if (isEscaped) {
      if (inAnsiCQuote) {
        if (char === "n") current += "\n";
        else if (char === "t") current += "\t";
        else if (char === "r") current += "\r";
        else current += char;
      } else {
        current += char;
      }
      isEscaped = false;
      continue;
    }

    if (char === "\\" && !inSingleQuote) {
      isEscaped = true;
      continue;
    }

    if (inSingleQuote) {
      if (char === "'") {
        inSingleQuote = false;
      } else {
        current += char;
      }
      continue;
    }

    if (inAnsiCQuote) {
      if (char === "'") {
        inAnsiCQuote = false;
      } else {
        current += char;
      }
      continue;
    }

    if (inDoubleQuote) {
      if (char === '"') {
        inDoubleQuote = false;
      } else {
        current += char;
      }
      continue;
    }

    // Check for ANSI-C quote $'...'
    if (char === "$" && cleanCurl[i + 1] === "'") {
      inAnsiCQuote = true;
      i++; // skip '
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      continue;
    }

    if (char === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (/\s/.test(char)) {
      if (current.length > 0) {
        args.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    args.push(current);
  }

  return args;
}

/**
 * Advanced parser that extracts URL, method, headers, cookies, auth, and data payload from cURL tokens.
 */
export function parseCurlAdvanced(curlCommand: string): ParsedCurlInfo {
  const tokens = tokenizeCurl(curlCommand);

  let url = "";
  let method = "";
  const headers: Record<string, string> = {};
  const dataChunks: string[] = [];
  const formChunks: string[] = [];
  let isJsonExplicit = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === "curl") continue;

    // Method flag: -X POST, --request GET
    if (token === "-X" || token === "--request") {
      if (i + 1 < tokens.length) {
        method = tokens[++i].toUpperCase();
      }
      continue;
    }

    // Header flag: -H 'Name: Value'
    if (token === "-H" || token === "--header") {
      if (i + 1 < tokens.length) {
        const headerStr = tokens[++i];
        const idx = headerStr.indexOf(":");
        if (idx !== -1) {
          const key = headerStr.slice(0, idx).trim();
          const val = headerStr.slice(idx + 1).trim();
          headers[key] = val;
        }
      }
      continue;
    }

    // User Agent: -A '...'
    if (token === "-A" || token === "--user-agent") {
      if (i + 1 < tokens.length) {
        headers["User-Agent"] = tokens[++i];
      }
      continue;
    }

    // Referer: -e '...'
    if (token === "-e" || token === "--referer") {
      if (i + 1 < tokens.length) {
        headers["Referer"] = tokens[++i];
      }
      continue;
    }

    // Cookie: -b '...'
    if (token === "-b" || token === "--cookie") {
      if (i + 1 < tokens.length) {
        headers["Cookie"] = tokens[++i];
      }
      continue;
    }

    // Basic Auth: -u 'user:pass'
    if (token === "-u" || token === "--user") {
      if (i + 1 < tokens.length) {
        const creds = tokens[++i];
        try {
          headers["Authorization"] = `Basic ${btoa(creds)}`;
        } catch {
          headers["Authorization"] = `Basic ${creds}`;
        }
      }
      continue;
    }

    // Data flags: -d, --data, --data-raw, --data-binary, --data-ascii, --data-urlencode
    if (
      token === "-d" ||
      token === "--data" ||
      token === "--data-raw" ||
      token === "--data-binary" ||
      token === "--data-ascii" ||
      token === "--data-urlencode"
    ) {
      if (i + 1 < tokens.length) {
        dataChunks.push(tokens[++i]);
      }
      continue;
    }

    // --json flag
    if (token === "--json") {
      if (i + 1 < tokens.length) {
        dataChunks.push(tokens[++i]);
        isJsonExplicit = true;
        headers["Content-Type"] = "application/json";
        headers["Accept"] = "application/json";
      }
      continue;
    }

    // Form flags: -F, --form
    if (token === "-F" || token === "--form" || token === "--form-string") {
      if (i + 1 < tokens.length) {
        formChunks.push(tokens[++i]);
      }
      continue;
    }

    // URL token
    if (!url && !token.startsWith("-")) {
      if (token.startsWith("http://") || token.startsWith("https://")) {
        url = token;
      } else if (token.includes(".") || token.includes("/")) {
        url = `https://${token}`;
      }
    }
  }

  if (!url) {
    url = "https://example.com/api";
  }

  // Combine data payload
  let dataPayload: string | null = null;
  if (dataChunks.length > 0) {
    // If multiple -d flags, join key=value pairs with & if applicable
    if (dataChunks.length > 1 && dataChunks.every((c) => c.includes("="))) {
      dataPayload = dataChunks.join("&");
    } else {
      dataPayload = dataChunks.join("");
    }
  } else if (formChunks.length > 0) {
    dataPayload = formChunks.join("&");
  }

  // Determine method if not explicitly provided
  if (!method) {
    if (dataPayload !== null || formChunks.length > 0) {
      method = "POST";
    } else {
      method = "GET";
    }
  }

  // Check auth
  const hasAuth =
    !!headers["Authorization"] ||
    !!headers["authorization"] ||
    !!headers["Cookie"] ||
    !!headers["cookie"] ||
    tokenIncludesAuth(curlCommand);

  // Determine Body Type & Parse JSON if possible
  const hasBody = dataPayload !== null || formChunks.length > 0;
  let bodyType: ParsedCurlInfo["bodyType"] = "none";
  let parsedJsonPayload: any | null = null;

  if (hasBody && dataPayload) {
    const contentType = (headers["Content-Type"] || headers["content-type"] || "").toLowerCase();

    // Attempt JSON parse
    if (isJsonExplicit || contentType.includes("json") || (dataPayload.trim().startsWith("{") && dataPayload.trim().endsWith("}")) || (dataPayload.trim().startsWith("[") && dataPayload.trim().endsWith("]"))) {
      try {
        parsedJsonPayload = JSON.parse(dataPayload);
        bodyType = "json";
      } catch {
        // Attempt minor quote fixes for quasi-JSON
        try {
          const fixed = dataPayload.replace(/'/g, '"');
          parsedJsonPayload = JSON.parse(fixed);
          bodyType = "json";
        } catch {
          bodyType = contentType.includes("json") ? "json" : "raw";
        }
      }
    }

    if (bodyType !== "json") {
      if (formChunks.length > 0 || contentType.includes("multipart")) {
        bodyType = "multipart";
      } else if (contentType.includes("x-www-form-urlencoded") || dataPayload.includes("=")) {
        bodyType = "form";
      } else {
        bodyType = "raw";
      }
    }
  }

  return {
    url,
    method,
    headersCount: Object.keys(headers).length,
    headers,
    hasAuth,
    hasBody,
    bodyType,
    dataPayload,
    parsedJsonPayload,
  };
}

function tokenIncludesAuth(str: string): boolean {
  return /-u\s+|--user\s+|Authorization:|Bearer\s+|api[-_]?key/i.test(str);
}

export function parseCurlMetadata(curlCommand: string): ParsedCurlInfo {
  return parseCurlAdvanced(curlCommand);
}

export function normalizeCurlCommand(curl: string): string {
  if (!curl) return "";
  return curl
    .replace(/\\\s*\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Full-featured client-side fallback code generator supporting all targets and options.
 */
export function fallbackCurlToCode(
  curlCommand: string,
  target: PythonTarget = "python-requests",
  options?: Partial<ConversionOptions>
): string {
  const info = parseCurlAdvanced(curlCommand);

  switch (target) {
    case "python-requests":
      return generatePythonRequestsCode(info, options);
    case "python-httpx":
      return generatePythonHttpxCode(info, options, false);
    case "python-httpx-async":
      return generatePythonHttpxCode(info, options, true);
    case "python-aiohttp":
      return generatePythonAiohttpCode(info, options);
    case "python-urllib3":
      return generatePythonUrllib3Code(info, options);
    case "javascript-fetch":
      return generateJsFetchCode(info);
    case "nodejs-axios":
      return generateNodeAxiosCode(info);
    default:
      return generatePythonRequestsCode(info, options);
  }
}

export function fallbackCurlToPythonRequests(curlCommand: string): string {
  return fallbackCurlToCode(curlCommand, "python-requests");
}

function generatePythonRequestsCode(info: ParsedCurlInfo, options?: Partial<ConversionOptions>): string {
  let code = "";
  if (options?.addComments) {
    code += `# Auto-generated by Curl2Py Pro\n# Target: python-requests\n\n`;
  }

  code += `import requests\n\n`;
  code += `url = "${info.url}"\n\n`;

  const hasHeaders = Object.keys(info.headers).length > 0;
  if (hasHeaders) {
    code += `headers = {\n`;
    for (const [k, v] of Object.entries(info.headers)) {
      code += `    "${k}": "${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}",\n`;
    }
    code += `}\n\n`;
  }

  let dataArg = "";
  if (info.hasBody && info.dataPayload) {
    if (info.parsedJsonPayload !== null) {
      code += `json_data = ${JSON.stringify(info.parsedJsonPayload, null, 4)}\n\n`;
      dataArg = `, json=json_data`;
    } else {
      code += `data = "${info.dataPayload.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"\n\n`;
      dataArg = `, data=data`;
    }
  }

  const headersArg = hasHeaders ? `, headers=headers` : "";
  const methodLower = info.method.toLowerCase();

  if (options?.useSession) {
    code += `session = requests.Session()\n`;
    code += `response = session.${methodLower}(url${headersArg}${dataArg})\n\n`;
  } else {
    code += `response = requests.${methodLower}(url${headersArg}${dataArg})\n\n`;
  }

  if (options?.addTryExcept) {
    code = wrapPythonTryExcept(code);
  } else {
    code += `print("Statü Kodu:", response.status_code)\n`;
    code += `try:\n    print(response.json())\nexcept Exception:\n    print(response.text)\n`;
  }

  return code;
}

function generatePythonHttpxCode(
  info: ParsedCurlInfo,
  options?: Partial<ConversionOptions>,
  isAsync: boolean = false
): string {
  let code = "";
  if (options?.addComments) {
    code += `# Auto-generated by Curl2Py Pro\n# Target: python-httpx${isAsync ? " (async)" : ""}\n\n`;
  }

  if (isAsync) {
    code += `import httpx\nimport asyncio\n\n`;
  } else {
    code += `import httpx\n\n`;
  }

  code += `url = "${info.url}"\n\n`;

  const hasHeaders = Object.keys(info.headers).length > 0;
  if (hasHeaders) {
    code += `headers = {\n`;
    for (const [k, v] of Object.entries(info.headers)) {
      code += `    "${k}": "${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}",\n`;
    }
    code += `}\n\n`;
  }

  let dataArg = "";
  if (info.hasBody && info.dataPayload) {
    if (info.parsedJsonPayload !== null) {
      code += `json_data = ${JSON.stringify(info.parsedJsonPayload, null, 4)}\n\n`;
      dataArg = `, json=json_data`;
    } else {
      code += `data = "${info.dataPayload.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"\n\n`;
      dataArg = `, content=data`;
    }
  }

  const headersArg = hasHeaders ? `, headers=headers` : "";
  const methodLower = info.method.toLowerCase();

  if (isAsync) {
    code += `async function main():\n`;
    code += `    async with httpx.AsyncClient() as client:\n`;
    code += `        response = await client.${methodLower}(url${headersArg}${dataArg})\n`;
    code += `        print("Statü Kodu:", response.status_code)\n`;
    code += `        print(response.text)\n\n`;
    code += `# asyncio.run(main())\n`;
  } else {
    code += `response = httpx.${methodLower}(url${headersArg}${dataArg})\n\n`;
    code += `print("Statü Kodu:", response.status_code)\n`;
    code += `print(response.text)\n`;
  }

  return code;
}

function generatePythonAiohttpCode(info: ParsedCurlInfo, options?: Partial<ConversionOptions>): string {
  let code = "";
  if (options?.addComments) {
    code += `# Auto-generated by Curl2Py Pro\n# Target: python-aiohttp\n\n`;
  }

  code += `import aiohttp\nimport asyncio\n\n`;
  code += `async def fetch():\n`;
  code += `    url = "${info.url}"\n`;

  const hasHeaders = Object.keys(info.headers).length > 0;
  if (hasHeaders) {
    code += `    headers = {\n`;
    for (const [k, v] of Object.entries(info.headers)) {
      code += `        "${k}": "${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}",\n`;
    }
    code += `    }\n`;
  }

  let dataArg = "";
  if (info.hasBody && info.dataPayload) {
    if (info.parsedJsonPayload !== null) {
      code += `    json_data = ${JSON.stringify(info.parsedJsonPayload, null, 8).replace(/\n/g, "\n    ")}\n`;
      dataArg = `, json=json_data`;
    } else {
      code += `    data = "${info.dataPayload.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"\n`;
      dataArg = `, data=data`;
    }
  }

  const headersArg = hasHeaders ? `, headers=headers` : "";
  const methodLower = info.method.toLowerCase();

  code += `    async with aiohttp.ClientSession() as session:\n`;
  code += `        async with session.${methodLower}(url${headersArg}${dataArg}) as response:\n`;
  code += `            print("Statü Kodu:", response.status)\n`;
  code += `            text = await response.text()\n`;
  code += `            print(text)\n\n`;
  code += `# asyncio.run(fetch())\n`;

  return code;
}

function generatePythonUrllib3Code(info: ParsedCurlInfo, options?: Partial<ConversionOptions>): string {
  let code = "";
  if (options?.addComments) {
    code += `# Auto-generated by Curl2Py Pro\n# Target: urllib3\n\n`;
  }

  code += `import urllib3\nimport json\n\n`;
  code += `http = urllib3.PoolManager()\n`;
  code += `url = "${info.url}"\n\n`;

  let bodyArg = "";
  if (info.hasBody && info.dataPayload) {
    if (info.parsedJsonPayload !== null) {
      code += `json_data = json.dumps(${JSON.stringify(info.parsedJsonPayload, null, 4)}).encode('utf-8')\n\n`;
      bodyArg = `, body=json_data`;
    } else {
      code += `data = "${info.dataPayload.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}".encode('utf-8')\n\n`;
      bodyArg = `, body=data`;
    }
  }

  const hasHeaders = Object.keys(info.headers).length > 0;
  let headersArg = "";
  if (hasHeaders) {
    code += `headers = {\n`;
    for (const [k, v] of Object.entries(info.headers)) {
      code += `    "${k}": "${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}",\n`;
    }
    code += `}\n\n`;
    headersArg = `, headers=headers`;
  }

  code += `response = http.request('${info.method}', url${headersArg}${bodyArg})\n\n`;
  code += `print("Statü Kodu:", response.status)\n`;
  code += `print(response.data.decode('utf-8'))\n`;

  return code;
}

function generateJsFetchCode(info: ParsedCurlInfo): string {
  let js = `const url = "${info.url}";\n\n`;
  const opts: any = { method: info.method };

  if (Object.keys(info.headers).length > 0) {
    opts.headers = info.headers;
  }

  if (info.hasBody && info.dataPayload) {
    if (info.parsedJsonPayload !== null) {
      opts.body = JSON.stringify(info.parsedJsonPayload);
    } else {
      opts.body = info.dataPayload;
    }
  }

  js += `const options = ${JSON.stringify(opts, null, 2)};\n\n`;
  js += `fetch(url, options)\n  .then(res => res.json())\n  .then(json => console.log(json))\n  .catch(err => console.error(err));\n`;
  return js;
}

function generateNodeAxiosCode(info: ParsedCurlInfo): string {
  let node = `const axios = require('axios');\n\n`;
  node += `const config = {\n`;
  node += `  method: '${info.method.toLowerCase()}',\n`;
  node += `  url: '${info.url}',\n`;

  if (Object.keys(info.headers).length > 0) {
    node += `  headers: ${JSON.stringify(info.headers, null, 4)},\n`;
  }

  if (info.hasBody && info.dataPayload) {
    if (info.parsedJsonPayload !== null) {
      node += `  data: ${JSON.stringify(info.parsedJsonPayload, null, 4)}\n`;
    } else {
      node += `  data: ${JSON.stringify(info.dataPayload)}\n`;
    }
  }

  node += `};\n\naxios(config)\n.then(response => {\n  console.log(JSON.stringify(response.data));\n})\n.catch(error => {\n  console.log(error);\n});\n`;
  return node;
}

function wrapPythonTryExcept(code: string): string {
  const lines = code.split("\n");
  const imports: string[] = [];
  const body: string[] = [];

  for (const line of lines) {
    if (line.startsWith("import ") || line.startsWith("from ")) {
      imports.push(line);
    } else {
      body.push(line);
    }
  }

  const indentedBody = body.map((l) => (l ? "    " + l : "")).join("\n");

  return `${imports.join("\n")}\n\ntry:\n${indentedBody}\n    if 'response' in locals() and hasattr(response, 'raise_for_status'):\n        response.raise_for_status()\n        print("Başarılı! Statü Kodu:", getattr(response, 'status_code', 200))\nexcept Exception as e:\n    print("İstek hatası oluştu:", e)\n`;
}
