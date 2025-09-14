import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ApiDocs() {
  // Use react-router location to reliably respond to hash changes
  const location = useLocation();
  const navigate = useNavigate();
  const currentHash = location.hash || "#introduction";
  const [activeSub, setActiveSub] = useState<string | null>(null);
  useEffect(() => {
    const hash = location.hash?.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      // ensure a small delay in case content just mounted
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [location.hash]);

  // Disable auto-active and auto-scrolling on regular scroll. Only respond to hash changes (from clicks).

  // Removed auto-highlighting on scroll for subheadings to avoid nested scroll behavior.

  const MethodBadge = ({
    method,
  }: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  }) => {
    const color =
      method === "GET"
        ? "text-emerald-400 border-emerald-400/40"
        : method === "POST"
        ? "text-sky-400 border-sky-400/40"
        : method === "PUT"
        ? "text-amber-400 border-amber-400/40"
        : method === "PATCH"
        ? "text-fuchsia-400 border-fuchsia-400/40"
        : "text-rose-400 border-rose-400/40";
    return (
      <span
        className={`inline-block text-xs px-2 py-0.5 border rounded ${color}`}
      >
        {method}
      </span>
    );
  };

  const Chip = ({
    label,
    kind,
  }: {
    label: string;
    kind: "curl" | "python" | "js" | "http";
  }) => {
    const map: Record<string, string> = {
      curl: "bg-slate-800 text-slate-200",
      python: "bg-indigo-900/40 text-indigo-300",
      js: "bg-yellow-900/40 text-yellow-300",
      http: "bg-slate-800 text-slate-200",
    };
    return (
      <span
        className={`inline-block text-[10px] leading-4 px-2 py-0.5 rounded ${map[kind]}`}
      >
        {label}
      </span>
    );
  };

  const CodeBlock = ({
    code,
    lang,
  }: {
    code: string;
    lang: "bash" | "json" | "python" | "javascript" | "http";
  }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch (e) {
        // ignore
      }
    };

    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;");

    const highlightJSON = (src: string) => {
      let s = escapeHtml(src);
      // keys
      s = s.replace(/\"([^\"]+)\"\s*:/g, '<span class="tok-key">"$1"</span>:');
      // strings
      s = s.replace(/:\s*\"([^\"]*)\"/g, ': <span class="tok-string">"$1"</span>');
      // numbers
      s = s.replace(/:\s*(-?\d+(?:\.\d+)?)/g, ': <span class="tok-number">$1</span>');
      // booleans/null
      s = s.replace(/:\s*\b(true|false|null)\b/g, ': <span class="tok-atom">$1</span>');
      return s;
    };

    const kw = {
      javascript:
        /\b(const|let|var|function|return|if|else|for|while|try|catch|finally|new|class|extends|import|from|export|await|async|throw)\b/g,
      python:
        /\b(def|return|if|elif|else|for|while|try|except|finally|import|from|as|class|with|lambda|pass|raise|yield|True|False|None)\b/g,
      bash: /\b(if|then|else|fi|for|in|do|done|case|esac|function|return|export)\b/g,
    } as const;

    const highlightGeneric = (src: string, lang: "bash" | "python" | "javascript") => {
      let s = escapeHtml(src);
      // comments
      if (lang === "bash") s = s.replace(/(^|\s)#([^\n]*)/g, '$1<span class="tok-comment">#$2</span>');
      if (lang === "javascript") s = s.replace(/\/\/([^\n]*)/g, '<span class="tok-comment">//$1</span>');
      if (lang === "python") s = s.replace(/(^|\s)#([^\n]*)/g, '$1<span class="tok-comment">#$2</span>');
      // strings
      s = s.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, (m) => `<span class="tok-string">${m}</span>`);
      // numbers
      s = s.replace(/\b-?\d+(?:\.\d+)?\b/g, (m) => `<span class="tok-number">${m}</span>`);
      // keywords
      const regex = kw[lang];
      s = s.replace(regex, (m) => `<span class="tok-kw">${m}</span>`);
      return s;
    };

    let highlighted = "";
    if (lang === "json") highlighted = highlightJSON(code);
    else if (lang === "bash" || lang === "python" || lang === "javascript") highlighted = highlightGeneric(code, lang);
    else highlighted = escapeHtml(code); // http or others as plain text

    return (
      <div className="relative group">
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-2 -top-2 translate-y-[-100%] opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded border border-slate-700 bg-slate-800 text-slate-200"
          aria-label="Copy code"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <pre className="pretty-scrollbar overflow-x-auto overflow-y-hidden max-w-full">
          <code
            className={`language-${lang}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Bastion API Documentation</h2>
      </div>
      {/* Pretty, subtle horizontal scrollbar styles for code blocks */}
      <style>
        {`
        /* WebKit browsers */
        .pretty-scrollbar { margin-top: 0.375rem; padding-bottom: 2px; }
        .pretty-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .pretty-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .pretty-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.3); border-radius: 9999px; }
        .pretty-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.5); }
        /* Firefox */
        .pretty-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(148,163,184,0.5) transparent; }
        /* Lightweight token colors */
        .tok-key { color: #93c5fd; }         /* light blue */
        .tok-string { color: #86efac; }      /* green */
        .tok-number { color: #fca5a5; }      /* red */
        .tok-atom { color: #fbbf24; }        /* amber */
        .tok-kw { color: #c4b5fd; }          /* violet */
        .tok-comment { color: #94a3b8; font-style: italic; }
        `}
      </style>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Bastion API
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Welcome to the Bastion API. Use our REST API to integrate fraud detection, retrieve user risk, and submit claims. All responses are JSON over HTTPS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-16 text-sm text-muted-foreground">
            {/* Section: Introduction */}
            <section id="introduction" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Introduction</h3>
                  <p>
                    Welcome to the Bastion API. Our platform provides businesses with programmatic access to our cross-platform fraud detection engine. You can use this API to enrich your own systems with a user's comprehensive return history, real-time risk scores, and detailed claim information.
                  </p>
                  <p>
                    The Bastion API is organized around REST. It has predictable resource-oriented URLs, accepts and returns JSON, and uses standard HTTP response codes and verbs. All API requests must be made over HTTPS.
                  </p>
                  <p>
                    <strong>Base URL</strong>
                  </p>
                  <CodeBlock lang="bash" code={`https://api.bastion.com/v1`} />
                </div>
              </div>
            </section>

            {/* Section: Update a Claim Status (PATCH /claims/{claim_id}) */}
            <section id="patch-claims-claim_id" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Update a Claim Status</h3>
                  <p>
                    Merchants use this endpoint to inform Bastion of a dispute’s final outcome. This feedback loop is critical for improving our risk models and the accuracy of the entire network.
                  </p>
                  <p className="font-medium text-foreground">Endpoint</p>
                  <div className="flex items-center gap-2">
                    <MethodBadge method="PATCH" />
                    <CodeBlock lang="bash" code={`PATCH /claims/{claim_id}`} />
                  </div>
                  <p className="mt-3">
                    <strong>Request Body</strong> — JSON object with:
                  </p>
                  <ul className="list-disc pl-5">
                    <li><code>status</code> (required): <code>"approved"</code> or <code>"denied"</code></li>
                    <li><code>reason</code> (optional): free-form internal notes</li>
                  </ul>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <Tabs defaultValue="patch-claims-curl">
                      <TabsList className="flex flex-wrap gap-2">
                        <TabsTrigger value="patch-claims-curl">Bash</TabsTrigger>
                        <TabsTrigger value="patch-claims-python">Python</TabsTrigger>
                        <TabsTrigger value="patch-claims-js">JavaScript</TabsTrigger>
                        <TabsTrigger value="patch-claims-http">HTTP</TabsTrigger>
                        <TabsTrigger value="patch-claims-body">JSON</TabsTrigger>
                      </TabsList>
                      <TabsContent value="patch-claims-curl" className="mt-3">
                        <CodeBlock
                          lang="bash"
                          code={`curl -X PATCH "https://api.bastion.com/v1/claims/7c7dd3c2-7c2e-45db-8a6b-5af7d4a4d8e2" \\\n  -H "X-API-Key: YOUR_SECRET_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n  "status": "approved",\n  "reason": "Evidence provided matched customer receipt; low risk"\n}'`}
                        />
                      </TabsContent>
                      <TabsContent value="patch-claims-python" className="mt-3">
                        <CodeBlock
                          lang="python"
                          code={`import requests\n\napi_key = "YOUR_SECRET_API_KEY"\nheaders = {"X-API-Key": api_key, "Content-Type": "application/json"}\npayload = {"status": "approved", "reason": "Evidence provided matched customer receipt; low risk"}\nresp = requests.patch("https://api.bastion.com/v1/claims/7c7dd3c2-7c2e-45db-8a6b-5af7d4a4d8e2", headers=headers, json=payload)\nprint(resp.status_code)\nprint(resp.json())`}
                        />
                      </TabsContent>
                      <TabsContent value="patch-claims-js" className="mt-3">
                        <CodeBlock
                          lang="javascript"
                          code={`const apiKey = "YOUR_SECRET_API_KEY";\nconst payload = { status: "approved", reason: "Evidence provided matched customer receipt; low risk" };\n\nfetch("https://api.bastion.com/v1/claims/7c7dd3c2-7c2e-45db-8a6b-5af7d4a4d8e2", {\n  method: "PATCH",\n  headers: {\n    "X-API-Key": apiKey,\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify(payload)\n}).then(r => r.json()).then(console.log);`}
                        />
                      </TabsContent>
                      <TabsContent value="patch-claims-http" className="mt-3">
                        <CodeBlock
                          lang="http"
                          code={`PATCH /v1/claims/7c7dd3c2-7c2e-45db-8a6b-5af7d4a4d8e2 HTTP/1.1\nHost: api.bastion.com\nX-API-Key: YOUR_SECRET_API_KEY\nContent-Type: application/json\n\n{\n  "status": "approved",\n  "reason": "Evidence provided matched customer receipt; low risk"\n}`}
                        />
                      </TabsContent>
                      <TabsContent value="patch-claims-body" className="mt-3">
                        <div className="text-foreground font-medium">Example Request Body</div>
                        <CodeBlock
                          lang="json"
                          code={`{\n  "status": "denied",\n  "reason": "Multiple inconsistencies found in supporting documentation"\n}`}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </aside>
              </div>
            </section>

            {/* Section: Analytics (GET /analytics/summary) */}
            <section id="analytics" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Analytics</h3>
                  <p>
                    The Analytics endpoints provide programmatic access to the same aggregated insights available in the Bastion dashboard, helping you monitor trends and inform internal risk operations.
                  </p>
                  <p className="font-medium text-foreground">Endpoint</p>
                  <div className="flex items-center gap-2">
                    <MethodBadge method="GET" />
                    <CodeBlock lang="bash" code={`GET /analytics/summary`} />
                  </div>
                  <p className="mt-3"><strong>Query Parameters</strong></p>
                  <ul className="list-disc pl-5">
                    <li><code>start_date</code> (optional, <code>YYYY-MM-DD</code>) — Inclusive start of the aggregation window</li>
                    <li><code>end_date</code> (optional, <code>YYYY-MM-DD</code>) — Inclusive end of the aggregation window</li>
                  </ul>
                  <p className="mt-3"><strong>Response Object</strong></p>
                  <ul className="list-disc pl-5">
                    <li><code>total_claims</code> (number)</li>
                    <li><code>approval_rate</code> (number, decimal e.g., <code>0.67</code>)</li>
                    <li><code>denial_rate</code> (number, decimal e.g., <code>0.33</code>)</li>
                    <li><code>top_disputed_items</code> (array of {`{ name, count, total_value }`})</li>
                    <li><code>top_disputed_categories</code> (array of {`{ name, count, total_value }`})</li>
                  </ul>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <Tabs defaultValue="analytics-curl">
                      <TabsList className="flex flex-wrap gap-2">
                        <TabsTrigger value="analytics-curl">Bash</TabsTrigger>
                        <TabsTrigger value="analytics-python">Python</TabsTrigger>
                        <TabsTrigger value="analytics-js">JavaScript</TabsTrigger>
                        <TabsTrigger value="analytics-http">HTTP</TabsTrigger>
                        <TabsTrigger value="analytics-response">JSON</TabsTrigger>
                      </TabsList>
                      <TabsContent value="analytics-curl" className="mt-3">
                        <CodeBlock
                          lang="bash"
                          code={`curl "https://api.bastion.com/v1/analytics/summary?start_date=2024-01-01&end_date=2024-01-31" \\\n  -H "X-API-Key: YOUR_SECRET_API_KEY"`}
                        />
                      </TabsContent>
                      <TabsContent value="analytics-python" className="mt-3">
                        <CodeBlock
                          lang="python"
                          code={`import requests\n\napi_key = "YOUR_SECRET_API_KEY"\nheaders = {"X-API-Key": api_key}\nurl = "https://api.bastion.com/v1/analytics/summary"\nparams = {"start_date": "2024-01-01", "end_date": "2024-01-31"}\nresp = requests.get(url, headers=headers, params=params)\nprint(resp.json())`}
                        />
                      </TabsContent>
                      <TabsContent value="analytics-js" className="mt-3">
                        <CodeBlock
                          lang="javascript"
                          code={`const apiKey = "YOUR_SECRET_API_KEY";\nconst params = new URLSearchParams({ start_date: "2024-01-01", end_date: "2024-01-31" });\nfetch("https://api.bastion.com/v1/analytics/summary?" + params.toString(), {\n  headers: { "X-API-Key": apiKey }\n}).then(r => r.json()).then(console.log);`}
                        />
                      </TabsContent>
                      <TabsContent value="analytics-http" className="mt-3">
                        <CodeBlock
                          lang="http"
                          code={`GET /v1/analytics/summary?start_date=2024-01-01&end_date=2024-01-31 HTTP/1.1\nHost: api.bastion.com\nX-API-Key: YOUR_SECRET_API_KEY`}
                        />
                      </TabsContent>
                      <TabsContent value="analytics-response" className="mt-3">
                        <div className="text-foreground font-medium">Example Response (200 OK)</div>
                        <CodeBlock
                          lang="json"
                          code={`{\n  "total_claims": 1245,\n  "approval_rate": 0.61,\n  "denial_rate": 0.39,\n  "top_disputed_items": [\n    { "name": "Noise-Canceling Headphones", "count": 127, "total_value": 25499.00 },\n    { "name": "iPhone 15 Pro", "count": 92, "total_value": 119999.00 },\n    { "name": "Black T-Shirt", "count": 76, "total_value": 2280.00 }\n  ],\n  "top_disputed_categories": [\n    { "name": "Electronics", "count": 411, "total_value": 235000.00 },\n    { "name": "Clothing", "count": 302, "total_value": 18950.00 },\n    { "name": "Accessories", "count": 156, "total_value": 6740.00 }\n  ]\n}`}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </aside>
              </div>
            </section>

            {/* Section: API Best Practices */}
            <section id="api-best-practices" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">API Best Practices</h3>

                  {/* Sub-section: Pagination */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-foreground">Pagination</h4>
                    <p>
                      Endpoints returning lists (for example, a user’s claims) are paginated for consistent performance.
                    </p>
                    <ul className="list-disc pl-5">
                      <li><code>limit</code> (optional): number of items to return (default 25, maximum 100)</li>
                      <li><code>offset</code> (optional): number of items to skip before starting to return results</li>
                    </ul>
                    <div className="rounded-lg border bg-card p-4 space-y-3">
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <Chip label="curl" kind="curl" />
                      </div>
                      <CodeBlock
                        lang="bash"
                        code={`curl "https://api.bastion.com/v1/claims?limit=25&offset=50" \\\n  -H "X-API-Key: YOUR_SECRET_API_KEY"`}
                      />
                      <div className="text-foreground font-medium">Example Response</div>
                      <CodeBlock
                        lang="json"
                        code={`{\n  "data": [\n    { "id": "a1...", "user_id": "u1...", "status": "APPROVED", "created_at": "2024-01-10T12:00:00Z" },\n    { "id": "a2...", "user_id": "u1...", "status": "DENIED",   "created_at": "2024-01-11T09:31:00Z" }\n  ],\n  "pagination": {\n    "total": 245,\n    "limit": 25,\n    "offset": 50\n  }\n}`}
                      />
                    </div>
                  </div>

                  {/* Sub-section: Rate Limiting */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-foreground">Rate Limiting</h4>
                    <p>
                      Our API is rate-limited to 100 requests per minute per API key. If you exceed the limit, we return <code>HTTP 429 Too Many Requests</code>.
                    </p>
                    <p>
                      Each response includes standard rate limit headers: <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, and <code>X-RateLimit-Reset</code> (UTC epoch timestamp for reset).
                    </p>
                    <div className="rounded-lg border bg-card p-4">
                      <div className="text-foreground font-medium mb-2">Example 429 Response</div>
                      <CodeBlock lang="json" code={`{\n  "error": "rate_limit_exceeded",\n  "message": "Too many requests. Please retry after the reset time."\n}`} />
                    </div>
                  </div>

                  {/* Sub-section: Idempotency */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-foreground">Idempotency</h4>
                    <p>
                      To safely retry <code>POST</code> requests without creating duplicates, include a unique <code>Idempotency-Key</code> header. If a request with the same key is received again, the API does not re-process the request and returns the original result.
                    </p>
                    <div className="rounded-lg border bg-card p-4 space-y-3">
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <Chip label="curl" kind="curl" />
                      </div>
                      <CodeBlock
                        lang="bash"
                        code={`curl -X POST "https://api.bastion.com/v1/claims" \\\n  -H "X-API-Key: YOUR_SECRET_API_KEY" \\\n  -H "Idempotency-Key: c3b6f9de-3e8b-4f27-adc5-e1b6c9fd2a7c" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "kyc_data": { "full_name": "John Appleseed", "dob": "1990-01-01", "kyc_email": "john.appleseed@icloud.com" },\n    "claim_context": {\n      "store_id": "store_uuid_YOUR_STORE",\n      "email_at_store": "john.a.store@example.com",\n      "claim_data": [\n        { "item_name": "Laptop Sleeve", "category": "Accessories", "price": 49.99, "quantity": 1, "url": "https://yourstore.com/products/sleeve" }\n      ]\n    }\n  }'`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Authentication */}
            <section id="authentication" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Authentication</h3>
                  <p>
                    The Bastion API uses API keys to authenticate requests. You can view and manage your API keys in the Bastion Dashboard under <strong>Settings &gt; API Keys</strong>.
                  </p>
                  <p>
                    Your API keys carry many privileges, so be sure to keep them secure. Do not share your secret API keys in publicly accessible areas such as GitHub or client-side code. Authentication is performed by providing your key in the <code>X-API-Key</code> HTTP header. Requests without authentication will fail with a <code>401 Unauthorized</code> error.
                  </p>
                  <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Chip label="curl" kind="curl" />
                      <span className="text-xs text-muted-foreground">example</span>
                    </div>
                    <CodeBlock
                      lang="bash"
                      code={`# Example of an authenticated request using cURL\ncurl "https://api.bastion.com/v1/users/jane.d.doe%40gmail.com" \\\n  -H "X-API-Key: YOUR_SECRET_API_KEY"`}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Core Concepts */}
            <section id="core-concepts" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Core Concepts: The Data Objects</h3>
                  <p>
                    To understand the API, it's important to understand the core data objects. Our system is designed around a "master identity" model.
                  </p>
                  <p>
                    <strong>The User Object:</strong> This represents a single, unique human being who has been verified by a KYC process. This object is the master record and contains the overall risk assessment. A user is uniquely identified by their <code>kyc_email</code>.
                  </p>
                  <p>
                    <strong>The Store Account Object:</strong> This object links a master User to their specific account at one of your Stores. A single User can have multiple <code>StoreAccount</code> objects, allowing you to track their activity across different properties.
                  </p>
                  <p>
                    <strong>The Claim Object:</strong> This represents a single return or dispute event. It is always linked to a specific <code>StoreAccount</code> and contains details about the products and the event's status.
                  </p>
                </div>
              </div>
            </section>

            {/* Section: Retrieve a User Profile (GET /users/{kyc_email}) */}
            <section id="get-users-kyc_email" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Retrieve a User Profile</h3>
                  <p>
                    This is the primary endpoint for enriching your user data. Given a user's unique KYC email, this endpoint returns a complete, aggregated profile of that user, including their overall risk score, all of their known store accounts, and a full history of every claim they have ever made.
                  </p>
                  <p className="font-medium text-foreground">Endpoint</p>
                  <CodeBlock lang="bash" code={`GET /users/{kyc_email}`} />
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <Tabs defaultValue="get-users-curl">
                      <TabsList className="flex flex-wrap gap-2">
                        <TabsTrigger value="get-users-curl">Bash</TabsTrigger>
                        <TabsTrigger value="get-users-python">Python</TabsTrigger>
                        <TabsTrigger value="get-users-js">JavaScript</TabsTrigger>
                        <TabsTrigger value="get-users-response">JSON</TabsTrigger>
                      </TabsList>
                      <TabsContent value="get-users-curl" id="get-users-curl" className="mt-3">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Chip label="curl" kind="curl" />
                        </div>
                        <CodeBlock
                          lang="bash"
                          code={`# cURL Request\ncurl "https://api.bastion.com/v1/users/jane.d.doe%40gmail.com" \\\n  -H "X-API-Key: YOUR_SECRET_API_KEY"`}
                        />
                      </TabsContent>
                      <TabsContent value="get-users-python" id="get-users-python" className="mt-3">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Chip label="Python" kind="python" />
                          <span className="text-xs text-muted-foreground">requests</span>
                        </div>
                        <CodeBlock
                          lang="python"
                          code={`# Python (requests)\nimport requests\n\napi_key = "YOUR_SECRET_API_KEY"\nkyc_email = "jane.d.doe@gmail.com"\n\nheaders = {"X-API-Key": api_key}\nresponse = requests.get(\n    f"https://api.bastion.com/v1/users/{kyc_email}",\n    headers=headers\n)\n\nprint(response.json())`}
                        />
                      </TabsContent>
                      <TabsContent value="get-users-js" id="get-users-js" className="mt-3">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Chip label="JavaScript" kind="js" />
                          <span className="text-xs text-muted-foreground">fetch</span>
                        </div>
                        <CodeBlock
                          lang="javascript"
                          code={`// JavaScript (fetch)\nconst apiKey = "YOUR_SECRET_API_KEY";\nconst kycEmail = "jane.d.doe@gmail.com";\n\nfetch(` + "`https://api.bastion.com/v1/users/${kycEmail}`" + `, {\n  method: "GET",\n  headers: { "X-API-Key": apiKey },\n})\n  .then((response) => response.json())\n  .then((data) => console.log(data));`}
                        />
                      </TabsContent>
                      <TabsContent value="get-users-response" id="get-users-response" className="mt-3">
                        <div className="text-foreground font-medium">Example Response (200 OK)</div>
                        <CodeBlock
                          lang="json"
                          code={`{\n  "id": "user_uuid_111AAA",\n  "kyc_email": "jane.d.doe@gmail.com",\n  "full_name": "Jane Doe",\n  "dob": "1998-11-20",\n  "risk_score": 85,\n  "is_flagged": true,\n  "created_at": "2025-09-13T18:15:00Z",\n  "store_accounts": [\n    {\n      "id": "store_account_uuid_222BBB",\n      "store_id": "store_uuid_BESTBUY",\n      "store_name": "Best Buy",\n      "email_at_store": "janes_shopping_acct@yahoo.com",\n      "claims": [\n        {\n          "id": "claim_uuid_C1",\n          "status": "DENIED",\n          "created_at": "2025-09-13T18:15:00Z",\n          "claim_data": [\n            {\n              "item_name": "Wireless Headphones",\n              "category": "Electronics",\n              "price": 299.99,\n              "quantity": 1\n            }\n          ]\n        }\n      ]\n    },\n    {\n      "id": "store_account_uuid_333CCC",\n      "store_id": "store_uuid_UBER",\n      "store_name": "Uber",\n      "email_at_store": "jane.doe@uber.com",\n      "claims": [\n        {\n          "id": "claim_uuid_C2",\n          "status": "APPROVED",\n          "created_at": "2025-10-02T11:45:00Z",\n          "claim_data": [\n            {\n              "item_name": "Lost Item Fee",\n              "category": "Fees",\n              "price": 15.00,\n              "quantity": 1\n            }\n          ]\n        }\n      ]\n    }\n  ]\n}`}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </aside>
              </div>
            </section>

            {/* Section: Submit a Claim (POST /claims) */}
            <section id="post-claims" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Submit a Claim</h3>
                  <p>
                    This endpoint allows you to send claim data to Bastion for analysis. When you submit a claim, our system performs the "Find or Create" logic, updates the user's risk score, and records the new claim event. This is the primary method for contributing data to the Bastion network.
                  </p>
                  <p className="font-medium text-foreground">Endpoint</p>
                  <CodeBlock lang="bash" code={`POST /claims`} />
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <Tabs defaultValue="post-claims-python">
                      <TabsList className="flex flex-wrap gap-2">
                        <TabsTrigger value="post-claims-curl">Bash</TabsTrigger>
                        <TabsTrigger value="post-claims-python">Python</TabsTrigger>
                        <TabsTrigger value="post-claims-js">JavaScript</TabsTrigger>
                        <TabsTrigger value="post-claims-response">JSON</TabsTrigger>
                      </TabsList>
                      <TabsContent value="post-claims-curl" id="post-claims-curl" className="mt-3">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Chip label="curl" kind="curl" />
                        </div>
                        <CodeBlock
                          lang="bash"
                          code={`curl -X POST "https://api.bastion.com/v1/claims" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_SECRET_API_KEY" \\
  -d '{
  "kyc_data": {
    "full_name": "John Appleseed",
    "dob": "1990-01-01",
    "kyc_email": "john.appleseed@icloud.com"
  },
  "claim_context": {
    "store_id": "store_uuid_YOUR_STORE",
    "email_at_store": "john.a.store@example.com",
    "claim_data": [
      {
        "item_name": "Laptop Sleeve",
        "category": "Accessories",
        "price": 49.99,
        "quantity": 1,
        "url": "https://yourstore.com/products/sleeve"
      }
    ]
  }
}'`}
                        />
                      </TabsContent>
                      <TabsContent value="post-claims-python" id="post-claims-python" className="mt-3">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Chip label="Python" kind="python" />
                          <span className="text-xs text-muted-foreground">requests</span>
                        </div>
                        <CodeBlock
                          lang="python"
                          code={`# Python (requests)\nimport requests\n\napi_key = "YOUR_SECRET_API_KEY"\nheaders = {"X-API-Key": api_key, "Content-Type": "application/json"}\n\npayload = {\n  "kyc_data": {\n    "full_name": "John Appleseed",\n    "dob": "1990-01-01",\n    "kyc_email": "john.appleseed@icloud.com"\n  },\n  "claim_context": {\n    "store_id": "store_uuid_YOUR_STORE",\n    "email_at_store": "john.a.store@example.com",\n    "claim_data": [\n      {\n        "item_name": "Laptop Sleeve",\n        "category": "Accessories",\n        "price": 49.99,\n        "quantity": 1,\n        "url": "https://yourstore.com/products/sleeve"\n      }\n    ]\n  }\n}\n\nresponse = requests.post(\n    "https://api.bastion.com/v1/claims",\n    headers=headers,\n    json=payload\n)\n\nprint(response.status_code)\nprint(response.json())`}
                        />
                      </TabsContent>
                      <TabsContent value="post-claims-js" id="post-claims-js" className="mt-3">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Chip label="JavaScript" kind="js" />
                          <span className="text-xs text-muted-foreground">fetch</span>
                        </div>
                        <CodeBlock
                          lang="javascript"
                          code={`// JavaScript (fetch)\nconst apiKey = "YOUR_SECRET_API_KEY";\n\nconst payload = {\n  kyc_data: {\n    full_name: "John Appleseed",\n    dob: "1990-01-01",\n    kyc_email: "john.appleseed@icloud.com"\n  },\n  claim_context: {\n    store_id: "store_uuid_YOUR_STORE",\n    email_at_store: "john.a.store@example.com",\n    claim_data: [\n      {\n        item_name: "Laptop Sleeve",\n        category: "Accessories",\n        price: 49.99,\n        quantity: 1,\n        url: "https://yourstore.com/products/sleeve"\n      }\n    ]\n  }\n};\n\nfetch("https://api.bastion.com/v1/claims", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "X-API-Key": apiKey\n  },\n  body: JSON.stringify(payload)\n})\n  .then((response) => response.json())\n  .then((data) => console.log(data));`}
                        />
                      </TabsContent>
                      <TabsContent value="post-claims-response" id="post-claims-response" className="mt-3">
                        <div className="text-foreground font-medium">Example Response (201 Created)</div>
                        <CodeBlock lang="json" code={`Returns the newly created Claim object.`} />
                      </TabsContent>
                    </Tabs>
                  </div>
                </aside>
              </div>
            </section>

            {/* Section: Webhooks */}
            <section id="webhooks" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Webhooks</h3>
                  <p>
                    To avoid continuously polling the API for updates, you can use webhooks. Bastion can send real-time notifications to your server when important events occur. This is the recommended way to build an automated integration.
                  </p>
                  <p>
                    You can configure your webhook endpoints in the Bastion Dashboard under <strong>Settings &gt; Webhooks</strong>. To ensure security, all webhook requests are signed with a unique signing secret.
                  </p>
                  <p className="font-medium text-foreground">Key Webhook Events</p>
                  <ul className="list-disc pl-5">
                    <li><code>claim.risk_assessment.high</code>: Sent when a newly submitted claim results in a user's risk score exceeding a critical threshold (e.g., 75%).</li>
                    <li><code>user.flagged</code>: Sent when a user's status is manually changed to "Flagged" by an analyst in the Bastion dashboard.</li>
                  </ul>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-foreground font-medium mb-2">Example Webhook Payload</div>
                    <p className="mb-2">This is an example of the JSON data your server would receive for a <code>claim.risk_assessment.high</code> event.</p>
                    <CodeBlock
                      lang="json"
                      code={`{\n  "event_id": "evt_uuid_123",\n  "event_type": "claim.risk_assessment.high",\n  "created_at": "2025-11-01T10:00:00Z",\n  "data": {\n    "claim_id": "claim_uuid_C3",\n    "user_id": "user_uuid_111AAA",\n    "kyc_email": "jane.d.doe@gmail.com",\n    "risk_score": 85,\n    "reasons": ["Multiple accounts at store", "High-value item in claim"]\n  }\n}`}
                    />
                  </div>
                </aside>
              </div>
            </section>

            {/* Section: Error Handling */}
            <section id="error-handling" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Error Handling</h3>
                  <p>
                    Bastion uses conventional HTTP response codes to indicate the success or failure of a request. All error responses will return a JSON object with a <code>detail</code> key containing a human-readable error message.
                  </p>
                  <ul className="list-disc pl-5">
                    <li>
                      <strong>400 Bad Request</strong> — Invalid Request. The request body was malformed or missing required parameters.
                    </li>
                    <li>
                      <strong>401 Unauthorized</strong> — Authentication Error. No API key was provided, or the key is invalid.
                    </li>
                    <li>
                      <strong>404 Not Found</strong> — Resource Not Found. The requested resource does not exist.
                    </li>
                    <li>
                      <strong>500 Server Error</strong> — Internal Bastion Error. Something went wrong on our end.
                    </li>
                  </ul>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-foreground font-medium mb-2">Error response</div>
                    <CodeBlock lang="json" code={`{\n  "detail": "A human-readable description of the error."\n}`} />
                  </div>
                </aside>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
