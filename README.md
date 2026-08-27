# Kinetree

Kinetree generates visual learning paths with Gemini and lets users save and expand their skill trees locally in the browser.

## Requirements

- Node.js 20 or newer
- Python 3.10 or newer
- A Google Gemini API key

## Setup

1. Install frontend dependencies:

   ```powershell
   npm install
   ```

2. Install backend dependencies:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r backend/requirements.txt
   ```

3. Copy `.env.example` to `.env`. Copy `backend/.env.example` to `backend/.env` and add the Gemini key. Keep both `.env` files private.

4. User accounts, profiles, avatars, leaderboard entries, and skill trees are stored locally in the browser for this portfolio prototype.

5. Start the frontend and backend together:

   ```powershell
   npm run dev
   ```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:8000`.

## Checks

```powershell
npm run lint
npm run build
python -m compileall -q backend
```

Set `VITE_API_URL` to the deployed API origin and `ALLOWED_ORIGINS` to a comma-separated list of deployed frontend origins in production.
