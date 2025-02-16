# Westpac Service Workflows

## 1. Customer Authentication Flow

### Initial Contact
```mermaid
flowchart TD
    A[Customer Contact] --> B{Authentication Required?}
    B -->|Yes| C[Verify Identity]
    B -->|No| D[General Assistance]
    C --> E{Verification Method}
    E -->|SMS| F[Send Code]
    E -->|Security Questions| G[Ask Questions]
    E -->|Alternative| H[Other Methods]
```

### Verification Process
1. Request Customer ID
   - If not available, use alternative verification
   - Explain why verification is needed

2. Two-Factor Authentication
   ```
   if (registered_mobile) {
       offer_sms_code()
   } else if (security_questions_set) {
       use_security_questions()
   } else {
       escalate_to_specialist()
   }
   ```

## 2. Loan Application Process

### Home Loan Application
```mermaid
flowchart TD
    A[Application Start] --> B[Income Verification]
    B --> C[Property Details]
    C --> D[Credit Check]
    D --> E{Decision}
    E -->|Approved| F[Formal Approval]
    E -->|Conditional| G[Request Documents]
    E -->|Declined| H[Notification]
    F --> I[Settlement]
    G --> J[Review]
```

### Processing Steps
1. Initial Assessment
   - Income verification
   - Expense analysis
   - Property valuation
   - Credit check

2. Documentation
   - Proof of income
   - Bank statements
   - Property documents
   - ID verification

3. Approval Process
   - Initial assessment
   - Formal approval
   - Conditional approval
   - Final settlement

## 3. Dispute Resolution

### Transaction Dispute
```mermaid
flowchart TD
    A[Dispute Lodged] --> B[Initial Assessment]
    B --> C{Dispute Type}
    C -->|Unauthorized| D[Fraud Check]
    C -->|Merchant| E[Merchant Contact]
    C -->|Processing| F[Internal Review]
    D --> G[Card Block]
    E --> H[Resolution]
    F --> I[Adjustment]
```

### Processing Steps
1. Dispute Intake
   - Transaction details
   - Dispute reason
   - Evidence collection
   - Temporary credit assessment

2. Investigation
   - Merchant contact
   - Documentation review
   - Scheme rules check
   - Customer communication

3. Resolution
   - Outcome determination
   - Customer notification
   - Account adjustment
   - Prevention advice

## 4. Card Management

### New Card Issuance
```mermaid
flowchart TD
    A[Request] --> B{Card Type}
    B -->|New| C[Application]
    B -->|Replacement| D[Verification]
    C --> E[Credit Check]
    D --> F[Card Production]
    E --> F
    F --> G[Activation Process]
```

### Lost/Stolen Card
```mermaid
flowchart TD
    A[Report] --> B[Immediate Block]
    B --> C[Fraud Check]
    C --> D{Fraud Found?}
    D -->|Yes| E[Investigation]
    D -->|No| F[New Card Issue]
    E --> G[Dispute Process]
```

## 5. Emergency Response

### Fraud Detection
```mermaid
flowchart TD
    A[Alert Triggered] --> B[Risk Assessment]
    B --> C{Severity}
    C -->|High| D[Immediate Block]
    C -->|Medium| E[Customer Contact]
    C -->|Low| F[Monitor]
    D --> G[Investigation]
    E --> H[Verify Activity]
```

### System Outage
```mermaid
flowchart TD
    A[Outage Detected] --> B[Impact Assessment]
    B --> C[Customer Communication]
    C --> D{Duration}
    D -->|Short| E[Status Updates]
    D -->|Extended| F[Alternative Services]
    F --> G[Recovery Plan]
```

### Natural Disaster Response
```mermaid
flowchart TD
    A[Disaster Alert] --> B[Area Assessment]
    B --> C[Customer Impact]
    C --> D[Support Measures]
    D --> E[Payment Relief]
    D --> F[Emergency Access]
    D --> G[Priority Service]
```

## 6. Business Banking Support

### Merchant Services
```mermaid
flowchart TD
    A[Merchant Issue] --> B{Issue Type}
    B -->|Terminal| C[Hardware Support]
    B -->|Settlement| D[Payment Review]
    B -->|Access| E[Security Check]
    C --> F[Resolution]
    D --> G[Adjustment]
    E --> H[Reset Process]
```

### Business Lending
```mermaid
flowchart TD
    A[Loan Enquiry] --> B[Business Assessment]
    B --> C[Financial Review]
    C --> D{Loan Type}
    D -->|Equipment| E[Asset Verification]
    D -->|Working Capital| F[Cash Flow Analysis]
    E --> G[Approval Process]
    F --> G
```

## Emotional State Management

### Distressed Customer
1. Acknowledge emotion
2. Show empathy
3. Take control professionally
   ```
   if (customer_frustrated) {
       acknowledge_frustration()
       offer_immediate_assistance()
   } else if (customer_worried) {
       provide_reassurance()
       explain_security_measures()
   }
   ```

### Satisfaction Check
1. Confirm resolution
2. Address additional concerns
3. Thank customer
   ```
   if (fully_resolved) {
       confirm_satisfaction()
       offer_additional_help()
   } else {
       explain_next_steps()
       set_follow_up()
   }
   ```

## Cultural Support Protocols

### Indigenous Australian Customers
1. Acknowledge Traditional Owners
2. Offer interpreter services
3. Explain financial assistance programs
4. Provide dedicated Indigenous banking team contact

```
if (customer_identifies_as_indigenous) {
    offer_cultural_support_options()
}
```

### Remote Community Banking
1. Identify regional accessibility needs
2. Offer Bank@Post alternatives
3. Provide satellite banking schedules
4. Explain cash delivery services

```
if (postcode in remote_areas) {
    activate_regional_support_mode()
}
```

## Escalation Procedures

### When to Escalate
- Complex financial advice needed
- Technical issues beyond scope
- Complaint handling
- Fraud cases

### Escalation Process
1. Explain need for escalation
2. Set expectations
3. Warm transfer when possible
   ```
   if (specialist_available) {
       perform_warm_transfer()
   } else {
       schedule_callback()
       provide_case_number()
   }
   ```

## Quality Assurance Checkpoints

### During Interaction
- Verify understanding
- Confirm actions
- Document decisions
   ```
   after_each_step {
       confirm_understanding()
       document_action()
       verify_next_steps()
   }
   ```

### Post-Interaction
1. Summarize actions taken
2. Confirm no other needs
3. Document interaction
   ```
   before_closing {
       summarize_resolution()
       offer_additional_assistance()
       complete_documentation()
   }
   ```
