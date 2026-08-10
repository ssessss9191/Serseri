export interface JwtInfo {
  token: string;
  header: any;
  payload: any;
  isExpired: boolean;
  expiresAt?: string;
  issuedAt?: string;
}

export function extractAndDecodeJwt(curlText: string): JwtInfo[] {
  const results: JwtInfo[] = [];

  // Regex to find JWT patterns: eyJ...
  const jwtRegex = /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_.-]+/g;
  const matches = Array.from(curlText.matchAll(jwtRegex));

  const seenTokens = new Set<string>();

  for (const match of matches) {
    const token = match[0];
    if (seenTokens.has(token)) continue;
    seenTokens.add(token);

    try {
      const parts = token.split(".");
      if (parts.length !== 3) continue;

      const decodeBase64Url = (str: string) => {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }
        return decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
      };

      const headerJson = JSON.parse(decodeBase64Url(parts[0]));
      const payloadJson = JSON.parse(decodeBase64Url(parts[1]));

      let isExpired = false;
      let expiresAt: string | undefined;
      let issuedAt: string | undefined;

      if (payloadJson.exp) {
        const expTime = payloadJson.exp * 1000;
        isExpired = Date.now() > expTime;
        expiresAt = new Date(expTime).toLocaleString("tr-TR");
      }

      if (payloadJson.iat) {
        issuedAt = new Date(payloadJson.iat * 1000).toLocaleString("tr-TR");
      }

      results.push({
        token,
        header: headerJson,
        payload: payloadJson,
        isExpired,
        expiresAt,
        issuedAt,
      });
    } catch {
      // Ignore invalid JWT candidates
    }
  }

  return results;
}
