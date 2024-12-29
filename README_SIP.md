SIP credentials
Username: sip57038002
Password: Hq1FVgls78jjjQ
Domain: sip5@b3networks.com / 13.251.178.63

Singapore number: 63030548

IP Address whitelist:
13.251.178.63
54.251.255.196 to 54.251.255.211
Port whitelist:
5060 (SIP signalling)
10000 - 30000


```bash
sipp -sn uac 13.251.178.63:5060 \
    -s +6582888399 \
    -au sip57038002 \
    -ap Hq1FVgls78jjjQ \
    -m 1 \
    -trace_msg \
    -trace_err
```

```json
{
    "id": "2d177b2d-69a3-4940-8e13-8bc7589eb552",
    "orgId": "76c45622-b2ea-492f-adef-55daa53676ef",
    "provider": "byo-sip-trunk",
    "createdAt": "2024-12-27T09:25:36.680Z",
    "updatedAt": "2024-12-27T09:25:36.680Z",
    "gateways": [
        {
            "ip": "13.251.178.63"
        }
    ],
    "name": "Singapore Test"
}

{
    "id": "5a5e8c58-864a-4509-86ce-613fd4a3e2ac",
    "orgId": "76c45622-b2ea-492f-adef-55daa53676ef",
    "number": "+6563030548",
    "createdAt": "2024-12-27T09:28:20.412Z",
    "updatedAt": "2024-12-27T09:28:20.412Z",
    "name": "Singapore SIP Number",
    "credentialId": "2d177b2d-69a3-4940-8e13-8bc7589eb552",
    "provider": "byo-phone-number",
    "numberE164CheckEnabled": true
}
```