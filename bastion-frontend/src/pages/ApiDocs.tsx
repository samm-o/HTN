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
        <h2 className="text-3xl font-bold text-foreground">
          Bastion API Documentation
        </h2>
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
            Bastion API
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Welcome to the Bastion API. Use our REST API to integrate fraud
            detection, retrieve user risk, and submit claims. All responses are
            JSON over HTTPS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-16 text-sm text-muted-foreground">
            {/* Section: Introduction */}
            <section id="introduction" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Introduction
                  </h3>
                  <p>
                    Welcome to the Bastion API. Our platform provides businesses
                    with programmatic access to our cross-platform fraud
                    detection engine. You can use this API to enrich your own
                    systems with a user's comprehensive return history,
                    real-time risk scores, and detailed claim information.
                  </p>
                  <p>
                    The Bastion API is organized around REST. It has predictable
                    resource-oriented URLs, accepts and returns JSON, and uses
                    standard HTTP response codes and verbs. All API requests
                    must be made over HTTPS.
                  </p>
                  <p>
                    <strong>Base URL</strong>
                  </p>
                  <CodeBlock lang="bash" code={`https://api.bastion.com/v1`} />
                </div>
              </div>
            </section>

            {/* Section: Authentication */}
            <section id="authentication" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Authentication
                  </h3>
                  <p>
                    The Bastion API uses API keys to authenticate requests. You
                    can view and manage your API keys in the Bastion Dashboard
                    under <strong>Settings &gt; API Keys</strong>.
                  </p>
                  <p>
                    Your API keys carry many privileges, so be sure to keep them
                    secure. Do not share your secret API keys in publicly
                    accessible areas such as GitHub or client-side code.
                    Authentication is performed by providing your key in the{" "}
                    <code>X-API-Key</code> HTTP header. Requests without
                    authentication will fail with a{" "}
                    <code>401 Unauthorized</code> error.
                  </p>
                  <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Chip label="curl" kind="curl" />
                      <span className="text-xs text-muted-foreground">
                        example
                      </span>
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
                  <h3 className="text-xl font-semibold text-foreground">
                    Core Concepts: The Data Objects
                  </h3>
                  <p>
                    To understand the API, it's important to understand the core
                    data objects. Our system is designed around a "master
                    identity" model.
                  </p>
                  <p>
                    <strong>The User Object:</strong> This represents a single,
                    unique human being who has been verified by a KYC process.
                    This object is the master record and contains the overall
                    risk assessment. A user is uniquely identified by their{" "}
                    <code>kyc_email</code>.
                  </p>
                  <p>
                    <strong>The Store Account Object:</strong> This object links
                    a master User to their specific account at one of your
                    Stores. A single User can have multiple{" "}
                    <code>StoreAccount</code> objects, allowing you to track
                    their activity across different properties.
                  </p>
                  <p>
                    <strong>The Claim Object:</strong> This represents a single
                    return or dispute event. It is always linked to a specific{" "}
                    <code>StoreAccount</code> and contains details about the
                    products and the event's status.
                  </p>
                </div>
              </div>
            </section>

            {/* Section: Retrieve a User Profile (GET /users/{kyc_email}) */}
            <section id="get-users-kyc_email" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Retrieve a User Profile
                  </h3>
                  <p>
                    This is the primary endpoint for enriching your user data.
                    Given a user's unique KYC email, this endpoint returns a
                    complete, aggregated profile of that user, including their
                    overall risk score, all of their known store accounts, and a
                    full history of every claim they have ever made.
                  </p>
                  <p className="font-medium text-foreground">Endpoint</p>
                  <CodeBlock lang="bash" code={`GET /users/{kyc_email}`} />
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <Tabs defaultValue="get-users-curl">
                      <TabsList className="flex flex-wrap gap-2">
                        <TabsTrigger value="get-users-curl">Bash</TabsTrigger>
                        <TabsTrigger value="get-users-python">
                          Python
                        </TabsTrigger>
                        <TabsTrigger value="get-users-js">
                          JavaScript
                        </TabsTrigger>
                        <TabsTrigger value="get-users-response">
                          JSON
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
                          code={`# cURL Request\ncurl "https://api.bastion.com/v1/users/jane.d.doe%40gmail.com" \\\n  -H "X-API-Key: YOUR_SECRET_API_KEY"`}
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
                          code={`# Python (requests)\nimport requests\n\napi_key = "YOUR_SECRET_API_KEY"\nkyc_email = "jane.d.doe@gmail.com"\n\nheaders = {"X-API-Key": api_key}\nresponse = requests.get(\n    f"https://api.bastion.com/v1/users/{kyc_email}",\n    headers=headers\n)\n\nprint(response.json())`}
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
                          code={
                            `// JavaScript (fetch)\nconst apiKey = "YOUR_SECRET_API_KEY";\nconst kycEmail = "jane.d.doe@gmail.com";\n\nfetch(` +
                            "`https://api.bastion.com/v1/users/${kycEmail}`" +
                            `, {\n  method: "GET",\n  headers: { "X-API-Key": apiKey },\n})\n  .then((response) => response.json())\n  .then((data) => console.log(data));`
                          }
                        />
                      </TabsContent>
                      <TabsContent
                        value="get-users-response"
                        id="get-users-response"
                        className="mt-3"
                      >
                        <div className="text-foreground font-medium">
                          Example Response (200 OK)
                        </div>
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
                  <h3 className="text-xl font-semibold text-foreground">
                    Submit a Claim
                  </h3>
                  <p>
                    This endpoint allows you to send claim data to Bastion for
                    analysis. When you submit a claim, our system performs the
                    "Find or Create" logic, updates the user's risk score, and
                    records the new claim event. This is the primary method for
                    contributing data to the Bastion network.
                  </p>
                  <p className="font-medium text-foreground">Endpoint</p>
                  <CodeBlock lang="bash" code={`POST /claims`} />
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <Tabs defaultValue="post-claims-python">
                      <TabsList className="flex flex-wrap gap-2">
                        <TabsTrigger value="post-claims-curl">Bash</TabsTrigger>
                        <TabsTrigger value="post-claims-python">
                          Python
                        </TabsTrigger>
                        <TabsTrigger value="post-claims-js">
                          JavaScript
                        </TabsTrigger>
                        <TabsTrigger value="post-claims-response">
                          JSON
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
                          code={`# Python (requests)\nimport requests\n\napi_key = "YOUR_SECRET_API_KEY"\nheaders = {"X-API-Key": api_key, "Content-Type": "application/json"}\n\npayload = {\n  "kyc_data": {\n    "full_name": "John Appleseed",\n    "dob": "1990-01-01",\n    "kyc_email": "john.appleseed@icloud.com"\n  },\n  "claim_context": {\n    "store_id": "store_uuid_YOUR_STORE",\n    "email_at_store": "john.a.store@example.com",\n    "claim_data": [\n      {\n        "item_name": "Laptop Sleeve",\n        "category": "Accessories",\n        "price": 49.99,\n        "quantity": 1,\n        "url": "https://yourstore.com/products/sleeve"\n      }\n    ]\n  }\n}\n\nresponse = requests.post(\n    "https://api.bastion.com/v1/claims",\n    headers=headers,\n    json=payload\n)\n\nprint(response.status_code)\nprint(response.json())`}
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
                          code={`// JavaScript (fetch)\nconst apiKey = "YOUR_SECRET_API_KEY";\n\nconst payload = {\n  kyc_data: {\n    full_name: "John Appleseed",\n    dob: "1990-01-01",\n    kyc_email: "john.appleseed@icloud.com"\n  },\n  claim_context: {\n    store_id: "store_uuid_YOUR_STORE",\n    email_at_store: "john.a.store@example.com",\n    claim_data: [\n      {\n        item_name: "Laptop Sleeve",\n        category: "Accessories",\n        price: 49.99,\n        quantity: 1,\n        url: "https://yourstore.com/products/sleeve"\n      }\n    ]\n  }\n};\n\nfetch("https://api.bastion.com/v1/claims", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "X-API-Key": apiKey\n  },\n  body: JSON.stringify(payload)\n})\n  .then((response) => response.json())\n  .then((data) => console.log(data));`}
                        />
                      </TabsContent>
                      <TabsContent
                        value="post-claims-response"
                        id="post-claims-response"
                        className="mt-3"
                      >
                        <div className="text-foreground font-medium">
                          Example Response (201 Created)
                        </div>
                        <CodeBlock
                          lang="json"
                          code={`Returns the newly created Claim object.`}
                        />
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
                  <h3 className="text-xl font-semibold text-foreground">
                    Webhooks
                  </h3>
                  <p>
                    To avoid continuously polling the API for updates, you can
                    use webhooks. Bastion can send real-time notifications to
                    your server when important events occur. This is the
                    recommended way to build an automated integration.
                  </p>
                  <p>
                    You can configure your webhook endpoints in the Bastion
                    Dashboard under <strong>Settings &gt; Webhooks</strong>. To
                    ensure security, all webhook requests are signed with a
                    unique signing secret.
                  </p>
                  <p className="font-medium text-foreground">
                    Key Webhook Events
                  </p>
                  <ul className="list-disc pl-5">
                    <li>
                      <code>claim.risk_assessment.high</code>: Sent when a newly
                      submitted claim results in a user's risk score exceeding a
                      critical threshold (e.g., 75%).
                    </li>
                    <li>
                      <code>user.flagged</code>: Sent when a user's status is
                      manually changed to "Flagged" by an analyst in the Bastion
                      dashboard.
                    </li>
                  </ul>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-foreground font-medium mb-2">
                      Example Webhook Payload
                    </div>
                    <p className="mb-2">
                      This is an example of the JSON data your server would
                      receive for a <code>claim.risk_assessment.high</code>{" "}
                      event.
                    </p>
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
                  <h3 className="text-xl font-semibold text-foreground">
                    Error Handling
                  </h3>
                  <p>
                    Bastion uses conventional HTTP response codes to indicate
                    the success or failure of a request. All error responses
                    will return a JSON object with a <code>detail</code> key
                    containing a human-readable error message.
                  </p>
                  <ul className="list-disc pl-5">
                    <li>
                      <strong>400 Bad Request</strong> — Invalid Request. The
                      request body was malformed or missing required parameters.
                    </li>
                    <li>
                      <strong>401 Unauthorized</strong> — Authentication Error.
                      No API key was provided, or the key is invalid.
                    </li>
                    <li>
                      <strong>404 Not Found</strong> — Resource Not Found. The
                      requested resource does not exist.
                    </li>
                    <li>
                      <strong>500 Server Error</strong> — Internal Bastion
                      Error. Something went wrong on our end.
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
                      code={`{\n  "detail": "A human-readable description of the error."\n}`}
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
