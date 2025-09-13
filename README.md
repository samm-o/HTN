# BASTION 🛡️

**B2B E-commerce Fraud Detection Platform**

Bastion helps e-commerce platforms identify and prevent return fraud by tracking customers across multiple stores using KYC verification. When customers make their first suspicious return, they verify their identity - creating a unique profile that follows them everywhere.

## The Problem
- **$101 billion** lost to return fraud annually in the US
- **14.5%** of e-commerce revenue lost to fraudulent returns
- No way to track repeat offenders across different platforms
- Companies assume customers are telling the truth

## How It Works
1. **Customer makes suspicious return** → Redirected to KYC verification
2. **KYC creates unique ID** → Links customer across all platforms using Bastion
3. **Fraud risk calculated** → AI analyzes return history and patterns
4. **Decision support** → Retailers get data to approve/deny returns

## What E-commerce Sites Can Do With This Data

### Immediate Actions
- **Block serial returners** - Identify customers with 4+ suspicious returns across platforms
- **Dynamic return policies** - Stricter policies for high-risk customers, generous for good ones
- **Targeted promotions** - Reward trustworthy customers with exclusive discounts
- **Inventory protection** - Flag high-return items before they become problems

### Business Intelligence
- **Product insights** - See which items are returned most (Nike size 9 shoes, iPhone 16 Pro Max)
- **Category analysis** - Identify problematic product categories (clothing, electronics)
- **Payment method patterns** - Track fraud by payment type (prepaid cards = higher risk)
- **Seasonal trends** - Understand when fraud spikes (holidays, sales events)

### Revenue Recovery
- **Reduce processing costs** - Stop wasting money on fraudulent return shipping/restocking
- **Improve margins** - Keep legitimate inventory in circulation instead of processing fake returns
- **Insurance claims** - Use fraud data to support insurance claims for losses
- **Supplier negotiations** - Show suppliers which products have legitimate vs. fraudulent return rates

## Tech Stack
- **Backend**: FastAPI + Supabase + Python
- **Frontend**: React + TypeScript + Tailwind CSS
- **Analytics**: Recharts for data visualization

## Business Impact Examples

### Real-World Scenarios
**Fashion Retailer**: "Customer returns 5 designer dresses claiming 'wrong size' across 3 different stores. Bastion flags them after the 2nd return - saves $2,000 in fraudulent returns."

**Electronics Store**: "iPhone returns spike 300% after new model launch. Bastion data shows 60% are from repeat returners using prepaid cards - store adjusts return policy for electronics."

**Multi-brand Marketplace**: "Seller complains about high return rates. Bastion shows 80% of returns come from 12 repeat customers across the platform - marketplace can take targeted action."

## Setup (5 minutes)

```bash
# Backend
cd backend && pip install -r requirements.txt
python main.py  # Runs on localhost:8080

# Frontend (2 terminals)
cd bastion-frontend && npm install && npm run dev  # localhost:5173
cd storefront-frontend && npm install && npm run dev  # localhost:5174
```

**Environment**: Add Supabase credentials to `backend/.env`

## Key APIs
- `POST /api/v1/claims/submit` - Submit return claim with KYC
- `GET /api/v1/admin/analytics` - Get fraud analytics
- `GET /api/v1/users` - View customer profiles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Context

Bastion was developed for Hack the North 2025 by Samuil Georgiev, Xirui Huang, Michael McVicar, and Stanley Pang. It demonstrates innovative approaches to e-commerce fraud prevention through:
- Cross-platform customer tracking
- KYC-based identity verification
- AI-powered risk assessment
- Privacy-compliant data handling

## 📞 Contact

- Samuil Georgiev: s2georgi@uwaterloo.ca
- Xirui Huang: xrhuang10@gmail.com
- Michael McVicar: mxmow15@gmail.com
- Stanley Pang: stanley.pang@mail.utoronto.ca

