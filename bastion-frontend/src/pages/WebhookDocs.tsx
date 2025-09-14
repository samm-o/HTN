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
        <h2 className="text-3xl font-bold text-foreground">
          Bastion Inbound Webhooks
        </h2>
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
          <CardTitle className="text-lg font-semibold text-foreground">
            Inbound Webhooks
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Send Bastion real-time updates about your customer lifecycle to
            build richer, proactive fraud intelligence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-16 text-sm text-muted-foreground">
            {/* Introduction */}
            <section id="introduction" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Introduction
                  </h3>
                  <p>
                    While you can send us claim data via the API, the most
                    powerful way to integrate with Bastion is through webhooks.
                    By configuring webhooks in your e-commerce platform or
                    backend, you can send Bastion real-time updates about events
                    in the customer lifecycle.
                  </p>
                  <p>
                    This allows Bastion to build a much richer, more accurate
                    risk profile for each user before a claim is even made. It
                    turns your integration into a "set it and forget it"
                    process, automating data sharing and dramatically improving
                    the accuracy of our fraud detection.
                  </p>
                </div>
              </div>
            </section>

            {/* Security: Verifying Webhook Signatures */}
            <section id="security-signatures" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Security: Verifying Webhook Signatures
                  </h3>
                  <p>
                    To ensure that the webhook requests sent to Bastion are
                    genuinely from your server and not a malicious third party,
                    we use webhook signatures. When you create an inbound
                    webhook endpoint in your Bastion Dashboard, we will provide
                    you with a unique signing secret.
                  </p>
                  <p>
                    Your server must use this secret to create a signature for
                    each payload and include it in the{" "}
                    <code>Bastion-Signature</code> HTTP header. Bastion will
                    then use the same secret to verify the signature. If the
                    signature is missing or invalid, we will reject the request.
                    The signature is a HMAC-SHA256 hash of the timestamp and the
                    raw request body.
                  </p>
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-foreground font-medium mb-2">
                      Example Code: How Bastion verifies signatures (conceptual,
                      Python)
                    </div>
                    <CodeBlock
                      lang="python"
                      code={`# This is how Bastion would verify the signature your server sends.
import hmac
import hashlib
import time

# Your secret, obtained from the Bastion Dashboard
signing_secret = "whsec_YOUR_SIGNING_SECRET"

# Data received from your webhook request
timestamp_from_header = "1678886400" # Example timestamp
body_from_request = '{"event_type": "order.created", ...}'
signature_from_header = "v1,t=1678886400,s=..." # Example signature

# 1. Create the string to sign
signed_payload = f"{timestamp_from_header}.{body_from_request}"

# 2. Compute the expected signature
expected_signature = hmac.new(
    signing_secret.encode('utf-8'),
    signed_payload.encode('utf-8'),
    hashlib.sha256
).hexdigest()

# 3. Compare signatures securely
# (Simplified comparison for clarity)
is_valid = (f"v1,t={timestamp_from_header},s={expected_signature}" == signature_from_header)

if not is_valid:
    # Reject the request
    print("Webhook signature is invalid!")`}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Your Webhook Endpoint */}
            <section id="endpoint-url" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Your Webhook Endpoint
                  </h3>
                  <p>
                    When you configure webhooks, you must provide your unique
                    webhook endpoint URL to your e-commerce platform. Bastion
                    will generate this URL for you in the Dashboard.
                  </p>
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-foreground font-medium mb-2">
                      Your Unique Endpoint URL
                    </div>
                    <CodeBlock
                      lang="bash"
                      code={`https://inbound-api.bastion.com/wh/YOUR_UNIQUE_MERCHANT_ID`}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Event Types & Payloads */}
            <section id="event-types" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">
                    Event Types & Payloads
                  </h3>
                  <p>
                    Your system should send a webhook to Bastion whenever a key
                    event occurs. Below are the supported{" "}
                    <code>event_type</code> values and their corresponding JSON
                    payloads. The <code>customer_email</code> field is critical
                    as it allows Bastion to link the event to a user's account
                    at your store.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <div className="text-foreground font-medium">
                        Order Events
                      </div>
                      <p className="mt-1">
                        These events provide context about a user's purchasing
                        behavior.
                      </p>
                      <div className="mt-3 text-foreground font-medium">
                        order.created
                      </div>
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
                      <div className="mt-4 text-foreground font-medium">
                        order.shipped
                      </div>
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
                      <div className="text-foreground font-medium">
                        Refund & Dispute Events
                      </div>
                      <p className="mt-1">
                        These events are strong signals that directly relate to
                        potential fraud.
                      </p>
                      <div className="mt-3 text-foreground font-medium">
                        refund.succeeded
                      </div>
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
                      <div className="mt-4 text-foreground font-medium">
                        chargeback.created
                      </div>
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
                      <div className="text-foreground font-medium">
                        Customer Events
                      </div>
                      <p className="mt-1">
                        These events help Bastion understand user behavior
                        patterns from the very beginning.
                      </p>
                      <div className="mt-3 text-foreground font-medium">
                        customer.created
                      </div>
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

            {/* Best Practices */}
            <section id="best-practices" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Best Practices
                  </h3>
                  <p>
                    To ensure a robust and reliable webhook integration, please
                    follow these best practices.
                  </p>
                  <ul className="list-disc pl-5">
                    <li>
                      <span className="font-medium text-foreground">
                        Respond Quickly:
                      </span>{" "}
                      Your endpoint should return a <code>200 OK</code> status
                      code as quickly as possible, before running any complex
                      logic. This acknowledges receipt of the webhook. If
                      Bastion doesn't receive a <code>200 OK</code> in a timely
                      manner, it will consider the delivery a failure and may
                      retry.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        Handle Retries:
                      </span>{" "}
                      Bastion may send the same event more than once. Design
                      your webhook handler to be idempotent by tracking a unique
                      event ID and ensuring repeats don't cause side effects.
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
