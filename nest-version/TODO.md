# TODO

- [x] Auth
- [x] Avatars
- [x] Users
  - Note: `GET /users/info` no longer includes tier (UI will fetch tier separately)
  - Note: `GET /users` no longer fetches extra info for admins, user `GET /users/admin`
- [x] API Keys
  - Note: Hash API keys with SHA-256 before storing in DB (currently stored in plaintext)
- [ ] Connections
- [ ] Devices
- [ ] Device Shares
- [ ] Locations
- [x] Preferences
- [x] Settings
- [x] Tiers
- [x] Tokens
- [ ] Unified Push
- [x] User Tiers
