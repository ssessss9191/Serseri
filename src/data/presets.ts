import { PresetCurl } from "../types";

export const PRESET_CURLS: PresetCurl[] = [
  {
    id: "json-post",
    title: "JSON POST İsteği",
    category: "JSON / API",
    description: "Header ve JSON verisi içeren standart POST isteği",
    curl: `curl -X POST https://jsonplaceholder.typicode.com/posts \\
  -H "Content-Type: application/json; charset=UTF-8" \\
  -H "User-Agent: Mozilla/5.0" \\
  -d '{"title": "cURL to Python", "body": "Mobil uyumlu dönüştürücü", "userId": 1}'`
  },
  {
    id: "bearer-auth",
    title: "Bearer Token (JWT) Kimlik Doğrulama",
    category: "Kimlik Doğrulama",
    description: "Authorization başlığında Bearer token ile Korumalı API isteği",
    curl: `curl -X GET https://api.github.com/user \\
  -H "Authorization: Bearer ghp_sampletoken1234567890abcdef" \\
  -H "Accept: application/vnd.github.v3+json" \\
  -H "User-Agent: PythonClientApp/1.0"`
  },
  {
    id: "openai-api",
    title: "OpenAI Chat Completion API",
    category: "Gelişmiş",
    description: "GPT-4o modeline cURL ile mesaj gönderme",
    curl: `curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Merhaba Python!"}],
    "temperature": 0.7
  }'`
  },
  {
    id: "form-urlencoded",
    title: "Form Verisi (x-www-form-urlencoded)",
    category: "Form & Dosya",
    description: "Giriş yapma veya form gönderme istekleri",
    curl: `curl -X POST https://httpbin.org/post \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "username=ahmet&password=gizlisifre123&remember=true"`
  },
  {
    id: "simple-get",
    title: "Query Parametreleri ile GET",
    category: "Temel",
    description: "Arama parametreleri içeren basit GET isteği",
    curl: `curl -G "https://httpbin.org/get" \\
  -d "kategori=yazilim" \\
  -d "dil=python" \\
  -d "sayfa=1" \\
  -H "Accept: application/json"`
  },
  {
    id: "basic-auth",
    title: "Basic Auth (Kullanıcı Adı & Şifre)",
    category: "Kimlik Doğrulama",
    description: "-u seçeneği ile HTTP Basic Authentication",
    curl: `curl -u admin:secret123 https://httpbin.org/basic-auth/admin/secret123`
  },
  {
    id: "custom-cookies",
    title: "Özel Çerez (Cookie) Gönderimi",
    category: "Gelişmiş",
    description: "-b seçeneği veya Cookie header ile çerez iletme",
    curl: `curl -X GET https://httpbin.org/cookies \\
  --cookie "session_id=xyz789; theme=dark; lang=tr"`
  }
];
