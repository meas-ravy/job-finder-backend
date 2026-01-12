# API Documentation

## Notes

- Single-device sessions: issuing a new refresh token revokes any existing active refresh tokens for that user. Logging in on a new device logs out other devices.
- Phone format: phone numbers are accepted and stored as provided (trimmed). Use your local format (e.g., `0964516228` for Cambodia).
- OTP verification: codes are stored and verified locally (PhoneOtp table). SMS delivery uses PlasGate when configured.
- PlasGate SMS config: `PLASGATE_PRIVATE_KEY`, `PLASGATE_SECRET`, `PLASGATE_SENDER`, optional `PLASGATE_BASE_URL`.
