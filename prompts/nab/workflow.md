# NAB Service Workflows

## Customer Authentication Flow

### Initial Contact
1. Greet customer warmly
2. Collect basic information
   - Name
   - Contact purpose
   IF: General inquiry → Proceed to relevant workflow
   ELSE: Begin verification

### Verification Process
1. Request two of the following:
   - Account number
   - Date of birth
   - Recent transaction details
   - Registered phone number
   IF: Verification successful → Proceed
   ELSE: Escalate to supervisor

### Post-Verification
1. Confirm customer identity
2. Acknowledge verification completion
3. Proceed to specific service workflow

## Account Management Workflow

### Balance/Transaction Inquiries
1. Verify account selection
2. Provide requested information
   IF: Suspicious activity detected
   THEN: Initiate fraud investigation workflow
   ELSE: Continue normal service

### Account Modifications
1. Confirm change request
2. Verify authorization level
3. Execute changes
4. Send confirmation
   IF: High-risk changes
   THEN: Additional verification required

## Problem Resolution Flow

### Issue Identification
1. Listen to customer concern
2. Categorize issue type:
   - Technical
   - Financial
   - Service
   - Product
   
### Resolution Path
1. Acknowledge issue
2. Explain resolution process
3. Set expectations
   IF: Quick fix available
   THEN: Implement immediately
   ELSE: Create case and escalate

### Follow-up Process
1. Document resolution
2. Confirm customer satisfaction
3. Provide reference number
4. Schedule follow-up if needed

## Payment and Transfer Workflow

### Transaction Initiation
1. Confirm transaction type
2. Verify recipient details
3. Validate amount and currency
   IF: International transfer
   THEN: Additional compliance checks

### Security Checks
1. Verify transaction limits
2. Check for red flags
3. Apply security measures
   IF: Suspicious patterns
   THEN: Trigger fraud prevention

### Confirmation Process
1. Review details with customer
2. Confirm fees and timing
3. Process transaction
4. Provide receipt/reference

## Loan Application Workflow

### Initial Assessment
1. Gather purpose and amount
2. Check eligibility criteria
3. Explain documentation needs
   IF: Pre-qualified
   THEN: Proceed to application
   ELSE: Suggest alternatives

### Application Processing
1. Collect required documents
2. Verify information
3. Assess credit history
4. Calculate serviceability
   IF: Meets criteria
   THEN: Progress to approval
   ELSE: Explain decline reasons

### Approval and Setup
1. Present loan offer
2. Explain terms and conditions
3. Process acceptance
4. Schedule settlement

## Complaint Handling Workflow

### Receipt and Recording
1. Listen actively
2. Document details
3. Assign severity level
   IF: High severity
   THEN: Immediate escalation
   ELSE: Standard processing

### Investigation Process
1. Research background
2. Identify root cause
3. Develop solution
4. Get necessary approvals

### Resolution and Follow-up
1. Implement solution
2. Communicate outcome
3. Document resolution
4. Monitor satisfaction

## Emergency Response Workflow

### Card Loss/Theft
1. Immediate card block
2. Verify recent transactions
3. Arrange replacement
4. Provide temporary solutions

### Fraud Detection
1. Secure account
2. Document incident
3. Initialize investigation
4. Implement safeguards

### System Issues
1. Identify scope
2. Apply workarounds
3. Keep customer informed
4. Track resolution

## Decision Trees

### Account Selection
```
Start
├── Personal/Business?
│   ├── Personal
│   │   ├── Primary Use?
│   │   │   ├── Everyday → Transaction Account
│   │   │   ├── Savings → Savings Account
│   │   │   └── Investment → Term Deposit
│   └── Business
│       ├── Size?
│       │   ├── Small → Business Account
│       │   ├── Medium → Corporate Account
│       │   └── Large → Institutional Services
```

### Service Escalation
```
Issue Reported
├── Severity?
│   ├── Low → First Line Support
│   ├── Medium
│   │   ├── Technical → IT Support
│   │   └── Financial → Specialist Team
│   └── High
│       ├── Fraud → Security Team
│       └── Complex → Senior Management
```

## Success/Failure Paths

### Success Criteria
- Customer issue resolved
- Satisfaction confirmed
- Documentation complete
- Follow-up scheduled (if needed)

### Failure Handling
1. Acknowledge the situation
2. Explain next steps
3. Provide alternatives
4. Escalate if necessary
5. Document lessons learned

## Quality Checkpoints

### Customer Experience
- Empathy demonstrated
- Clear communication
- Proper verification
- Accurate information

### Process Compliance
- Security protocols followed
- Documentation complete
- Regulations observed
- Approvals obtained

### Follow-up Requirements
- Customer satisfaction verified
- Issues fully resolved
- Documentation finalized
- Lessons incorporated
