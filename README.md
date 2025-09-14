# Bastion - The Fraud Shield for E-commerce

A shared, privacy-safe “credit score for returns.” Bastion plugs into any returns flow, runs a one-time KYC on high-risk events, issues a universal **Bastion ID (UUID)**, and returns an **actionable risk score + reasons** - without sharing raw PII across merchants.

---

## Inspiration

Return fraud silently drains e-commerce, costing retailers over $103 billion in 2024 alone ([read more about it here](https://www.retaildive.com/news/retailers-lost-billions-fraudulent-returns-2024/736393/))! False “package never arrived” claims, wardrobing, and empty-box returns cost far beyond merchandise; shipping, labor, and trust take the hit. We built **Bastion** to give developers and ops teams a *drop-in*, API-first shield that strengthens with every integration.

---

## What Bastion Is

### **Simple Fraud API**
- Add enterprise-grade fraud checks to existing workflows **in minutes**  
- Pull a user’s **risk score** and **dispute-history signals** (cross-platform, privacy-preserving)  
- Automate decisions (approve/hold/manual review) via **outbound webhooks**

### **Actionable Intelligence Dashboard**
- Visualize **most-disputed products & categories** and **risk distributions**  
- Drill into **claim data** (first-time vs. repeat, item category, etc.)  

---

## How It Works (End-to-End)

1. **Trigger** - A return/dispute is initiated (e.g., “package not received”) on a merchant’s site  
2. **Create Claim** - Merchant calls `POST /claims` with event + minimal metadata  
3. **Selective KYC** - If high-risk, Bastion triggers **one-time KYC** and issues a **Bastion ID**  
4. **Risk Scoring** - Bastion computes a **risk score** using:
   - Behavioral & velocity signals (repeat patterns, dispute frequency, category spikes)
   - **Semantic similarity** to historical fraud narratives (Cohere Rerank over a vector DB)
5. **Decisioning** - Bastion returns **dispute data** and **risk score** based on company and customers
6. **Learning Loop** - Merchant posts final outcome using **inbound webhook**; models & category baselines update continuously

---

## How We Built It

### 🧱 Architecture
- **Backend:** FastAPI (Python) services for **claims**, **users**, and **analytics**  
- **Database:** Supabase (PostgreSQL) with strict schemas and row-level security  
- **Frontend:** React (Vite) + TypeScript, modular UI packages shared across apps  
- **Pattern:** Service-oriented modules with clear interfaces and typed DTOs

### 🧠 Backend
- Orchestrates claim intake, selective KYC, scoring, and decisioning
- **Fraud detection engine:** uses **Cohere Rerank** to compare new claims against a **vector DB** of historical fraud cases  
  - Produces a **semantic relevance score** that feeds the dynamic risk model  
  - Helps uncover **non-obvious** patterns and emerging fraud narratives
- Exposes clean REST endpoints (`/claims`, `/users`, `/analytics`) with validation and audit logging

### 🖥️ Frontend
- **Merchant Dashboard:** BI-style views with interactive charts (Recharts)  
  - Explore fraud trends, risk distributions, and **top disputed items/categories**  
  - Drill into data (first-time vs. repeat claimants, by category, by time)
- **Customer-Facing KYC Widget:**  
  - Secure flow for completing verification  
  - Minimal friction; responsive UI that fits any modern checkout/returns page

### 🔄 Event-Driven, Closed-Loop Webhooks
- **Outbound webhooks:** push real-time decisions to merchant systems (e.g., “hold refund,” “manual review”)  
- **Inbound webhooks:** merchants notify Bastion of final outcomes (accepted/denied)  
- Creates a **closed learning loop** so feature weights and category baselines improve over time; **no polling required**

---

## Challenges We Tackled

- **Actionable Insights vs. User Privacy** - Providing merchants with valuable fraud data without exposing a customer's PII (Personably Identifiable Information) or their shopping history with a competitor was a critical design challenge. We solved this by focusing on anonymized risk signals and aggregated behavioral patterns rather than raw personal data.
- **Balancing AI Sensitivity** - Fine-tuning our AI-powered risk model to minimize false positives (flagging a legitimate customer) while effectively catching sophisticated fraud was an iterative process. We focused on creating a scoring system that was firm but fair. Data Consistency Across Platforms: Architecting a system to handle data from multiple sources required robust validation and a clear source of truth. We designed the Bastion ID to be the central key that links disparate claims without creating data conflicts.
- **Data Consistency Across Platforms** - Architecting a system to handle data from multiple sources required robust validation and a clear source of truth. We designed the Bastion ID to be the central key that links disparate claims without creating data conflicts.

---

## What’s Next

- **Production-Grade KYC Integration** - Our priority is to integrate a production grade KYC service like Clear or AiPrise's third-party KYC service to replace our own verification system. This will provide enterprise-grade identity verification, enhancing our fraud detection accuracy and ensuring compliance.
- **Customizable Risk Engines** - We plan to allow retailers to customize fraud detection parameters based on their specific industry (e.g., fashion vs. electronics) and risk tolerance, including configurable thresholds and custom scoring rules via the API.
- **Risk Calculation & Enterprise Features** - Our vision is to expand our capabilities with more sophisticated ML models to determine a more accurate risk factor. We also plan to build out enterprise-grade features, including customizable dashboards and personalized reporting to support the largest e-commerce platforms.

---
