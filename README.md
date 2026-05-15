# Solar Dashboard (DRINKCLEAN)

Local dev instructions:

1. Copy `.env.example` to `.env` and fill the Firebase values.

2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm run dev
```

4. Open the URL printed by Vite (usually `http://localhost:5173`).

Notes:
- The React app reads Firebase config from `import.meta.env` as Vite env vars.
- Add your Firebase Realtime Database rules to allow read/write for testing.
