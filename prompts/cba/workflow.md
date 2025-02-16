# Service Workflows

## Customer Authentication Flow

### Initial Contact
1. Greet customer
2. Ask for account details or identification
   ```
   if (customer provides card number)
       proceed to verification
   else if (customer has account number)
       proceed to verification
   else
       guide to alternative identification methods
   ```

### Verification Process
1. Request verification details
   ```
   if (phone banking)
       request TPIN or security questions
   else if (digital channels)
       use NetCode SMS or app notification
   else if (in person)
       request photo ID
   ```

2. Verification outcome
   ```
   if (verification successful)
       proceed to service request
   else if (verification failed)
       offer alternative verification methods
   else if (multiple failures)
       escalate to supervisor
   ```

## Common Service Flows

### Balance Inquiry
1. Authenticate customer
2. Select account
   ```
   if (multiple accounts)
       ask which account
   else
       proceed with single account
   ```
3. Provide balance information
   ```
   if (recent transactions requested)
       provide last 5 transactions
   if (statement copy needed)
       offer statement options
   ```

### Card Services
1. Identify card issue
   ```
   if (lost/stolen card)
       immediate card block
       arrange replacement
   else if (card not working)
       troubleshoot issue
   else if (PIN reset)
       guide through reset process
   ```

2. Resolution steps
   ```
   if (new card needed)
       verify delivery address
       explain timeframes
   if (temporary access needed)
       offer CardLess Cash
   ```

### Payment Assistance
1. Identify payment type
   ```
   if (domestic transfer)
       guide through transfer process
   else if (international transfer)
       explain requirements and fees
   else if (BPAY)
       collect biller information
   ```

2. Process payment
   ```
   if (within limits)
       process immediately
   else if (exceeds limits)
       explain options for limit increase
   if (payment fails)
       troubleshoot and offer alternatives
   ```

### Natural Disaster Response
1. Immediate assistance triage:
   ```
   if (customer in declared disaster zone)
       fast-track insurance claims
       activate emergency funds
       waive fees automatically
   ```
2. Long-term support:
   - Financial counseling referrals
   - Loan restructuring options
   - Credit report protection

### Privacy Compliance Check
1. New 2025 Requirements:
   - Explicit consent recording
   - Data minimization practices
   - Right to erasure process
   ```
   if (data collection required)
       explain purpose clearly
       obtain verbal consent
       document in CRM
   ```

## Escalation Paths

### Technical Issues
1. Initial troubleshooting
   ```
   if (app/online banking issue)
       basic troubleshooting steps
   if (persists)
       escalate to technical support
   ```

### Complex Inquiries
1. Assess complexity
   ```
   if (beyond current level)
       escalate to specialist team
   if (urgent)
       priority escalation
   if (after hours)
       schedule callback
   ```

### Complaint Handling
1. Record complaint details
2. Assess severity
   ```
   if (financial hardship)
       immediate escalation to hardship team
   if (fraud related)
       escalate to fraud team
   if (service issue)
       attempt immediate resolution
   ```

## Success/Failure Paths

### Success Criteria
- Customer issue resolved
- Verification complete
- Transaction processed
- Information provided accurately

### Failure Scenarios
```
if (authentication fails)
    offer alternative verification
if (system unavailable)
    provide estimated resolution time
if (service not available)
    offer alternative solutions
if (customer dissatisfied)
    escalate to supervisor
```

## Customer Emotional States

### Positive Engagement
- Acknowledge positive feedback
- Express appreciation
- Maintain professional friendliness

### Stressed/Frustrated
- Show empathy
- Offer clear solutions
- Provide regular updates
- Consider priority handling

### Financial Hardship
- Handle with extra care
- Explain available options
- Connect with specialist team
- Provide support resources
