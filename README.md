# MalPoster - AI Malayalam Social Posting System

MalPoster is a complete full-stack enterprise-ready social media campaign system designed for the agricultural and spice export sector. It allows a user to upload product images and record or upload voice descriptions in Malayalam. The system automatically transcribes Malayalam speech, extracts high-fidelity catalog attributes, generates optimized captions for Facebook and Instagram, and publishes directly to social platform handles.

---

## 🎨 Visual Identity & Architecture

- **Theme & Aesthetic**: Elegantly modern slate-colored responsive canvas which supports dual **Light & Dark** layouts. Fully responsive for desktop, tablet, and mobile browsers.
- **Microphone Core**: Implements native HTML5 `MediaRecorder` stream capturing to stream and record 16-bit sound directly inside the user's browser.
- **Local Persistence & CDN**: Features a low-overhead file database (`database.json`) for configuration variables, logs, and product data, with local filesystem streaming fallbacks if external API keys (like Cloudinary) are omitted.

---

## 🛠️ Unified Full-Stack Technology Stack

To ensure instant, 100% plug-and-play execution in our container host environment, the system has been built as a unified TypeScript Full-Stack application:

### 1. Frontend
- **Framework**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS (Tailwind v4 with `@import "tailwindcss";` specs).
- **Animations**: Fluid micro-transitions, recording waveforms, and sliding alerts powered by `motion` (Framer Motion).
- **Icons**: Clean iconography provided exclusively by `lucide-react`.

### 2. Backend
- **Framework**: Express.js in modern Node.js/TypeScript (loaded using `tsx`).
- **AI Core**: Google GenAI SDK (`@google/genai`) and OpenAI API keys.
- **Platform integrations**: Facebook Graph API and Instagram Business Graph API.
- **Bundler**: `esbuild` for compiling backends into unified `.cjs` binary outputs (`dist/server.cjs`).

---

## 🚀 Installation & Quick Start

### 1. Local Development
Clone this repository and run package setups:

```bash
# Install package dependencies
npm install

# Start the full-stack system in development mode
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view your system live.

### 2. Production Deployment via Docker
Build and boot the self-contained container using docker-compose:

```bash
# Spin up the app container in background detached mode
docker-compose up -d --build
```
Your service will begin listening on port `3000` immediately.

---

## 🔑 Key Environment Variables

Define these variables in `.env` or inject them directly into your container context:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | **Required**. Your Google AI Studio Gemini API key. Used for Malayalam Speech-To-Text and attribute extraction. |
| `APP_URL` | Self-referential URL where this service is hosted (e.g. `https://my-app-run-service.run.app`). Used for Meta API callback verification. |

---

## 🛰️ Backend API Routes Documentation

| Method | Endpoint | Description | Headers |
|---|---|---|---|
| **POST** | `/api/auth/register` | Create a new user profile | `None` |
| **POST** | `/api/auth/login` | Authenticate user and retrieve JWT session token | `None` |
| **GET** | `/api/auth/me` | Fetch authenticated user details | `Authorization: Bearer <Token>` |
| **POST** | `/api/upload` | Base64-to-file image/audio uploader. Proxy to Cloudinary or Local uploads folder | `Authorization: Bearer <Token>` |
| **POST** | `/api/transcribe` | Transcribe Malayalam voice clips using Gemini 3.5 Flash | `Authorization: Bearer <Token>` |
| **POST** | `/api/extract` | Extract schema properties from transcriptions | `Authorization: Bearer <Token>` |
| **POST** | `/api/generate-caption` | Draft optimized Facebook and Instagram copy from schemas | `Authorization: Bearer <Token>` |
| **POST** | `/api/publish` | Post photo + caption to Facebook / Instagram Graph API | `Authorization: Bearer <Token>` |
| **GET** | `/api/dashboard/stats` | Retrieve metrics, activity history, and counts | `Authorization: Bearer <Token>` |
| **GET** | `/api/history` | Retrieve published logs history list | `Authorization: Bearer <Token>` |
| **GET** | `/api/logs` | Fetch system activity logs | `Authorization: Bearer <Token>` |

---

## 🏛️ Database Architectures (PostgreSQL Specs)

If you migrate or scale this service to use a relational database, use the pre-built files included in the workspace root:
1. **PostgreSQL Schema**: `/schema.sql` (Creates Users, Products, Uploads, Captions, Social Posts, Social Accounts, and Logs tables with optimized indexes).
2. **SQLAlchemy ORM Models**: `/models.py` (Fully mapped declarative classes for Python integrations).

---

## 🔗 Meta (Facebook & Instagram) API Setup Guide

To establish live publishing for your agricultural business:
1. Register a Meta Developer Account at [developers.facebook.com](https://developers.facebook.com).
2. Create an App with **Oauth Login**, **Page Public Content Access**, and **Instagram Graph API** permission scopes.
3. Link your Facebook Business Page to your Instagram Business Profile.
4. Retrieve your Page ID and generate a **Never-Expiring Page Access Token** from your Meta app's Graph Explorer.
5. Paste these credentials into the **Settings Panel** of MalPoster to enable immediate live posting.
