# TODO

## Nest transition

### Endpoints

- [x] Auth
- [x] Avatars
- [x] Users
  - Note: `GET /users/info` no longer includes tier (UI will fetch tier separately)
  - Note: `GET /users` no longer fetches extra info for admins, use `GET /users/admin`
- [x] API Keys
  - Note: Hash API keys with SHA-256 before storing in DB (currently stored in plaintext)
- [x] Preferences
- [x] Settings
- [x] Tiers
- [x] Tokens
- [x] User Tiers
- [x] Connections
- [x] Devices
- [x] Device Shares
- [x] Locations
  - Note: Get locations does not return per device objects anymore.
  - Note: /locations/dates?device_id=:id is now /locations/:id/dates
  - Note: Removed PATCH endpoint for locations
- [x] Unified Push

### Other stuff

- [x] Swagger docs
- [ ] Docker file

## Future

- [ ] Switch IDs to UUIDs
- [ ] Hash API keys
