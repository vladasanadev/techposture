# Resend sending records for vladasana.com

Add these records at Namecheap. Preserve the existing website records and inbound email-forwarding MX records. These records apply to the `send` subdomain and `resend._domainkey`, not the root inbound mail service.

| Type | Host | Value | Priority | TTL |
| --- | --- | --- | --- | --- |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDmMUOxKuaFFxs1p7UJS9yR/9GSDf3MzvdtxZDyWY4VEa0j8MWgjdWfFFbT+cqtUVSSzkI9IGAbxIsRvEoodDGOdJA+oFSjoKXBztuaHtB7GLPDHwfkB9LdQKl4FaoaVu/IdJ4SdeK3Mnm6+sCWS9lnAQtJyNE72CHTJ3tCqED9wwIDAQAB` | — | Automatic |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 | Automatic |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | — | Automatic |

After saving, run domain verification for Resend domain `ba872bae-a056-4290-a9b7-aa3fa8b2c334`. The required result is `status=verified` before sending as `delivery@vladasana.com`.

These are public DNS values, not API keys. Source: the authenticated Resend domain API, September 9, 2026.
