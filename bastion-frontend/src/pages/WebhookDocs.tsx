import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function CodeBlock({ code, lang }: { code: string; lang: 'bash' | 'json' | 'python' | 'javascript' }) {
  return (
    <pre className="pretty-scrollbar overflow-x-auto overflow-y-hidden max-w-full"><code className={`language-${lang}`}>{code}</code></pre>
  );
}

export default function WebhookDocs() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    }
  }, [location.hash]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Webhook Docs</h2>
      </div>

      {/* Subtle scrollbar style */}
      <style>{`
        .pretty-scrollbar { margin-top: 0.375rem; padding-bottom: 2px; }
        .pretty-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .pretty-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .pretty-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.3); border-radius: 9999px; }
        .pretty-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.5); }
        .pretty-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(148,163,184,0.5) transparent; }
      `}</style>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Webhook Reference</CardTitle>
          <CardDescription className="text-muted-foreground">
            Receive asynchronous notifications from SHIELD about claims, status updates, and user risk changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-16 text-sm text-muted-foreground">
            {/* Intro */}
            <section id="introduction" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">1. Overview</h3>
                  <p>
                    SHIELD uses webhooks to notify your system about important events, such as claim creation, status
                    transitions (e.g., PENDING → APPROVED), or user risk score changes. After you register an endpoint,
                    SHIELD delivers JSON payloads via HTTPS POST.
                  </p>
                  <ul className="list-disc pl-5">
                    <li>Deliveries are retried with exponential backoff on failure (non-2xx)</li>
                    <li>Endpoints are isolated by environment (Live vs Test)</li>
                    <li>All requests are sent over HTTPS and signed</li>
                  </ul>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="text-foreground font-medium">Example delivery (claim.created)</div>
                    <CodeBlock lang="json" code={`{
  "id": "evt_01hv3ab45",
  "type": "claim.created",
  "created": "2025-09-13T23:12:45Z",
  "data": {
    "id": "clm_01hv2w4m8x2r9ngq7g9f7c2a1b",
    "store_account_id": "sca_01hv2w8m3n4p5q6r7s8t9u0v1w",
    "status": "PENDING",
    "claim_data": [{ "item_name": "iPhone 16 Max", "category": "Electronics", "price": 1299.99, "quantity": 1 }],
    "created_at": "2025-09-13T23:00:12Z"
  }
}`} />
                  </div>
                </aside>
              </div>
            </section>

            {/* Signing */}
            <section id="signing" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">2. Signatures & Verification</h3>
                  <p>
                    Each delivery includes an <code>X-SHIELD-Signature</code> header. Verify the payload using your
                    endpoint's Signing secret to ensure authenticity.
                  </p>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4">
                    <Tabs defaultValue="python">
                      <TabsList className="flex flex-wrap gap-2">
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="js">JavaScript</TabsTrigger>
                        <TabsTrigger value="bash">curl</TabsTrigger>
                      </TabsList>
                      <TabsContent value="python" className="mt-3">
                        <CodeBlock lang="python" code={`import hmac, hashlib, json

def verify(signature: str, body: bytes, secret: str) -> bool:
    mac = hmac.new(secret.encode(), msg=body, digestmod=hashlib.sha256).hexdigest()
    return hmac.compare_digest(mac, signature)
`} />
                      </TabsContent>
                      <TabsContent value="js" className="mt-3">
                        <CodeBlock lang="javascript" code={`function verify(signature, body, secret) {
  const enc = new TextEncoder();
  const key = enc.encode(secret);
  const data = enc.encode(body);
  const mac = crypto.subtle ? null : require('crypto').createHmac('sha256', key).update(data).digest('hex');
  // For browsers, use Web Crypto; for Node, crypto as above
  return mac === signature;
}`} />
                      </TabsContent>
                      <TabsContent value="bash" className="mt-3">
                        <CodeBlock lang="bash" code={`curl -X POST https://your.endpoint/webhooks \\
  -H "X-SHIELD-Signature: <signature>" \\
  -H "Content-Type: application/json" \\
  -d '{"id":"evt_...","type":"claim.created",...}'`} />
                      </TabsContent>
                    </Tabs>
                  </div>
                </aside>
              </div>
            </section>

            {/* Events */}
            <section id="events" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">3. Event Types</h3>
                  <ul className="list-disc pl-5">
                    <li><code>claim.created</code> — New claim submitted</li>
                    <li><code>claim.updated</code> — Claim status or data changed</li>
                    <li><code>user.risk_changed</code> — User-level risk score updated</li>
                  </ul>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-foreground font-medium mb-2">claim.updated payload</div>
                    <CodeBlock lang="json" code={`{
  "id": "evt_01hv3cd67",
  "type": "claim.updated",
  "created": "2025-09-13T23:40:11Z",
  "data": {
    "id": "clm_01hv2w4m8x2r9ngq7g9f7c2a1b",
    "status": "APPROVED"
  }
}`} />
                  </div>
                </aside>
              </div>
            </section>

            {/* Management */}
            <section id="manage" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">4. Manage Endpoints</h3>
                  <p>
                    Create and manage endpoints in the Dashboard under <em>Developer API → Webhooks</em>. Separate Live
                    and Test endpoints to avoid mixing data.
                  </p>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4">
                    <Tabs defaultValue="create">
                      <TabsList className="flex flex-wrap gap-2">
                        <TabsTrigger value="create">Create</TabsTrigger>
                        <TabsTrigger value="list">List</TabsTrigger>
                        <TabsTrigger value="delete">Delete</TabsTrigger>
                      </TabsList>
                      <TabsContent value="create" className="mt-3">
                        <CodeBlock lang="bash" code={`curl -X POST https://api.shield.com/v1/webhooks \\
  -H "X-API-Key: <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com/webhooks/shield","env":"live"}'`} />
                      </TabsContent>
                      <TabsContent value="list" className="mt-3">
                        <CodeBlock lang="bash" code={`curl -X GET https://api.shield.com/v1/webhooks \\
  -H "X-API-Key: <YOUR_API_KEY>"`} />
                      </TabsContent>
                      <TabsContent value="delete" className="mt-3">
                        <CodeBlock lang="bash" code={`curl -X DELETE https://api.shield.com/v1/webhooks/{webhook_id} \\
  -H "X-API-Key: <YOUR_API_KEY>"`} />
                      </TabsContent>
                    </Tabs>
                  </div>
                </aside>
              </div>
            </section>

            {/* Retries */}
            <section id="retries" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">5. Retries & Delivery</h3>
                  <p>
                    SHIELD retries deliveries on failure (non-2xx) with exponential backoff for up to 24 hours. Ensure
                    your endpoint responds quickly (under 5s). You can replay events from the Dashboard if needed.
                  </p>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-foreground font-medium mb-2">Recommended response</div>
                    <CodeBlock lang="bash" code={`# Respond with 2xx quickly after enqueueing async work
HTTP/1.1 200 OK`} />
                  </div>
                </aside>
              </div>
            </section>

            {/* Security */}
            <section id="security" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">6. Security Best Practices</h3>
                  <ul className="list-disc pl-5">
                    <li>Verify signatures for every delivery</li>
                    <li>Use unique endpoints per environment</li>
                    <li>Rotate signing secrets periodically</li>
                    <li>Use allowlists or auth on your endpoints where possible</li>
                  </ul>
                </div>
                <aside className="md:col-span-7 md:pl-6 md:sticky md:top-16">
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-foreground font-medium mb-2">Example header</div>
                    <CodeBlock lang="bash" code={`X-SHIELD-Signature: <hex-hmac-sha256>`} />
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
