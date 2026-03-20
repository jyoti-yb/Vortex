# Gig-Shield: AI-Powered Parametric Income Insurance for India's Gig Workforce

> **Guidewire DEVTrails 2026 — University Hackathon | Phase 1: Ideation & Foundation**
> _Serverless · Event-Driven · Mobile-First · AWS Free Tier_

---

## Table of Contents

1. [The Problem](#the-problem)
2. [Our Solution](#our-solution)
3. [The Innovation: Friction Score Engine](#the-innovation-friction-score-engine)
4. [Who We're Protecting — Persona Scenarios](#who-were-protecting--persona-scenarios)
5. [Weekly Premium Model & Parametric Triggers](#weekly-premium-model--parametric-triggers)
6. [Adversarial Defense & Anti-Spoofing Strategy](#adversarial-defense--anti-spoofing-strategy)
7. [System Architecture](#system-architecture)
8. [AWS Tech Stack & AI/ML Integration](#aws-tech-stack--aiml-integration)
9. [Development Roadmap](#development-roadmap)
10. [Team & Acknowledgements](#team--acknowledgements)

---

## The Problem

India has over **15 million platform-based gig delivery workers** (Zomato, Swiggy, Zepto, Blinkit, etc.). They are the invisible backbone of the urban economy — yet they operate with **zero financial safety net**.

When a cyclone hits Chennai, when AQI crosses 400 in Delhi, or when a sudden curfew locks down a city, these workers don't just lose a shift. They lose their entire week's income. Their fixed costs — EMIs, rent, family expenses — do not pause.

**Existing insurance products fail them because:**

- They are designed for salaried employees with predictable income.
- Claims require lengthy documentation, hospital visits, or FIR reports.
- Payouts take weeks — by which time the crisis has already passed.
- Premiums are priced annually, misaligned with weekly gig payouts.

**Gig-Shield solves this** with fully automated, parametric income-loss insurance, triggered by verifiable real-world events — not subjective human assessment.

> **Scope Boundary:** Gig-Shield covers **Loss of Income due to external disruptions only** (severe weather, hazardous air quality, civic curfews). It does **NOT** cover health, accidents, or vehicle repairs. This deliberate focus keeps the product actuarially sound and compliant.

---

## Our Solution

Gig-Shield is a **mobile-first, serverless, event-driven parametric insurance platform** built on AWS. It works on a simple principle:

> _"If a verifiable external trigger event occurs in your area, you get paid. No claim form. No surveyor. No waiting."_

**How it works in 4 steps:**

1. **Enrol & Pay** — A delivery worker subscribes via the React Native app and pays a small weekly premium (₹20–₹80/week, calibrated by risk profile and city).
2. **Monitor** — Our system continuously monitors real-time weather APIs, government AQI feeds, and civic alert APIs for trigger conditions.
3. **Detect & Verify** — When a trigger threshold is crossed (e.g., Rainfall > 50mm, AQI > 400), the AI Defense Engine cross-validates it against sensor-fusion data from enrolled workers in that zone.
4. ---

## The Innovation: Friction Score Engine

At the heart of Gig-Shield is a novel concept:

> **Friction Score = Real-time measure of income disruption**

Instead of relying only on binary triggers (rain/no rain), we compute a continuous score:

Friction Score =
0.4 × Traffic Congestion +
0.3 × Network Degradation +
0.2 × Environmental Risk +
0.1 × Zone Activity Drop

### What This Enables:

- Detects **hidden income loss**
- Enables **smarter payouts**
- Powers **dynamic weekly pricing**

### Example:

A worker may not qualify for payout due to rain,
but:
- Traffic congestion = 85%
- Network quality = poor

Friction Score exceeds threshold  
Payout triggered

This ensures fair coverage even without extreme events

---
### 🎯 Chosen Persona: Zepto Quick-Commerce Rider, Delhi (Priority)
This is the core target profile for Phase 1 delivery and is the model used for tactical implementation, testing, and demo scenarios.

- Platform: Zepto grocery delivery
- City: Delhi (Tier-1 metro with severe winter AQI spikes and traffic disruptions)
- Weekly Earnings Baseline: ₹6,500
- Local risk factors: NCR pollution hotspots, sudden civic curfews, monsoon flooding in low-lying areas
- Threat vector: GPS-spoofing syndicate using Telegram groups to misreport red-alert AQI/weather status

#### Representative user story
> _"I deliver groceries in toxic smog. If AQI hits 400, I can't ride safely, but the app doesn't care. I need ₹500/day cover instantly, not after weeks. But if syndicates fake it, the system collapses."_

**Selected risk event:** AQI (PM2.5) > 400 for 4+ consecutive hours in Delhi-NCR zones.
**Gig-Shield response workflow:**
1. EventBridge catches CPCB AQI feed alert in affected Delhi microzones.
2. Lambda evaluates nearby policy set for active enrolled Zepto riders and hits the AI Defense Engine.
3. Sensor-fusion telemetry (accelerometer/gyroscope + cell tower + Wi-Fi fingerprint) is scored in SageMaker.
4. If **Green**, instant payout to UPI. If **Yellow**, quick contextual image check and expedited human triage. If **Red**, hold + manual fraud ops.

**Key measure of differentiation:**
- 95% confidence in real-route motion within location corridor (via sensor fusion)
- 99% isolation confidence not in identical Wi-Fi / tower fingerprint cluster with other flagged claimants
- streak-based normalization for poor network or low-signal drops (prevents false positives from legit service outages)

### Persona 1: Ravi, Swiggy Delivery Partner, Bengaluru
> _"I work 10-hour shifts, 6 days a week. Last monsoon, the whole city flooded for 3 days. I couldn't move my bike. Lost ₹3,600 that week. My landlord didn't care."_

**Trigger:** Rainfall > 50mm in Ravi's registered operational zone.
**Gig-Shield Response:** Parametric trigger fires automatically. Sensor fusion confirms Ravi's device is in the flood zone. ₹1,200/day income-replacement payout hits his UPI within 20 minutes of the threshold being crossed.

---

### Persona 2: Priya, Zepto Quick-Commerce Rider, Delhi
> _"Every winter, the smog gets so bad I can barely breathe. The app shows 'low orders' but I still have to ride or I get deactivated. It's not fair."_

**Trigger:** AQI (PM2.5) > 400 in Priya's delivery zone for 4+ consecutive hours.
**Gig-Shield Response:** AQI API feed triggers the parametric rule in EventBridge. Priya's policy state in DynamoDB is updated to "Active Payout." Instant UPI transfer processed.

---

### Persona 3: Arjun, Blinkit Rider, Lucknow
> _"There was a political protest and the district admin declared a curfew with 2 hours notice. No one told the app. I was stuck home for a day with no income."_

**Trigger:** Verified civic curfew alert in Arjun's district (sourced from government/news APIs).
**Gig-Shield Response:** Curfew alert ingested via External APIs → EventBridge → Lambda verifies against district-level policy data in DynamoDB → payout initiated.

---

## Weekly Premium Model & Parametric Triggers

### Weekly Premium Structure

Gig workers are paid weekly by platforms. Gig-Shield mirrors this cycle precisely to ensure **premiums never feel like a burden**.

| Coverage Tier | Weekly Premium | Daily Income Cover | Max Trigger Days/Week |
|---|---|---|---|
| Basic | ₹20 | ₹500 | 2 days |
| Standard | ₹45 | ₹800 | 3 days |
| Premium | ₹80 | ₹1,200 | 5 days |

> Premiums are auto-debited from the worker's linked UPI ID each Monday, aligned with platform payout cycles.

### Parametric Trigger Matrix

| Event Type | Data Source | Threshold | Geographic Granularity |
|---|---|---|---|
| Heavy Rainfall | IMD / OpenWeatherMap API | > 50mm in 6 hours | District-level |
| Cyclone / Severe Storm | NDMA Alert API | Category 1+ | State-level |
| Hazardous Air Quality | CPCB AQI Feed | PM2.5 > 400 for 4hrs | City-zone level |
| Civic Curfew | Government Press API / News | Official declaration | District-level |

**Key Principle — No Subjectivity:** A parametric system pays based on the **index value** of an external data feed, not on an individual's reported loss. This eliminates claim fraud at the foundational level — and is why our anti-spoofing strategy focuses on _location fraud_, not _claim fraud_.

---

## Adversarial Defense & Anti-Spoofing Strategy

> ** Incident Report:** During beta testing, intelligence confirmed a coordinated syndicate of ~500 delivery workers exploiting the platform. Using localized Telegram coordination groups and commercial GPS-spoofing applications, members were falsely positioning themselves in active red-alert weather zones while physically remaining at home — triggering mass fraudulent payouts.

> Simple GPS coordinate verification is **insufficient and defeated**. The following multi-layered defense strategy has been designed and integrated into the AWS architecture.

---

### Layer 1 — Sensor Fusion (The Behavioral Fingerprint)

**The Insight:** A person sitting still at home and a person navigating a flooding street produce fundamentally different physical signatures. GPS coordinates can be spoofed. Physics cannot.

The Gig-Shield mobile app (React Native) continuously collects **accelerometer and gyroscope telemetry** from the device's native sensors. This raw sensor stream is transmitted to the **AI Defense Engine (Amazon SageMaker)** for behavioral analysis.

SageMaker's model evaluates:
- **Micro-vibration patterns** — does the motion signature match someone navigating an obstacle-laden flooded road, or someone stationary in a climate-controlled room?
- **Movement trajectory consistency** — does the device's physical movement align with the reported GPS path over time?
- **Temporal consistency** — does the sensor data show continuous, real-world exposure to the claimed event duration, or a sudden static period followed by a claim submission?

> A fraudster spoofing GPS on their phone while lying on their sofa **cannot fake the physical motion profile** of riding through a storm.

---

### Layer 2 — Multi-Signal Triangulation & Ring Detection (The Network Fingerprint)

**The Insight:** Fraud syndicates, by their nature, share infrastructure. Individually, each fraudster looks plausible. Together, they leave a network-level fingerprint that statistical anomaly detection can surface instantly.

Beyond GPS, the app collects **passive network context** (with user consent, disclosed in onboarding):
- **Cell Tower IDs & Signal Strength** — triangulates physical position independent of GPS.
- **Wi-Fi SSID & BSSID hashes** — critically, if 50 workers are "in 50 different flood zones" but their devices all show the same residential Wi-Fi BSSID, the fraud ring is exposed.
- **Mock Location Permission Status** — the app checks Android's `android.permission.ACCESS_MOCK_LOCATION` flag and iOS's equivalent. An active mock location provider is an immediate hard flag.
- **App Overlay Detection** — checks for active GPS spoofing applications running in the background.

This multi-signal data is fed into the **Amazon SageMaker Isolation Forest model** — an unsupervised anomaly detection algorithm specifically suited for identifying outliers in high-dimensional data. It is configured to surface:

- **Fraud Rings:** Clusters of workers with identical or near-identical network fingerprints despite claiming geographically disparate locations.
- **Impossible Trajectories:** GPS paths that are physically impossible given the device's reported speed and the city's road network.
- **Syndicate Timing Patterns:** Coordinated claim submissions originating within seconds of each other across a suspiciously homogeneous group.

The Isolation Forest flags these as a **"500-worker Syndicate Pattern"** — matching the exact threat vector identified in the beta incident.

---

### Layer 3 — The Yellow Tier (Human-Centered UX for Edge Cases)

**The Insight:** Automated fraud detection has false positives. A legitimate worker with an old phone, poor sensors, or a spotty network connection should not be auto-rejected. Harsh auto-rejection destroys trust and drives workers away from the product entirely.

Gig-Shield does **not** operate a binary approve/reject system. Claims are triaged into three tiers:

| Tier | Color | Meaning | Action |
|---|---|---|---|
| **Green** | 🟢 | All signals clear | Auto-payout triggered immediately |
| **Yellow** | 🟡 | 1-2 anomalous signals | Soft-flag: worker prompted for a quick contextual verification |
| **Red** | 🔴 | High-confidence fraud ring match | Claim held; flagged for manual review queue |

**The Yellow Tier workflow** is designed to be completed in under 60 seconds:
- The worker receives an in-app notification: _"We need a quick confirmation to process your payout."_
- They are asked to upload **one of the following** (their choice):
  - A photo of their immediate surroundings (flooded street, closed shops, etc.)
  - A screenshot of their delivery platform's **"Service Unavailable in your area"** notification.
  - A timestamp-verified photo showing rain/storm conditions from their current location.
- The image is passed through **SageMaker's image analysis pipeline** for contextual verification (scene classification for weather conditions, metadata validation).
- Verified Yellow-tier claims are released within 10–15 minutes.

> This approach treats workers with **dignity and presumption of good faith**, while maintaining a robust defense layer against coordinated fraud.

---

## System Architecture

The architecture is a fully serverless, event-driven pipeline on AWS, designed to operate within the **AWS Free Tier** and **$100 AWS credits**.

```
┌─────────────────────────────────────────────────────────────────────┐
│  THE EDGE (Mobile Client)           React Native · Amplify SDK      │
│  ├── Accelerometer / Gyroscope Data (Sensor Fusion)                 │
│  ├── High-Frequency Sensor Fusion Stream                            │
│  └── TLS Pinning (Prevents MITM Attacks)                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ API (HTTPS + TLS Pinning)
┌──────────────────────────────▼──────────────────────────────────────┐
│  INGESTION LAYER                                                     │
│  ├── Gig-Shield API Gateway   (DDoS throttling, rate limiting)      │
│  └── Lambda Orchestrator      (Routes to AI Engine & State Store)   │
└──────────┬─────────────────────────────────────────────────────────-┘
           │
┌──────────▼──────────────────────────────────────────────────────────┐
│  AI DEFENSE ENGINE                   Amazon SageMaker               │
│  ├── Anomaly Detection               (Real-time inference endpoint) │
│  ├── Isolation Forest Model          (Fraud ring detection)         │
│  ├── Identifies 500-worker Syndicate Patterns                       │
│  ├── Flags Robotic Movement Trajectories                            │
│  └── Dynamic Risk Profiling          (Per-worker risk score)        │
└──────────┬──────────────────────────────────────────────────────────┘
           │ Risk Profile
┌──────────▼──────────────────────────────────────────────────────────┐
│  PARAMETRIC AUTOMATION                                               │
│  ├── EventBridge (Hourly Pulse)    → Polls External Weather/AQI APIs│
│  ├── AWS Lambda (Fetch Data)       → Evaluates parametric thresholds│
│  ├── Amazon DynamoDB               → State Store (Policy, Location) │
│  └── DynamoDB Streams              → Triggers payout on state change│
└──────────┬──────────────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────────────┐
│  PAYOUT & DASHBOARD LAYER                                            │
│  ├── AWS Lambda (Payout Trigger)   → Initiates UPI transfer         │
│  ├── Mock UPI / Razorpay Gateway   → Simulated instant payout       │
│  └── Amazon QuickSight             → Admin Dashboard & Analytics    │
└─────────────────────────────────────────────────────────────────────┘
```

**Data Flow Legend:**
- 🔴 **Synchronous APIs** — Mobile ↔ API Gateway ↔ Lambda (real-time, user-facing)
- 🟢 **Asynchronous Events** — EventBridge → Lambda → DynamoDB (background processing)
- ⚪ **External APIs** — Weather (IMD/OpenWeatherMap), AQI (CPCB), Civic Alerts
- 🟡 **External Calls** — Razorpay/UPI Gateway for payout execution

---

## AWS Tech Stack & AI/ML Integration

### Core Infrastructure

| Service | Role | Free Tier Coverage |
|---|---|---|
| **Amazon API Gateway** | Ingestion endpoint, DDoS throttling, rate limiting | 1M calls/month free |
| **AWS Lambda** | Orchestration, data fetching, payout triggering | 1M requests/month free |
| **Amazon DynamoDB** | State store — policy data, worker location, smart contract state | 25GB storage free |
| **DynamoDB Streams** | Event triggers on state changes (e.g., policy → active payout) | Free with DynamoDB |
| **Amazon EventBridge** | Scheduled parametric rule evaluation (hourly pulse) | 14M events/month free |
| **Amazon SageMaker** | Anomaly detection inference, Isolation Forest model, risk profiling | $100 credit |
| **Amazon QuickSight** | Admin dashboard, fraud analytics, payout reporting | Free tier available |
| **AWS Amplify SDK** | Mobile backend integration (React Native) | Free tier available |

### AI/ML Pipeline Detail

| Model | Type | Purpose |
|---|---|---|
| **Isolation Forest** | Unsupervised Anomaly Detection | Fraud ring identification, outlier scoring |
| **Behavioral Motion Classifier** | Time-Series Classification | Sensor fusion — real vs. spoofed location |
| **Scene Classification** | Computer Vision (Yellow Tier) | Contextual photo verification |
| **Dynamic Risk Profiler** | Scoring Model | Per-worker weekly premium adjustment |

### External Data Integrations

| Source | Data Type | Trigger Use |
|---|---|---|
| OpenWeatherMap / IMD API | Rainfall, storm severity | Flood/cyclone parametric trigger |
| CPCB AQI Feed | PM2.5, PM10 index | Air quality parametric trigger |
| NDMA Alert API | Disaster alerts | Cyclone/emergency trigger |
| Government Civic API | Curfew / Section 144 orders | Civic disruption trigger |

### Mobile Client (The Edge)

- **Framework:** React Native (cross-platform iOS + Android)
- **Backend Integration:** AWS Amplify SDK
- **Security:** TLS Certificate Pinning (prevents MITM/proxy-based spoofing attacks)
- **Sensors:** Native accelerometer + gyroscope (high-frequency polling during active policy period)
- **Anti-Spoofing Checks:** Mock location permission detection, overlay app detection — executed client-side on every session heartbeat

---

## Development Roadmap

###  Phase 1 — Ideation & Foundation _(Current — Hackathon Day 1)_
- [x] Problem definition and scope boundary finalization
- [x] Persona-based user story mapping
- [x] AWS serverless architecture design
- [x] Adversarial defense strategy design
- [x] Parametric trigger matrix definition
- [x] Repository initialization and README documentation

###  Phase 2 — Core Build _(Hackathon Day 2–3)_
- [ ] React Native app scaffold with Amplify SDK integration
- [ ] API Gateway + Lambda orchestration layer deployment
- [ ] DynamoDB schema design (Worker, Policy, EventLog tables)
- [ ] EventBridge scheduled rule for hourly parametric checks
- [ ] Mock weather/AQI API integration and threshold logic
- [ ] Basic SageMaker Isolation Forest model training on synthetic data

###  Phase 3 — AI Defense Layer _(Hackathon Day 3–4)_
- [ ] Sensor fusion data collection pipeline (accelerometer/gyroscope → Lambda → SageMaker)
- [ ] Mock location + overlay detection in React Native app
- [ ] Wi-Fi BSSID / Cell Tower triangulation integration
- [ ] Isolation Forest model deployment on SageMaker endpoint
- [ ] Yellow Tier — image upload + SageMaker scene classification
- [ ] Green / Yellow / Red tier routing logic in Lambda

###  Phase 4 — Payout & Demo Polish _(Hackathon Final Day)_
- [ ] DynamoDB Streams → Lambda → Mock Razorpay/UPI payout trigger
- [ ] Amazon QuickSight admin dashboard (fraud flags, payout analytics)
- [ ] End-to-end demo scenario: Trigger event → Sensor fusion → Payout
- [ ] Fraud ring simulation: 50-worker syndicate detected by Isolation Forest
- [ ] Final presentation deck and live demo preparation

### 🔭 Post-Hackathon Vision
- Actuarial partnership with licensed Indian insurer for regulatory compliance (IRDAI sandbox)
- Integration with Zomato/Swiggy partner APIs for verified worker onboarding
- Regional expansion: Ride-hailing (Ola, Rapido), logistics (Porter, Dunzo)
- Dynamic premium engine powered by real-time risk scoring

---

## Team & Acknowledgements

> _Built with urgency, conviction, and a deep respect for the 15 million workers who keep our cities fed._

**Hackathon:** Guidewire DEVTrails 2026 — University Track
**Architecture Reference:** Gig-Shield Serverless Event-Driven Architecture (see `/docs/architecture.png`)
**Infrastructure:** AWS Free Tier + $100 AWS Credits

---

<p align="center">
  <strong>Gig-Shield — Because their income shouldn't depend on the weather forecast they never checked.</strong>
</p>


