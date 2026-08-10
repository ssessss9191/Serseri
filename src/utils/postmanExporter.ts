import { HistoryItem, ParsedCurlInfo } from "../types";

export function exportToPostmanCollection(items: HistoryItem[], collectionName: string = "Curl2Py Export Collection"): string {
  const postmanItems = items.map((item, idx) => {
    // Attempt basic parsing of cURL URL and method
    const urlMatch = item.curlCommand.match(/url\s*=\s*["']([^"']+)["']/i) || item.curlCommand.match(/(https?:\/\/[^\s"'`]+)/i);
    const rawUrl = urlMatch ? urlMatch[1] : "https://api.example.com";

    let method = "GET";
    if (/-X\s+POST|--request\s+POST/i.test(item.curlCommand) || /-d|--data/i.test(item.curlCommand)) method = "POST";
    else if (/-X\s+PUT|--request\s+PUT/i.test(item.curlCommand)) method = "PUT";
    else if (/-X\s+DELETE|--request\s+DELETE/i.test(item.curlCommand)) method = "DELETE";
    else if (/-X\s+PATCH|--request\s+PATCH/i.test(item.curlCommand)) method = "PATCH";

    // Header extraction
    const headersList: { key: string; value: string }[] = [];
    const headerMatches = item.curlCommand.matchAll(/-H\s+["']([^"']+)["']/g);
    for (const m of headerMatches) {
      const parts = m[1].split(":");
      if (parts.length >= 2) {
        headersList.push({
          key: parts[0].trim(),
          value: parts.slice(1).join(":").trim(),
        });
      }
    }

    return {
      name: item.title || `Request #${idx + 1}`,
      request: {
        method,
        header: headersList,
        url: {
          raw: rawUrl,
        },
      },
      response: [],
    };
  });

  const collection = {
    info: {
      _postman_id: `curl2py-${Date.now()}`,
      name: collectionName,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      description: "Curl2Py & Multi-Language API Converter tarafından dışa aktarılan koleksiyon.",
    },
    item: postmanItems,
  };

  return JSON.stringify(collection, null, 2);
}
