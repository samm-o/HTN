# Project BASTION API Reference

Base URL: `http://localhost:8080`

## 🔍 Claims API - `/api/v1/claims`

### `POST /submit` - **Fraud Detection**
**Purpose:** Analyze insurance claims for fraud risk  
**Parameters:**
```json
{
  "user_id": "uuid",
  "claim_context": {
    "store_id": "uuid",
    "email_at_store": "email@domain.com",
    "claim_data": [
      {
        "item_name": "string",
        "category": "string",
        "price": 99.99,
        "quantity": 1
      }
    ]
  }
}
```
**Returns:** Risk score (0-100), recommendation, claim ID

---

## 👨‍💼 Admin API - `/api/v1/admin`

### `GET /flagged-claims`
**Purpose:** Get claims from high-risk users  
**Parameters:** `limit` (optional, default: 100)

### `GET /{claim_id}`
**Purpose:** Get specific claim details  
**Parameters:** `claim_id` (UUID in path)

### `PUT /{claim_id}/status`
**Purpose:** Approve/deny claims  
**Parameters:** `claim_id` (UUID), `status` (APPROVED/DENIED/PENDING)

### `GET /health`
**Purpose:** System health check  
**Parameters:** None

---

## 👤 Users API - `/api/v1/users`

### `GET /{user_id}`
**Purpose:** Get user stats and risk profile  
**Parameters:** `user_id` (UUID in path)

### `GET /{user_id}/claims`
**Purpose:** Get all user's claims  
**Parameters:** `user_id` (UUID), `limit` (optional, default: 50)

---

## 🏪 Stores API - `/api/v1/stores`

### `GET /`
**Purpose:** List all stores  
**Parameters:** None

### `POST /`
**Purpose:** Create new store  
**Parameters:** `name` (string)

### `GET /{store_id}/claims`
**Purpose:** Get all store's claims  
**Parameters:** `store_id` (UUID), `limit` (optional, default: 50)

---

## 🧑‍💼 Customers API - `/api/v1/customers`

### `POST /customers`
**Purpose:** Create new customer  
**Parameters:** CustomerCreate schema

### `GET /customers/{customer_id}`
**Purpose:** Get customer by ID  
**Parameters:** `customer_id` (string in path)

### `GET /customers/by-email`
**Purpose:** Find customer by email  
**Parameters:** `email` (query parameter)

---

## 🚀 Quick Start

1. **Submit a claim for fraud analysis:**
   ```bash
   curl -X POST http://localhost:8080/api/v1/claims/submit \
     -H "Content-Type: application/json" \
     -d '{"user_id": "uuid", "claim_context": {...}}'
   ```

2. **Check system health:**
   ```bash
   curl http://localhost:8080/health
   ```

3. **View flagged claims (admin):**
   ```bash
   curl http://localhost:8080/api/v1/admin/flagged-claims
   ```
