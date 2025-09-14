import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiDocs() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;
    // Defer to ensure section is rendered
    const id = hash.replace('#', '');
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [location.hash]);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">SHIELD Fraud Detection API</h1>
      </div>

      {/* Introduction */}
      <section id="introduction" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Introduction & Core Concepts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p>
                SHIELD is a B2B platform that helps e-commerce stores detect and prevent return fraud. It creates a
                single, KYC-verified master identity for each person so you can track their activity across multiple
                stores—even if they use different emails.
              </p>
              <h4>Core Workflow: Find or Create</h4>
              <p>
                When a claim is submitted, the API first checks for an existing <code>User</code> using the unique
                <code>kyc_email</code>. If found, SHIELD uses that master identity. If not, a new master user is created.
                Then SHIELD ensures a <code>StoreAccount</code> exists linking the master user to the specific store
                (by <code>store_id</code> and <code>email_at_store</code>), creating it if needed. Finally, the claim is
                recorded and evaluated.
              </p>
              <h4>Base URLs</h4>
              <ul>
                <li>Production: <code>https://api.shield.com/v1</code></li>
                <li>Sandbox: <code>https://sandbox-api.shield.com/v1</code></li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Authentication */}
      <section id="authentication" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p>Authenticate using an API key sent via the <code>X-API-Key</code> HTTP header.</p>
              <pre><code>{`curl -X GET \
 -H "X-API-Key: YOUR_API_KEY" \
 https://sandbox-api.shield.com/v1/health`}</code></pre>
              <p>
                If the header is missing or invalid, the API responds with <code>401 Unauthorized</code>.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Data Models */}
      <section id="data-models" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Data Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <h4>User</h4>
              <table>
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td>id</td><td>uuid</td><td>Master user ID</td></tr>
                  <tr><td>kyc_email</td><td>string</td><td>Unique email used for KYC</td></tr>
                  <tr><td>full_name</td><td>string</td><td>Full name</td></tr>
                  <tr><td>dob</td><td>string</td><td>YYYY-MM-DD</td></tr>
                  <tr><td>risk_score</td><td>integer</td><td>0-100 risk score</td></tr>
                  <tr><td>is_flagged</td><td>boolean</td><td>Whether the user is flagged</td></tr>
                  <tr><td>created_at</td><td>ISO 8601</td><td>Creation timestamp</td></tr>
                </tbody>
              </table>

              <h4>StoreAccount</h4>
              <table>
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td>id</td><td>uuid</td><td>StoreAccount ID</td></tr>
                  <tr><td>user_id</td><td>uuid</td><td>Linked master user ID</td></tr>
                  <tr><td>store_id</td><td>uuid</td><td>Store identifier</td></tr>
                  <tr><td>email_at_store</td><td>string</td><td>User email at this store</td></tr>
                </tbody>
              </table>

              <h4>ItemData</h4>
              <table>
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td>item_name</td><td>string</td><td>Item name</td></tr>
                  <tr><td>category</td><td>string</td><td>Product category</td></tr>
                  <tr><td>price</td><td>float</td><td>Unit price</td></tr>
                  <tr><td>quantity</td><td>integer</td><td>Quantity</td></tr>
                  <tr><td>url</td><td>string (optional)</td><td>Product URL</td></tr>
                </tbody>
              </table>

              <h4>Claim</h4>
              <table>
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td>id</td><td>uuid</td><td>Claim ID</td></tr>
                  <tr><td>store_account_id</td><td>uuid</td><td>Linked StoreAccount</td></tr>
                  <tr><td>status</td><td>string</td><td>"PENDING" | "APPROVED" | "DENIED"</td></tr>
                  <tr><td>claim_data</td><td>ItemData[]</td><td>Items in the claim</td></tr>
                  <tr><td>created_at</td><td>ISO 8601</td><td>Creation timestamp</td></tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Endpoint: Submit Claim */}
      <section id="endpoint-submit-claim" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">POST /claims — Submit a Claim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p>
                Submit a new return claim for fraud analysis. Performs the full Find-or-Create logic for both the master
                <code>User</code> and the <code>StoreAccount</code>, calculates a risk score, and records the claim.
              </p>
              <h4>Request Body</h4>
              <pre><code>{`{
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
        "url": "http://store.com/product/123"
      }
    ]
  }
}`}</code></pre>

              <h4>Success Response (201 Created)</h4>
              <pre><code>{`{
  "id": "clm_123",
  "store_account_id": "sacct_456",
  "status": "PENDING",
  "claim_data": [
    { "item_name": "iPhone 16 Max", "category": "Electronics", "price": 1299.99, "quantity": 1, "url": "http://store.com/product/123" }
  ],
  "created_at": "2025-09-13T12:00:00Z"
}`}</code></pre>

              <h4>Code Examples</h4>
              <p><strong>Python (requests)</strong></p>
              <pre><code>{`import requests

url = "https://sandbox-api.shield.com/v1/claims"
headers = {"X-API-Key": "YOUR_API_KEY", "Content-Type": "application/json"}
payload = {
  "kyc_data": {"full_name": "Jane Doe", "dob": "1998-11-20", "kyc_email": "jane.d.doe@gmail.com"},
  "claim_context": {
    "store_id": "8765-uuid-of-store",
    "email_at_store": "jane.doe.promo@outlook.com",
    "claim_data": [{"item_name": "iPhone 16 Max", "category": "Electronics", "price": 1299.99, "quantity": 1, "url": "http://store.com/product/123"}]
  }
}
r = requests.post(url, json=payload, headers=headers)
print(r.status_code, r.json())`}</code></pre>

              <p><strong>JavaScript (fetch)</strong></p>
              <pre><code>{`const url = "https://sandbox-api.shield.com/v1/claims";
const headers = {"X-API-Key": "YOUR_API_KEY", "Content-Type": "application/json"};
const payload = {
  kyc_data: { full_name: "Jane Doe", dob: "1998-11-20", kyc_email: "jane.d.doe@gmail.com" },
  claim_context: {
    store_id: "8765-uuid-of-store",
    email_at_store: "jane.doe.promo@outlook.com",
    claim_data: [{ item_name: "iPhone 16 Max", category: "Electronics", price: 1299.99, quantity: 1, url: "http://store.com/product/123" }]
  }
};

fetch(url, { method: "POST", headers, body: JSON.stringify(payload) })
  .then(res => res.json())
  .then(console.log);`}</code></pre>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Endpoint: Retrieve User */}
      <section id="endpoint-retrieve-user" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">GET /users/{`{kyc_email}`}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p>
                Retrieves a complete profile for a master user, including all associated store accounts and every claim
                across integrated stores.
              </p>
              <h4>Path Parameters</h4>
              <ul>
                <li><code>kyc_email</code> (string, required): URL-encoded KYC email of the master user.</li>
              </ul>
              <h4>Success Response (200 OK)</h4>
              <pre><code>{`{
  "id": "usr_123",
  "kyc_email": "jane.d.doe@gmail.com",
  "full_name": "Jane Doe",
  "dob": "1998-11-20",
  "risk_score": 42,
  "is_flagged": false,
  "created_at": "2025-09-13T12:00:00Z",
  "store_accounts": [
    {
      "id": "sacct_456",
      "user_id": "usr_123",
      "store_id": "8765-uuid-of-store",
      "email_at_store": "jane.doe.promo@outlook.com",
      "claims": [
        { "id": "clm_123", "status": "PENDING", "created_at": "2025-09-13T12:00:00Z", "total_items": 1 }
      ]
    }
  ]
}`}</code></pre>

              <h4>Code Examples</h4>
              <p><strong>Python (requests)</strong></p>
              <pre><code>{`import requests

email = "jane.d.doe%40gmail.com"
url = f"https://sandbox-api.shield.com/v1/users/{email}"
headers = {"X-API-Key": "YOUR_API_KEY"}
r = requests.get(url, headers=headers)
print(r.status_code, r.json())`}</code></pre>
              <p><strong>JavaScript (fetch)</strong></p>
              <pre><code>{`const email = encodeURIComponent("jane.d.doe@gmail.com");
fetch(` + "`https://sandbox-api.shield.com/v1/users/${email}`" + `, { headers: { 'X-API-Key': 'YOUR_API_KEY' }})
  .then(res => res.json())
  .then(console.log);`}</code></pre>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Error Handling */}
      <section id="error-handling" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Error Handling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p>
                Errors return a JSON object with a single <code>detail</code> key containing a human-readable message.
              </p>
              <table>
                <thead>
                  <tr><th>Status</th><th>Meaning</th></tr>
                </thead>
                <tbody>
                  <tr><td>400 Bad Request</td><td>Invalid request body or parameters</td></tr>
                  <tr><td>401 Unauthorized</td><td>Missing or invalid API Key</td></tr>
                  <tr><td>403 Forbidden</td><td>API key lacks permissions</td></tr>
                  <tr><td>404 Not Found</td><td>Requested resource does not exist</td></tr>
                  <tr><td>500 Internal Server Error</td><td>Server-side error</td></tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
