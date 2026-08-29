# Task 16 — Stable V3

This build is made for a clean beginner-friendly local demo.

## What was fixed

1. Logged-out startup uses `/auth/session` and returns HTTP 200 instead of expected 401 console noise.
2. Existing registration and wrong login are handled as normal UI results instead of red 409/401 responses.
3. Forgot Password creates one exact reset request.
4. Backend returns `resetId` with the local development code.
5. React stores `email + resetId + devCode` in `sessionStorage`.
6. Verify Code checks the exact `resetId`, so old reset rows cannot be accidentally selected.
7. In `NODE_ENV=development` + `EMAIL_MODE=console`, the exact generated code is automatically filled.
8. Refreshing the verify page keeps the recovery state.
9. Resend replaces both the current code and reset request ID.

## Cleanest first test

If you want to remove old Task 16 test data, run in Supabase SQL Editor:

`supabase/task_16_v3_reset_test_data.sql`

Then create:

- Name: Test User
- Email: task16demo@gmail.com
- Password: Test12345

Logout, click Forgot Password, use the same email, and on the verification page simply click **Verify reset code** because the exact local code is already filled.

Reset to:

`NewTest12345`

Then login with the new password.
