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
    lang: "bash" | "json" | "python" | "javascript";
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
          <code className={`language-${lang}`}>{code}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">API Docs</h2>
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
        `}
      </style>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Developer Documentation
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Bastion Bastion API reference and guides. For the complete Markdown
            reference, see <code>API_DOCS.md</code> in the repository root.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-16 text-sm text-muted-foreground">
            {/* Section: Introduction */}
            <section id="introduction" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Introduction & Core Concepts
                  </h3>
                  <p>
                    Bastion helps e‑commerce stores detect and prevent return
                    fraud. The Bastion API lets you submit return claims for
                    fraud analysis and retrieve a user’s lifetime claim history
                    across integrated stores.
                  </p>
                  <p>
                    <strong>Base URL:</strong>{" "}
                    <code>https://api.bastion.com/v1</code>
                  </p>
                  <p>
                    <strong>Find or Create workflow:</strong> On claim
                    submission, Bastion finds a master <code>User</code>
                    by <code>kyc_email</code> (or creates one), then finds or
                    creates a <code>StoreAccount</code> for that user and{" "}
                    <code>store_id</code>, computes a risk score, and records
                    the <code>Claim</code>.
                  </p>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4">
                    <div id="intro-curl" className="mt-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Chip label="curl" kind="curl" />
                        <span className="text-xs text-muted-foreground">
                          example
                        </span>
                      </div>
                      <CodeBlock
                        lang="bash"
                        code={`curl -X GET "https://api.bastion.com/v1/health" \\
-H "X-API-Key: <YOUR_API_KEY>"`}
                      />
                    </div>
                  </div>
                </aside>
              </div>
            </section>

            {/* Section: Authentication */}
            <section id="authentication" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Authentication
                  </h3>
                  <p>
                    Authenticate by passing your API key via the{" "}
                    <code>X-API-Key</code> header. All requests must use HTTPS.
                    Requests without authentication or using HTTP will fail with{" "}
                    <code>401</code>.
                  </p>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4">
                    <div className="mt-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Chip label="curl" kind="curl" />
                        <span className="text-xs text-muted-foreground">
                          example
                        </span>
                      </div>
                      <CodeBlock
                        lang="bash"
                        code={`curl -X GET "https://api.bastion.com/v1/health" \\
-H "X-API-Key: <YOUR_API_KEY>"`}
                      />
                    </div>
                    <p className="mt-3">
                      Missing or invalid keys return{" "}
                      <code>401 Unauthorized</code>.
                    </p>
                  </div>
                </aside>
              </div>
            </section>

            {/* Section: Data Models */}
            <section id="data-models" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Data Models / Schemas
                  </h3>
                  <p>
                    <strong>User</strong>: master, KYC‑verified identity.
                  </p>
                  <ul className="list-disc pl-5">
                    <li>
                      <code>id</code> (uuid), <code>kyc_email</code> (string),{" "}
                      <code>full_name</code> (string), <code>dob</code>{" "}
                      (YYYY‑MM‑DD)
                    </li>
                    <li>
                      <code>risk_score</code> (0–100), <code>is_flagged</code>{" "}
                      (boolean), <code>created_at</code> (ISO 8601)
                    </li>
                  </ul>
                  <p>
                    <strong>StoreAccount</strong>: user’s account at a single
                    store.
                  </p>
                  <ul className="list-disc pl-5">
                    <li>
                      <code>id</code> (uuid), <code>user_id</code> (uuid),{" "}
                      <code>store_id</code> (uuid), <code>email_at_store</code>{" "}
                      (string)
                    </li>
                  </ul>
                  <p>
                    <strong>ItemData</strong>: item within a claim.
                  </p>
                  <ul className="list-disc pl-5">
                    <li>
                      <code>item_name</code> (string), <code>category</code>{" "}
                      (string), <code>price</code> (float),{" "}
                      <code>quantity</code> (int), <code>url</code> (string?)
                    </li>
                  </ul>
                  <p>
                    <strong>Claim</strong>: primary claim object.
                  </p>
                  <ul className="list-disc pl-5">
                    <li>
                      <code>id</code> (uuid), <code>store_account_id</code>{" "}
                      (uuid), <code>status</code>{" "}
                      ("PENDING"|"APPROVED"|"DENIED"), <code>claim_data</code>{" "}
                      (ItemData[]), <code>created_at</code> (ISO 8601)
                    </li>
                  </ul>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-foreground font-medium mb-2">
                      Example User object
                    </div>
                    <CodeBlock
                      lang="json"
                      code={`{
  "id": "usr_01abc...",
  "kyc_email": "jane.d.doe@gmail.com",
  "full_name": "Jane Doe",
  "dob": "1998-11-20",
  "risk_score": 74,
  "is_flagged": true,
  "created_at": "2023-05-01T12:00:00Z"
}`}
                    />
                  </div>
                </aside>
              </div>
            </section>

            {/* Section: POST /claims */}
            <section id="post-claims" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    POST /claims
                  </h3>
                  <p>
                    Submit a new return claim. Bastion performs Find‑or‑Create
                    for <code>User</code> and
                    <code> StoreAccount</code>, computes risk, and records the{" "}
                    <code>Claim</code>.
                  </p>
                  <p className="font-medium text-foreground">Request body</p>
                  <CodeBlock
                    lang="json"
                    code={`{
  "kyc_data": {
    "full_name": "Jane Doe",
    "dob": "1998-11-20",
    "kyc_email": "jane.d.doe@gmail.com"
  },
  "claim_context": {
    "store_id": "8765-uuid-of-store",
    "email_at_store": "jane.doe.promo@outlook.com",
    "claim_data": [
      {
        "item_name": "iPhone 16 Max",
        "category": "Electronics",
        "price": 1299.99,
        "quantity": 1,
        "url": "https://store.example.com/product/123"
      }
    ]
  }
}`}
                  />
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <Tabs defaultValue="post-claims-curl">
                      <TabsList className="flex flex-wrap gap-2">
                        <TabsTrigger value="post-claims-curl">curl</TabsTrigger>
                        <TabsTrigger value="post-claims-python">
                          Python
                        </TabsTrigger>
                        <TabsTrigger value="post-claims-js">
                          JavaScript
                        </TabsTrigger>
                        <TabsTrigger value="post-claims-response">
                          Response
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent
                        value="post-claims-curl"
                        id="post-claims-curl"
                        className="mt-3"
                      >
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Chip label="curl" kind="curl" />
                        </div>
                        <CodeBlock
                          lang="bash"
                          code={`curl -X POST "https://api.bastion.com/v1/claims" \\
+-H "Content-Type: application/json" \\
+-H "X-API-Key: <YOUR_API_KEY>" \\
+-d '{
  "kyc_data": {"full_name": "Jane Doe", "dob": "1998-11-20", "kyc_email": "jane.d.doe@gmail.com"},
  "claim_context": {"store_id": "8765-uuid-of-store", "email_at_store": "jane.doe.promo@outlook.com", "claim_data": [{"item_name": "iPhone 16 Max", "category": "Electronics", "price": 1299.99, "quantity": 1, "url": "https://store.example.com/product/123"}]}
}'`}
                        />
                      </TabsContent>
                      <TabsContent
                        value="post-claims-python"
                        id="post-claims-python"
                        className="mt-3"
                      >
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Chip label="Python" kind="python" />
                          <span className="text-xs text-muted-foreground">
                            requests
                          </span>
                        </div>
                        <CodeBlock
                          lang="python"
                          code={`import os, requests

BASE_URL = "https://api.bastion.com/v1"
API_KEY = os.getenv("Bastion_API_KEY", "sk_test_123")

payload = {
  "kyc_data": {"full_name": "Jane Doe", "dob": "1998-11-20", "kyc_email": "jane.d.doe@gmail.com"},
  "claim_context": {"store_id": "8765-uuid-of-store", "email_at_store": "jane.doe.promo@outlook.com", "claim_data": [{"item_name": "iPhone 16 Max", "category": "Electronics", "price": 1299.99, "quantity": 1, "url": "https://store.example.com/product/123"}]}
}

r = requests.post(f"{BASE_URL}/claims", json=payload, headers={"X-API-Key": API_KEY}, timeout=30)
r.raise_for_status()
print(r.json())`}
                        />
                      </TabsContent>
                      <TabsContent
                        value="post-claims-js"
                        id="post-claims-js"
                        className="mt-3"
                      >
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Chip label="JavaScript" kind="js" />
                          <span className="text-xs text-muted-foreground">
                            fetch
                          </span>
                        </div>
                        <CodeBlock
                          lang="javascript"
                          code={`const BASE_URL = "https://api.bastion.com/v1";
const API_KEY = "sk_test_123";

const payload = {
  kyc_data: { full_name: "Jane Doe", dob: "1998-11-20", kyc_email: "jane.d.doe@gmail.com" },
  claim_context: { store_id: "8765-uuid-of-store", email_at_store: "jane.doe.promo@outlook.com", claim_data: [ { item_name: "iPhone 16 Max", category: "Electronics", price: 1299.99, quantity: 1, url: "https://store.example.com/product/123" } ] }
};

fetch(BASE_URL + '/claims', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY }, body: JSON.stringify(payload) })
  .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .then(json => console.log(json));`}
                        />
                      </TabsContent>
                      <TabsContent
                        value="post-claims-response"
                        id="post-claims-response"
                        className="mt-3"
                      >
                        <div className="text-foreground font-medium">
                          Example response (201)
                        </div>
                        <CodeBlock
                          lang="json"
                          code={`{
  "id": "clm_01hv2w4m8x2r9ngq7g9f7c2a1b",
  "store_account_id": "sca_01hv2w8m3n4p5q6r7s8t9u0v1w",
  "status": "PENDING",
  "claim_data": [{"item_name": "iPhone 16 Max", "category": "Electronics", "price": 1299.99, "quantity": 1, "url": "https://store.example.com/product/123"}],
  "created_at": "2025-09-13T23:00:12Z"
}`}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </aside>
              </div>
            </section>

            {/* Section: GET /users/{kyc_email} */}
            <section id="get-users-kyc_email" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    GET /users/{"{"}kyc_email{"}"}
                  </h3>
                  <p>
                    Retrieve a complete master user profile, including all{" "}
                    <code>StoreAccount</code>s and their <code>Claim</code>s.
                  </p>
                  <p className="font-medium text-foreground">Path parameter</p>
                  <ul className="list-disc pl-5">
                    <li>
                      <code>kyc_email</code> (string, required): URL‑encoded KYC
                      email of the user
                    </li>
                  </ul>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <Tabs defaultValue="get-users-curl">
                      <TabsList className="flex flex-wrap gap-2">
                        <TabsTrigger value="get-users-curl">curl</TabsTrigger>
                        <TabsTrigger value="get-users-python">
                          Python
                        </TabsTrigger>
                        <TabsTrigger value="get-users-js">
                          JavaScript
                        </TabsTrigger>
                        <TabsTrigger value="get-users-response">
                          Response
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent
                        value="get-users-curl"
                        id="get-users-curl"
                        className="mt-3"
                      >
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Chip label="curl" kind="curl" />
                        </div>
                        <CodeBlock
                          lang="bash"
                          code={`kyc_email="jane.d.doe@gmail.com"
curl -X GET "https://api.bastion.com/v1/users/$(python -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$kyc_email")" \\
+-H "X-API-Key: <YOUR_API_KEY>"`}
                        />
                      </TabsContent>
                      <TabsContent
                        value="get-users-python"
                        id="get-users-python"
                        className="mt-3"
                      >
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Chip label="Python" kind="python" />
                          <span className="text-xs text-muted-foreground">
                            requests
                          </span>
                        </div>
                        <CodeBlock
                          lang="python"
                          code={`import os, requests

BASE_URL = "https://api.bastion.com/v1"
API_KEY = os.getenv("Bastion_API_KEY", "sk_test_123")

email = "jane.d.doe@gmail.com"
r = requests.get(f"{BASE_URL}/users/{requests.utils.quote(email)}", headers={"X-API-Key": API_KEY}, timeout=30)
r.raise_for_status()
print(r.json())`}
                        />
                      </TabsContent>
                      <TabsContent
                        value="get-users-js"
                        id="get-users-js"
                        className="mt-3"
                      >
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Chip label="JavaScript" kind="js" />
                          <span className="text-xs text-muted-foreground">
                            fetch
                          </span>
                        </div>
                        <CodeBlock
                          lang="javascript"
                          code={`const BASE_URL = "https://api.bastion.com/v1";
const API_KEY = "sk_test_123";
const kycEmail = encodeURIComponent('jane.d.doe@gmail.com');
fetch(BASE_URL + '/users/' + kycEmail, { headers: { 'X-API-Key': API_KEY } })
  .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .then(json => console.log(json));`}
                        />
                      </TabsContent>
                      <TabsContent
                        value="get-users-response"
                        id="get-users-response"
                        className="mt-3"
                      >
                        <div className="text-foreground font-medium">
                          Example response (200)
                        </div>
                        <CodeBlock
                          lang="json"
                          code={`{
  "id": "usr_01hv2x7y8z9a0b1c2d3e4f5g6h",
  "kyc_email": "jane.d.doe@gmail.com",
  "full_name": "Jane Doe",
  "dob": "1998-11-20",
  "risk_score": 74,
  "is_flagged": true,
  "created_at": "2023-05-01T12:00:00Z",
  "store_accounts": [
    {
      "id": "sca_01hv2w8m3n4p5q6r7s8t9u0v1w",
      "user_id": "usr_01hv2x7y8z9a0b1c2d3e4f5g6h",
      "store_id": "8765-uuid-of-store",
      "email_at_store": "jane.doe.promo@outlook.com",
      "claims": [
        {
          "id": "clm_01hv2w4m8x2r9ngq7g9f7c2a1b",
          "store_account_id": "sca_01hv2w8m3n4p5q6r7s8t9u0v1w",
          "status": "PENDING",
          "claim_data": [{"item_name": "iPhone 16 Max", "category": "Electronics", "price": 1299.99, "quantity": 1, "url": "https://store.example.com/product/123"}],
          "created_at": "2025-09-13T23:00:12Z"
        }
      ]
    }
  ]
}`}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </aside>
              </div>
            </section>

            {/* Section: Error Handling */}
            <section id="error-handling" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Error Handling
                  </h3>
                  <p>
                    Errors return JSON with a single <code>detail</code> field.
                  </p>
                  <ul className="list-disc pl-5">
                    <li>
                      <code>400</code> Bad Request
                    </li>
                    <li>
                      <code>401</code> Unauthorized
                    </li>
                    <li>
                      <code>403</code> Forbidden
                    </li>
                    <li>
                      <code>404</code> Not Found
                    </li>
                    <li>
                      <code>500</code> Internal Server Error
                    </li>
                  </ul>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-foreground font-medium mb-2">
                      Error response
                    </div>
                    <CodeBlock
                      lang="json"
                      code={`{
  "detail": "A human-readable description of the error."
}`}
                    />
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
