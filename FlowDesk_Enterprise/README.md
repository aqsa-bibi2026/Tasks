# FlowDesk

Run from root:
```sh
npm install
npm --prefix frontend install
npm --prefix backend install
npm run dev
```

Open http://localhost:5173. Build the frontend with `npm run build`. The optional Express API runs on port 5000 and exposes `/health`.

Features include editable projects, tasks, customers and team members; task completion; page search; project status filters; workspace preferences; activity notifications; analytics; and JSON export. Records persist in this browser's local storage.

This is a single-device demo. Authentication, server synchronization and invitations are not implemented. Revenue figures are explicitly labeled demo data; other metrics use saved workspace records. The local assistant provides record-based summaries without a connected language model. Export downloads a backup; importing backups is not implemented. Google Fonts fall back to local sans-serif fonts when offline.

With the dev server running and headless Chrome exposing port 9223, run `node tests/browser-check.mjs` to check CRUD, persistence, search, navigation, assistant responses, preferences and mobile layout. Screenshots are saved in `artifacts/`. Existing browser data is restored after the checks.
