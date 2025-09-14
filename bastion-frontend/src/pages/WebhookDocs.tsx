import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function CodeBlock({
  code,
  lang,
}: {
  code: string;
  lang: "bash" | "json" | "python" | "javascript";
}) {
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

  const highlighted =
    lang === "json" ? highlightJSON(code) : highlightGeneric(code, lang);

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
}

export default function WebhookDocs() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash?.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      setTimeout(
        () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
        0
      );
    }
  }, [location.hash]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Bastion Webhooks</h2>
      </div>

      {/* Subtle scrollbar style */}
      <style>{`
        .pretty-scrollbar { margin-top: 0.375rem; padding-bottom: 2px; }
        .pretty-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .pretty-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .pretty-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.3); border-radius: 9999px; }
        .pretty-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.5); }
        .pretty-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(148,163,184,0.5) transparent; }
        /* Lightweight token colors */
        .tok-key { color: #93c5fd; }
        .tok-string { color: #86efac; }
        .tok-number { color: #fca5a5; }
        .tok-atom { color: #fbbf24; }
        .tok-kw { color: #c4b5fd; }
        .tok-comment { color: #94a3b8; font-style: italic; }
      `}</style>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Webhooks Overview
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Bastion supports a two-way, event-driven integration. You can send lifecycle events to Bastion (Inbound) and Bastion will send real-time fraud alerts back to your systems (Outbound).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-16 text-sm text-muted-foreground">
            {/* Introduction */}
            <section id="introduction" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Introduction</h3>
                  <p>
                    Bastion webhooks enable a two-way, event-driven integration. Your systems can <strong>send</strong> Bastion rich lifecycle events that improve risk accuracy (Inbound), and Bastion can <strong>send</strong> you real-time alerts when our models detect risks that require action (Outbound).
                  </p>
                  <p>
                    This model automates data sharing and decisioning, allowing your team to proactively mitigate fraud and streamline operations.
                  </p>
                </div>
              </div>
            </section>

            {/* Outbound Webhooks (Bastion to You) */}
            <section id="outbound-webhooks" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Outbound Webhooks (Bastion to You)</h3>
                  <p>
                    Outbound webhooks are the recommended way to automate actions in your systems based on Bastion’s fraud analysis. Configure your endpoint URL(s) in the Dashboard under <strong>Settings &gt; Webhooks</strong>.
                  </p>
                  <p className="font-medium text-foreground">Key Event Types</p>
                  <ul className="list-disc pl-5">
                    <li><code>claim.risk_assessment.high</code>: Triggered when a submitted claim results in a risk score above a critical threshold.</li>
                    <li><code>user.flagged</code>: Triggered when an analyst flags a user in the Bastion dashboard.</li>
                  </ul>
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-foreground font-medium mb-2">Example Payload: claim.risk_assessment.high</div>
                    <CodeBlock
                      lang="json"
                      code={`{\n  "event_id": "evt_uuid_123",\n  "event_type": "claim.risk_assessment.high",\n  "created_at": "2025-11-01T10:00:00Z",\n  "data": {\n    "claim_id": "claim_uuid_C3",\n    "user_id": "user_uuid_111AAA",\n    "kyc_email": "jane.d.doe@gmail.com",\n    "risk_score": 85,\n    "reasons": ["Multiple accounts at store", "High-value item in claim"]\n  }\n}`}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Verifying Outbound Webhooks */}
            <section id="verify-outbound" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Verifying Outbound Webhooks</h3>
                  <p>
                    For security, all outbound webhooks from Bastion are signed with a unique signing secret. Your server must verify the signature on each request to ensure authenticity and integrity before processing.
                  </p>
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-foreground font-medium mb-2">Merchant-side Verification (Node.js example)</div>
                    <CodeBlock
                      lang="javascript"
                      code={`// Express.js-style verification middleware (conceptual)\nconst crypto = require('crypto');\n\nfunction verifyBastionSignature(req, res, next) {\n  const signature = req.header('Bastion-Signature');\n  const timestamp = req.header('Bastion-Timestamp');\n  const signingSecret = process.env.BASTION_OUTBOUND_WEBHOOK_SECRET; // from Dashboard\n\n  if (!signature || !timestamp) {\n    return res.status(400).send('Missing signature headers');\n  }\n\n  const rawBody = req.rawBody || JSON.stringify(req.body);\n  const signedPayload = timestamp + '.' + rawBody;\n  const expected = crypto\n    .createHmac('sha256', signingSecret)\n    .update(signedPayload)\n    .digest('hex');\n\n  const computedHeader = 'v1,t=' + timestamp + ',s=' + expected;\n  if (!crypto.timingSafeEqual(Buffer.from(computedHeader), Buffer.from(signature))) {\n    return res.status(400).send('Invalid signature');\n  }\n\n  return next();\n}\n\nmodule.exports = { verifyBastionSignature };`}
                    />
                    <div className="text-foreground font-medium mb-2">Your Unique Endpoint URL</div>
                    <CodeBlock lang="bash" code={`https://inbound-api.bastion.com/wh/YOUR_UNIQUE_MERCHANT_ID`} />
                  </div>
                </div>
              </div>
            </section>

            {/* Event Types & Payloads */}
            <section id="event-types" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">Event Types & Payloads</h3>
                  <p>
                    Your system should send a webhook to Bastion whenever a key event occurs. Below are the supported <code>event_type</code> values and their corresponding JSON payloads. The <code>customer_email</code> field is critical as it allows Bastion to link the event to a user's account at your store.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <div className="text-foreground font-medium">Order Events</div>
                      <p className="mt-1">These events provide context about a user's purchasing behavior.</p>
                      <div className="mt-3 text-foreground font-medium">order.created</div>
                      <CodeBlock
                        lang="json"
                        code={`{
  "event_type": "order.created",
  "order_id": "ord_123abc456def",
  "customer_email": "jane.doe.store@example.com",
  "total_value": 149.99,
  "currency": "USD",
  "item_count": 2,
  "shipping_address": "123 Main St, Anytown, USA",
  "created_at": "2025-11-15T14:30:00Z"
}`}
                      />
                      <div className="mt-4 text-foreground font-medium">order.shipped</div>
                      <CodeBlock
                        lang="json"
                        code={`{
  "event_type": "order.shipped",
  "order_id": "ord_123abc456def",
  "customer_email": "jane.doe.store@example.com",
  "tracking_number": "1Z999AA10123456784",
  "carrier": "UPS",
  "shipped_at": "2025-11-16T09:00:00Z"
}`}
                      />
                    </div>
                    <div>
                      <div className="text-foreground font-medium">Refund & Dispute Events</div>
                      <p className="mt-1">These events are strong signals that directly relate to potential fraud.</p>
                      <div className="mt-3 text-foreground font-medium">refund.succeeded</div>
                      <CodeBlock
                        lang="json"
                        code={`{
  "event_type": "refund.succeeded",
  "refund_id": "ref_789ghi012jkl",
  "order_id": "ord_123abc456def",
  "customer_email": "jane.doe.store@example.com",
  "amount_refunded": 49.99,
  "reason": "item_not_as_described",
  "processed_at": "2025-11-20T16:00:00Z"
}`}
                      />
                      <div className="mt-4 text-foreground font-medium">chargeback.created</div>
                      <CodeBlock
                        lang="json"
                        code={`{
  "event_type": "chargeback.created",
  "chargeback_id": "chg_345mno678pqr",
  "order_id": "ord_123abc456def",
  "customer_email": "jane.doe.store@example.com",
  "amount_disputed": 149.99,
  "reason": "fraudulent",
  "processor": "Stripe",
  "created_at": "2025-11-25T10:00:00Z"
}`}
                      />
                    </div>
                    <div>
                      <div className="text-foreground font-medium">Customer Events</div>
                      <p className="mt-1">These events help Bastion understand user behavior patterns from the very beginning.</p>
                      <div className="mt-3 text-foreground font-medium">customer.created</div>
                      <CodeBlock
                        lang="json"
                        code={`{
  "event_type": "customer.created",
  "customer_id_at_store": "cust_abc123",
  "customer_email": "new.user@example.com",
  "full_name": "New User",
  "ip_address": "192.168.1.1",
  "created_at": "2025-11-15T14:25:00Z"
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Best Practices (applies to both inbound and outbound) */}
            <section id="best-practices" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Best Practices</h3>
                  <p>To ensure a robust and reliable webhook integration (for both inbound and outbound webhooks), please follow these best practices.</p>
                  <ul className="list-disc pl-5">
                    <li>
                      <span className="font-medium text-foreground">Respond Quickly:</span> Your endpoint should return a <code>200 OK</code> status code as quickly as possible, before running any complex logic. This acknowledges receipt of the webhook. If the sender doesn't receive a <code>200 OK</code> in a timely manner, it will consider the delivery a failure and may retry.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Handle Retries:</span> Events may be delivered more than once. Design your webhook handler to be idempotent by tracking a unique <code>event_id</code> and ensuring repeats don't cause side effects.
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
