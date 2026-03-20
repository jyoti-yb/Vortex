# Gig-Shield: Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This document outlines the functional and non-functional requirements for Gig-Shield, an AI-powered parametric income insurance platform for India's gig delivery workers.

### 1.2 Scope
Gig-Shield provides automated income protection against external disruptions (severe air quality, weather, curfews) for quick-commerce delivery riders on platforms like Zepto, Blinkit, etc., with initial focus on Zepto riders in Delhi facing AQI risks.

### 1.3 Definitions
- **Parametric Insurance**: Payout based on predefined triggers, not individual claims.
- **Sensor Fusion**: Combining accelerometer, gyroscope, and network data for location verification.
- **Yellow Tier**: Soft-flag claims requiring quick user verification.

## 2. Overall Description

### 2.1 Product Perspective
Gig-Shield is a mobile-first, serverless platform built on AWS, integrating with external APIs for real-time event monitoring.

### 2.2 User Characteristics
- **Primary Users**: Quick-commerce delivery riders (18-45 years, smartphone users, operating in urban pollution hotspots like Delhi).
- **Secondary Users**: Platform admins for fraud monitoring.

### 2.3 Constraints
- Must operate within AWS Free Tier and $100 credits.
- Payouts limited to UPI transfers.
- Compliance with Indian data protection laws.

## 3. Specific Requirements

### 3.1 External Interface Requirements

#### 3.1.1 User Interfaces
- React Native mobile app for enrollment and status checking.
- Web dashboard for admins using Amazon QuickSight.

#### 3.1.2 Hardware Interfaces
- Smartphone sensors (accelerometer, gyroscope).
- GPS and network modules.

#### 3.1.3 Software Interfaces
- AWS API Gateway for REST APIs.
- External APIs: IMD, CPCB, NDMA, Government Civic APIs.

### 3.2 Functional Requirements

#### 3.2.1 Worker Enrollment (FR1)
- **Description**: Workers enroll via app, provide UPI ID, select coverage tier.
- **Inputs**: Personal details, operational zone.
- **Outputs**: Policy ID, weekly premium deduction setup.
- **Priority**: High

#### 3.2.2 Parametric Trigger Monitoring (FR2)
- **Description**: System monitors external APIs for trigger conditions.
- **Inputs**: Weather data, AQI feeds, civic alerts.
- **Outputs**: Event notifications to Lambda functions.
- **Priority**: High

#### 3.2.3 AI Defense Engine (FR3)
- **Description**: Validates worker location using sensor fusion and anomaly detection.
- **Inputs**: Sensor data, network fingerprints.
- **Outputs**: Green/Yellow/Red tier classification.
- **Priority**: High

#### 3.2.4 Payout Processing (FR4)
- **Description**: Initiates UPI transfers for verified claims.
- **Inputs**: Verified claim data.
- **Outputs**: UPI transaction confirmation.
- **Priority**: High

#### 3.2.5 Friction Score Engine (FR6)
- **Description**: Computes real-time income disruption score using weighted factors.
- **Inputs**: Traffic data, network quality, environmental metrics, zone activity.
- **Outputs**: Continuous score triggering payouts for hidden losses.
- **Priority**: High

### 3.3 Non-Functional Requirements

#### 3.3.1 Performance
- Payout initiation within 20 minutes of trigger.
- API response time < 2 seconds.

#### 3.3.2 Security
- TLS 1.3 encryption for all communications.
- Data anonymization for sensor streams.

#### 3.3.3 Usability
- App onboarding in < 5 minutes.
- Multi-language support (English, Hindi).

#### 3.3.4 Reliability
- 99.9% uptime for core services.
- Graceful degradation during API outages.

## 4. Use Cases

### 4.1 Use Case 1: Rider Enrollment
**Actor**: Quick-Commerce Rider
**Preconditions**: Rider has smartphone with app installed.
**Main Flow**:
1. Rider opens app and selects enrollment.
2. Provides personal details, UPI ID, and operational zone (e.g., Delhi-NCR).
3. Chooses coverage tier based on AQI risk profile.
4. System validates details and sets up weekly premium deduction.
5. Rider receives policy confirmation with AQI monitoring alerts.
**Postconditions**: Rider is enrolled and policy is active.

### 4.2 Use Case 2: Parametric Trigger Activation
**Actor**: System (Automated)
**Preconditions**: AQI exceeds threshold in Delhi-NCR.
**Main Flow**:
1. EventBridge receives alert from CPCB AQI API.
2. Lambda evaluates active policies for enrolled Zepto riders in affected zones.
3. Triggers AI Defense Engine for location verification using sensor fusion.
4. For Green tier: Initiates instant UPI payout.
5. For Yellow tier: Sends verification request to rider.
6. For Red tier: Flags for manual review.
**Postconditions**: Claims are processed or flagged.

### 4.3 Use Case 3: Yellow Tier Verification
**Actor**: Quick-Commerce Rider
**Preconditions**: Claim flagged as Yellow tier due to anomalous sensor data.
**Main Flow**:
1. Rider receives in-app notification for verification.
2. Chooses method: Upload photo of current surroundings (e.g., smoggy conditions) or screenshot of Zepto app showing service disruption.
3. SageMaker analyzes image for AQI-related context (visibility, pollution indicators).
4. If verified: Payout initiated within 15 minutes.
5. If not: Moved to manual review queue.
**Postconditions**: Claim resolved without unfair penalty.

### 4.5 Use Case 5: Friction Score Triggered Payout
**Actor**: System (Automated)
**Preconditions**: No extreme event, but cumulative friction factors high.
**Main Flow**:
1. System collects real-time data: traffic congestion, network degradation, environmental risk, zone activity.
2. Computes Friction Score using weighted formula.
3. If score exceeds threshold, evaluates policies for affected riders.
4. Triggers AI Defense Engine for verification.
5. Initiates payout for verified riders.
**Postconditions**: Hidden income losses are covered without waiting for binary triggers.

## 5. Assumptions and Dependencies

- Access to reliable external APIs.
- Worker smartphones support required sensors.
- UPI integration available.
- AWS services remain within free tier limits.

## 6. Appendices

### 6.1 Glossary
- **AQI**: Air Quality Index
- **IMD**: India Meteorological Department
- **UPI**: Unified Payments Interface

### 6.2 References
- AWS Documentation
- Indian Insurance Regulatory Framework
