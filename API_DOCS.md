<div align="center">

# Bastion API

Programmatic access to Bastion’s fraud detection engine for returns and disputes.

</div>

---

## Introduction

The Bastion API lets you programmatically submit return claims for fraud analysis and retrieve lifetime user histories across all your integrated stores. The API is organized around REST, uses predictable resource‑oriented URLs, accepts JSON‑encoded request bodies, returns JSON‑encoded responses, and uses standard HTTP response codes and verbs.

You can use the Bastion API in test mode, which does not affect live data. Your API key determines whether a request is in live or test mode.

- Base URL: `https://api.bastion.com/v1`

---

## Authentication

The Bastion API uses API keys to authenticate requests. You can view and manage your API keys in the Bastion Dashboard.

- Keep your keys secure. Do not embed secret keys in client‑side code or public repositories.
- Authenticate using the `X-API-Key` HTTP header.
- All requests must be made over HTTPS; HTTP and unauthenticated requests will fail.

Example (curl):

```bash
curl -X GET "https://api.bastion.com/v1/health" \
  -H "X-API-Key: sk_test_123"
```

If your key is missing or invalid, Bastion returns `401 Unauthorized`.

---

## Core Objects

### The Claim Object

The `Claim` object is the core of the Bastion API. It represents a single return or dispute event initiated by a customer at one of your integrated stores. It contains the items being claimed, the computed risk assessment, and its current status.

| Field            | Type       | Description                                   |
| ---------------- | ---------- | --------------------------------------------- |
| id               | uuid       | Unique identifier for the claim               |
| store_account_id | uuid       | The `StoreAccount` associated with this claim |
| status           | enum       | One of `PENDING`, `APPROVED`, `DENIED`        |
| claim_data       | ItemData[] | Array of items included in the claim          |
| created_at       | string     | ISO 8601 timestamp                            |

### The User Object

The `User` object represents a single, unique human being, verified by our KYC process. A `User` is created the first time a person makes a claim across any store in the Bastion network. Subsequent claims by the same person—even with different store emails—are linked back to this single `User`.

| Field      | Type    | Description                                      |
| ---------- | ------- | ------------------------------------------------ |
| id         | uuid    | Unique user identifier                           |
| kyc_email  | string  | Unique KYC email used as the master identity key |
| full_name  | string  | Full legal name                                  |
| dob        | string  | Date of birth (YYYY‑MM‑DD)                       |
| risk_score | integer | 0–100 risk score (higher is riskier)             |
| is_flagged | boolean | If true, user is flagged for review              |
| created_at | string  | ISO 8601 timestamp                               |

### The StoreAccount Object

The `StoreAccount` links a master `User` to their specific account at one of your stores. A single `User` can have multiple `StoreAccount` objects—one for each store they interact with.

| Field          | Type   | Description                             |
| -------------- | ------ | --------------------------------------- |
| id             | uuid   | Unique identifier for the store account |
| user_id        | uuid   | The associated master `User` id         |
| store_id       | uuid   | Identifier for your store               |
| email_at_store | string | Email used by the user at this store    |

### The ItemData Object

Represents an item within a claim.

| Field     | Type    | Description           |
| --------- | ------- | --------------------- |
| item_name | string  | Name of the item      |
| category  | string  | Category of the item  |
| price     | float   | Price per unit        |
| quantity  | integer | Quantity in the claim |
| url       | string? | Optional product URL  |

---

## API Reference

### Claims

The Claims API is used to submit and manage return claims.

#### Create a claim

`POST /claims`

Creates a new `Claim` object. Provide KYC data for the person and the context of the claim (store, items, etc.). Bastion performs the "Find or Create" logic for the master `User` and `StoreAccount`, calculates a risk score, and returns the resulting `Claim`.

Request body parameters

- `kyc_data` (object, required):
  - `full_name` (string, required)
  - `dob` (string, required, YYYY-MM-DD)
  - `kyc_email` (string, required)
- `claim_context` (object, required):
  - `store_id` (string, required)
  - `email_at_store` (string, required)
  - `claim_data` (array of ItemData, required)

Returns

- A `Claim` object if the call succeeded.

Request examples

```bash
curl -X POST "https://api.bastion.com/v1/claims" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_test_123" \
  -d '{
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
          "url": "https://store.example.com/products/iphone-16-max"
        }
      ]
    }
  }'
```

```python
import os
import requests

BASE_URL = "https://api.bastion.com/v1"
API_KEY = os.getenv("Bastion_API_KEY", "sk_test_123")

payload = {
    "kyc_data": {
        "full_name": "Jane Doe",
        "dob": "1998-11-20",
        "kyc_email": "jane.d.doe@gmail.com",
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
                "url": "https://store.example.com/products/iphone-16-max",
            }
        ],
    },
}

r = requests.post(
    f"{BASE_URL}/claims",
    json=payload,
    headers={"X-API-Key": API_KEY},
    timeout=30,
)
r.raise_for_status()
print(r.json())
```

```javascript
const BASE_URL = "https://api.bastion.com/v1";
const API_KEY = process.env.Bastion_API_KEY || "sk_test_123";

const payload = {
  kyc_data: {
    full_name: "Jane Doe",
    dob: "1998-11-20",
    kyc_email: "jane.d.doe@gmail.com",
  },
  claim_context: {
    store_id: "8765-uuid-of-store",
    email_at_store: "jane.doe.promo@outlook.com",
    claim_data: [
      {
        item_name: "iPhone 16 Max",
        category: "Electronics",
        price: 1299.99,
        quantity: 1,
        url: "https://store.example.com/products/iphone-16-max",
      },
    ],
  },
};

fetch(`${BASE_URL}/claims`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
  body: JSON.stringify(payload),
})
  .then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then((json) => console.log(json))
  .catch((err) => console.error(err));
```

Response example (201)

```json
{
  "id": "clm_01hv2w4m8x2r9ngq7g9f7c2a1b",
  "store_account_id": "sca_01hv2w8m3n4p5q6r7s8t9u0v1w",
  "status": "PENDING",
  "claim_data": [
    {
      "item_name": "iPhone 16 Max",
      "category": "Electronics",
      "price": 1299.99,
      "quantity": 1,
      "url": "https://store.example.com/products/iphone-16-max"
    }
  ],
  "created_at": "2025-09-13T23:00:12Z"
}
```

---

### Users

The Users API retrieves information about a master user identity.

#### Retrieve a user

`GET /users/{kyc_email}`

Retrieves the details of a `User` object, including all associated `StoreAccount`s and their `Claim`s across your stores.

URL parameters

- `kyc_email` (string, required): URL‑encoded KYC email of the user to retrieve.

Returns

- A `User` object if a valid `kyc_email` was provided.

Request examples

```bash
kyc_email="jane.d.doe@gmail.com"
curl -X GET "https://api.bastion.com/v1/users/$(python -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$kyc_email")" \
  -H "X-API-Key: sk_test_123"
```

```python
import os
import requests

BASE_URL = "https://api.bastion.com/v1"
API_KEY = os.getenv("Bastion_API_KEY", "sk_test_123")

email = "jane.d.doe@gmail.com"
r = requests.get(
    f"{BASE_URL}/users/{requests.utils.quote(email)}",
    headers={"X-API-Key": API_KEY},
    timeout=30,
)
r.raise_for_status()
print(r.json())
```

```javascript
const BASE_URL = "https://api.bastion.com/v1";
const API_KEY = process.env.Bastion_API_KEY || "sk_test_123";

const kycEmail = encodeURIComponent("jane.d.doe@gmail.com");

fetch(`${BASE_URL}/users/${kycEmail}`, {
  headers: { "X-API-Key": API_KEY },
})
  .then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then((json) => console.log(json))
  .catch((err) => console.error(err));
```

Response example (200)

```json
{
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
          "claim_data": [
            {
              "item_name": "iPhone 16 Max",
              "category": "Electronics",
              "price": 1299.99,
              "quantity": 1,
              "url": "https://store.example.com/products/iphone-16-max"
            }
          ],
          "created_at": "2025-09-13T23:00:12Z"
        }
      ]
    }
  ]
}
```

---

## Errors

Bastion uses conventional HTTP response codes to indicate the success or failure of an API request. In general: codes in the 2xx range indicate success; codes in the 4xx range indicate a failure that can often be resolved by the client (e.g., missing parameters); codes in the 5xx range indicate an error with Bastion’s servers.

All error responses return JSON with the following structure:

```json
{
  "detail": "A human-readable description of the error."
}
```

Common status codes

| Status | Meaning                                            |
| ------ | -------------------------------------------------- |
| 400    | Bad Request: Invalid body or parameters            |
| 401    | Unauthorized: Missing or invalid API key           |
| 403    | Forbidden: API key lacks permission                |
| 404    | Not Found: The requested resource doesn’t exist    |
| 409    | Conflict: Request conflicts with the current state |
| 422    | Unprocessable Entity: Semantic validation errors   |
| 429    | Too Many Requests: Rate limit exceeded             |
| 500    | Internal Server Error: Problem on Bastion servers  |

---

Last updated: 2025‑09‑13
