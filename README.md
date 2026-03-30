# Delhi RoadWatch

An AI-powered traffic violation reporting platform for Delhi. Citizens photograph violations, AI analyses the evidence, and admins manage enforcement — all in one system.

**Live demo:** https://shipperasap.github.io/delhi-roadwatch/

---

## What it does

Citizens can report traffic violations by uploading a photo or video. Google Gemini AI automatically analyses the evidence, detects the vehicle number plate, and assigns a confidence score. An admin reviews the case and can dispatch an e-challan to the vehicle owner. Police officers can file direct reports that bypass the AI queue.

| Role | What they can do |
|---|---|
| **Citizen** | Report violations with photos/videos, track case status, see pending e-challans against their vehicle |
| **Police** | File official incident reports with mandatory plate entry |
| **Admin** | Review AI-analysed cases, accept/reject, dispatch e-challans, re-run AI analysis |

---

## Try it instantly (no install)

1. Open the live demo: **https://shipperasap.github.io/delhi-roadwatch/**
2. On the Setup screen, enter your **Google Gemini API key** (free — see below)
3. Log in with a demo account (shown on the login page)

That's it. No sign-up, no database, no server. Everything runs in your browser.

---

## Getting a Gemini API Key (free, takes 1 minute)

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with any Google account
3. Click **Create API key** → copy it
4. Paste it into the Setup screen when you first open the app

Free tier: **1,500 requests/day** — more than enough for testing.

---

## Demo Accounts

| Role | Login | Password |
|---|---|---|
| Citizen | `arjun@demo.com` | `citizen123` |
| Police | `POL001` | `police123` |
| Admin | `ADM001` | `admin123` |

---

## Testing the full workflow

1. **Sign in as Citizen** → Capture → upload any road photo → pick a violation type → Submit
2. AI analyses the image (takes a few seconds) — you'll see confidence score + detected plate
3. **Sign in as Admin** → expand the case → see AI verdict, Vahaan vehicle lookup
4. Click **Verify & Accept** → then **Dispatch E-Challan**
5. **Sign back in as Citizen** — a violation alert appears on your home screen

Demo vehicle plates that return owner data in the Vahaan lookup:
`DL01AB1234` · `DL2CAB5678` · `HR26DQ5588` · `UP16AT4321` · `MH12AB3456`

---

## Optional: Sightengine (deepfake detection)

If you also add a [Sightengine](https://sightengine.com/) API user + secret in Settings, the app will detect AI-generated images in submitted evidence and flag them in the admin view. Free tier: 500 checks/month. Leave blank to skip.

---

## Run locally

```bash
git clone https://github.com/shipperasap/delhi-roadwatch.git
cd delhi-roadwatch
npm install
npm run dev
```

Open **http://localhost:5173**, enter your Gemini API key on the Setup screen, and log in.

---

## Deploy your own copy to GitHub Pages

No secrets or environment variables needed — users bring their own API keys.

1. **Fork** this repository
2. Go to your fork → **Settings** → **Pages** → Source: **GitHub Actions**
3. Push any commit to `main`
4. Your app will be live at `https://<your-username>.github.io/delhi-roadwatch/`

---

## How data is stored

Everything lives in your **browser's localStorage** — no backend, no database, no account needed:

- Data persists across page refreshes
- Each browser/device has its own isolated data
- Clearing browser storage resets everything (demo accounts re-seed automatically)
- Uploaded images are compressed to base64 JPEG; video URLs are temporary (lost on refresh)
- API keys are stored locally and only ever sent to their respective APIs (Gemini, Sightengine)

---

## Tech stack

- React 19 + Vite + React Router (HashRouter for GitHub Pages compatibility)
- Google Gemini 2.5 Flash — violation analysis, plate detection, legal FAQ, e-challan messages
- Sightengine — optional deepfake/AI-image detection
- Browser localStorage — full data layer (no Supabase, no backend)
- GitHub Actions — automatic GitHub Pages deployment
