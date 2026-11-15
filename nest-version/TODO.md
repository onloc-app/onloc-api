# TODO

## Endpoints

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
- [ ] Device Shares
- [ ] Locations
- [ ] Unified Push

## Realtime & Services

- [ ] Socket.IO Gateway (`@WebSocketGateway()`)
  - Client room joining (`user-{id}`, `device-{id}`)
  - Device connect/disconnect events
  - User watching events
- [ ] Notification Service (`NotificationService`)
  - Emit connection change to user & device rooms
  - Emit user watching status
  - Push location updates to listeners
- [ ] Queue Service (`QueueService`)
  - In-memory command queue per device
  - Dequeue / dispatch commands on reconnect
- [ ] Device Commands
  - Command base class
  - RingCommand
  - LockCommand
  - FlashCommand
