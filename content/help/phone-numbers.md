# Phone Number Management

Learn how to manage your phone numbers in the system.

## Adding a New Number

To add a new phone number:

1. Navigate to the Phone Numbers page
2. Click the "New Number" button
3. Fill in the required information:
   - Name: A friendly name for the number
   - Phone Number: The actual phone number
   - Domain/IP: Your SIP domain or IP address
   - Port: SIP port (default: 5060)
   - Protocol: Choose between TCP or UDP
4. Optional authentication:
   - Username: SIP authentication username
   - Password: SIP authentication password
5. Click "Register" to save

## Managing Existing Numbers

Your registered numbers will appear in a table showing:
- Name
- Phone Number
- Status
- Actions

### Deleting a Number

To delete a number:
1. Find the number in the table
2. Click the trash icon
3. Confirm the deletion

:::warning
Deleting a number will also remove its associated credential. This action cannot be undone.
:::

## Technical Details

### SIP Configuration

The system uses SIP (Session Initiation Protocol) for phone number registration. Here are the key points:

```json
{
  "provider": "byo-sip-trunk",
  "gateways": [
    {
      "ip": "your-domain.com",
      "port": 5060,
      "protocol": "tcp/udp",
      "inboundEnabled": false,
      "outboundEnabled": true
    }
  ]
}
```

### Authentication

Authentication is optional but recommended for security. When provided, the system will use the credentials for outbound calls.

:::tip
Use strong passwords and keep your credentials secure.
:::

## Troubleshooting

Common issues and solutions:

1. **Registration Failed**
   - Check if the domain/IP is correct
   - Verify the port is open and accessible
   - Confirm credentials if authentication is enabled

2. **Can't Delete Number**
   - Ensure the number is not in use by any active calls
   - Check if you have the necessary permissions
