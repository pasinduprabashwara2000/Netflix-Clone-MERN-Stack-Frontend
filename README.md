<img width="1366" height="730" alt="Screenshot from 2026-11-17 09-00-52" src="https://github.com/user-attachments/assets/e0a9f526-6d97-4de7-b2e9-d394b0680a5e" />
<img width="1366" height="730" alt="Screenshot from 2026-11-17 09-00-57" src="https://github.com/user-attachments/assets/047c1f2c-231a-4d05-88fe-72ffb61af812" />
<img width="1366" height="730" alt="Screenshot from 2026-11-17 09-01-55" src="https://github.com/user-attachments/assets/b45c12a9-47bc-4b05-aa1d-c696b9eedf60" />

# Hotflix

A Netflix-style streaming platform with a viewer app, an admin panel, Stripe subscriptions and AI features (semantic search, personalised recommendations, a chat assistant and admin analytics).

The project is split into two parts:

| Part | Folder | Stack | Default host |
| --- | --- | --- | --- |
| **Backend API** | `backend/` | Node.js, Express 5, TypeScript, MongoDB (Mongoose 9), JWT, Stripe, OpenAI | Netlify Functions |
| **Frontend** | `frontend/` | React 19, TypeScript, Vite, Tailwind CSS 4, Axios | Vercel |

---

## Features

### Viewer app (`/`)
- Sign up / log in with JWT authentication
- Netflix-style multiple **profiles** per account, including **Kids** profiles
- Browse movies and series, featured hero banner, content rows, title details with seasons, episodes and similar titles
- Video player, trailer page and episode list
- Keyword search and **AI natural-language search** (for example "funny space movies")
- **Picked for you** recommendations based on each profile's watch history
- **AI chat assistant** that recommends titles from the real catalog
- Watch history per profile (re-watching moves a title to the top)
- Account page: profile, plan, history and security (change password) tabs
- Paid plans through **Stripe Checkout**

### Admin panel (`/admin`)
- Dashboard with watch analytics (views, active profiles, top titles, top genres) and an optional AI-written summary
- CRUD for users, profiles, plans, subscriptions, genres, content, seasons and episodes
- One-click **AI reindex** of the catalog
- The "Admin Panel" link in the viewer navbar is shown only to accounts with the `Admin` role

### AI features
- **Embeddings** (`text-embedding-3-small` by default) are generated per title and stored on the `Content` document. A hash of the text means only new or edited titles are re-embedded.
- **Semantic search** ranks titles by cosine similarity to the query embedding.
- **Recommendations** build a taste vector from the last 30 watched titles (newer watches weigh more), exclude already-watched titles and add a small bonus for well-rated ones. New profiles get featured and top-rated titles.
- **Chat assistant** (`gpt-4o-mini` by default) retrieves the 15 closest titles first, then lets the model choose from that list only. Replies are JSON, limited to 4 titles, and the system prompt treats user text as a request rather than instructions.
- **Kids profiles** only ever see kid-safe maturity ratings (G, PG, TV-Y, TV-Y7, TV-Y7-FV, TV-G, TV-PG) in every AI feature.
- AI routes are rate limited to **30 requests per user per minute** (in-memory limiter).

---

## Architecture

```
┌──────────────────────┐      HTTPS / JSON       ┌─────────────────────────────┐
│  Frontend (Vercel)   │ ──────────────────────► │  Backend (Netlify Function) │
│  React + Vite        │   Authorization: Bearer │  Express app via            │
│  "/"      viewer app │                         │  serverless-http            │
│  "/admin" admin panel│                         └──────┬───────────┬──────────┘
└──────────────────────┘                                │           │
                                                        ▼           ▼
                                               MongoDB Atlas    OpenAI / Stripe
```

- `frontend/src/main.tsx` picks the app from the URL path: `/admin` loads the admin panel, everything else loads the viewer app.
- The viewer app uses a small hash router (`#/title/:id`, `#/watch/:id/:episodeId`, `#/account/plan`, and so on), so deep links work on a static host.
- In production, `netlify/functions/api.ts` wraps the Express app with `serverless-http`, caches the MongoDB connection between warm invocations, and returns a helpful `503` with a hint when the database is unreachable.

---

## Project structure

### Backend

```
backend/
├── netlify/functions/api.ts    # Serverless entry (wraps the Express app)
├── netlify.toml                # Routes /api/* to the function
├── public/index.html           # Placeholder page for the API host
├── src/
│   ├── app.ts                  # Express app and route mounting
│   ├── server.ts               # Local server entry (npm run dev / start)
│   ├── seed-all.ts             # Seeds all 8 collections
│   ├── config/                 # cors.ts, db.ts, openai.ts
│   ├── middleware/             # AuthMiddleware (JWT), RateLimit
│   ├── models/                 # User, Profile, Plan, Subscription, Genre,
│   │                           # Content, Season, Episode, WatchHistory
│   ├── controller/             # Request handlers
│   ├── routes/                 # Route definitions
│   ├── services/               # AiService, AiInsightsService
│   └── scripts/indexAi.ts      # npm run ai:index
├── package.json
└── tsconfig.json
```

### Frontend

```
frontend/
├── public/                     # favicon and icons
├── src/
│   ├── main.tsx                # Chooses viewer app or admin panel
│   ├── App.tsx                 # Admin panel shell and navigation
│   ├── config.ts               # API_URL from VITE_API_URL
│   ├── services/api.ts         # Types and generic CRUD helpers
│   ├── user/                   # Viewer app
│   │   ├── UserApp.tsx, router.ts, auth.ts, accountApi.ts
│   │   ├── pages/              # Welcome, Signup, Login, Profiles, Home, Search,
│   │   │                       # TitleDetails, Watch, Trailer, Account, PlanTab
│   │   └── components/         # Navbar, Hero, ContentRow, ContentCard, SearchBar,
│   │                           # EpisodeList, VideoPlayer, AiChat, SafeImage, TitleGrid
│   ├── features/               # Admin modules
│   │   ├── dashboard/          # Dashboard, AiInsights
│   │   ├── accounts/           # UserManagement, ProfileManagement
│   │   ├── billing/            # PlanManagement, SubscriptionManagement
│   │   └── catalog/            # Genre, Content, Season, Episode management
│   ├── components/common/      # Tabs, Pagination, ImageUrlInput
│   ├── alerts/                 # Alert provider and context
│   ├── hooks/usePagination.ts
│   └── lib/                    # ui.ts, media.ts
├── vercel.json                 # SPA rewrite to index.html
├── vite.config.ts
└── package.json
```

---

## Getting started

### Prerequisites
- Node.js 20 or newer and npm
- A MongoDB database (local, or a free MongoDB Atlas cluster)
- Optional: an OpenAI API key (AI features) and a Stripe account in test mode (payments)

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
# Required
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/hotflix
JWT_SECRET=use-a-long-random-string

# Allowed frontend origin(s), comma separated, no trailing slash
CLIENT_URL=http://localhost:5173

# Optional
PORT=5000

# AI features (the server still starts without these; AI routes return 503)
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Payments (use a test key: sk_test_...)
STRIPE_SECRET_KEY=sk_test_...
```

Seed the database, then start the server:

```bash
npx tsx src/seed-all.ts          # upsert seed data (safe to run repeatedly)
npm run dev                      # http://localhost:5000
```

Build the AI index once so search works for the first visitor:

```bash
npm run ai:index
```

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev                      # http://localhost:5173
```

- Viewer app: <http://localhost:5173/>
- Admin panel: <http://localhost:5173/admin>

---

## Seed data

`src/seed-all.ts` fills all 8 collections: 2 users, 3 profiles, 4 plans, 2 subscriptions, 14 genres, 41 titles (25 movies and 16 K-dramas), 21 seasons and 278 episodes.

| Command | What it does |
| --- | --- |
| `npx tsx src/seed-all.ts` | Upserts data, no duplicates |
| `npx tsx src/seed-all.ts --fresh` | Deletes all 8 collections first, then inserts |
| `npx tsx src/seed-all.ts --dry` | Prints counts only, no database connection |

Demo logins (change or remove them before any real deployment):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@hotflix.test` | `Admin@123` |
| User | `user@hotflix.test` | `User@123` |

Posters and banners are placeholders, the video is a public sample and trailers are YouTube search links. Replace them from the admin panel.

---

## Scripts

### Backend

| Script | Description |
| --- | --- |
| `npm run dev` | Start the API with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server (`node dist/server.js`) |
| `npm run ai:index` | Generate embeddings for all titles |

### Frontend

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

---

## Environment variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs (HS256) |
| `CLIENT_URL` | Recommended | Allowed CORS origin(s), comma separated. Defaults to `http://localhost:5173`. The first origin is used for Stripe redirects |
| `PORT` | No | Local server port, default `5000` |
| `OPENAI_API_KEY` | For AI | Enables embeddings, AI search, recommendations, chat and summaries |
| `OPENAI_CHAT_MODEL` | No | Default `gpt-4o-mini` |
| `OPENAI_EMBEDDING_MODEL` | No | Default `text-embedding-3-small` |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key |

### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes in production | Backend base URL including `/api`. Defaults to `http://localhost:5000/api` |

---

## API reference

Base URL: `/api`. Routes marked 🔒 need an `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Create an account (`name`, `email`, `password` of 8+ characters) |
| POST | `/auth/login` | Log in and receive a JWT |
| GET | `/auth/me` 🔒 | Current user, including role |
| PUT | `/auth/change-password` 🔒 | Change password (`currentPassword`, `newPassword`) |

### Profiles, history and subscriptions

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/profile/mine` 🔒 | List the signed-in user's profiles |
| POST | `/profile/mine` 🔒 | Create a profile |
| PUT | `/profile/mine/:id` 🔒 | Update own profile |
| DELETE | `/profile/mine/:id` 🔒 | Delete own profile |
| GET | `/history?profileId=` 🔒 | Watch history of a profile |
| POST | `/history` 🔒 | Add or bump a title (`profileId`, `contentId`, `episodeId?`) |
| DELETE | `/history/:id` 🔒 | Remove one history entry |
| DELETE | `/history?profileId=` 🔒 | Clear a profile's history |
| GET | `/subscription/me` 🔒 | Current subscription with its plan (`null` if none) |
| POST | `/subscription/me/checkout` 🔒 | Start Stripe Checkout (`planId`), returns `{ url }` |
| POST | `/subscription/me/confirm` 🔒 | Verify the Stripe session and activate the plan (`sessionId`) |

### AI 🔒 (30 requests per user per minute)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/ai/recommendations?profileId=` | Personalised "Picked for you" titles |
| GET | `/ai/search?q=&profileId=` | Natural-language search |
| POST | `/ai/chat` | Chat assistant (`profileId`, `message`, `history?`) |
| GET | `/ai/insights[?summary=1]` | Watch analytics with an optional AI summary. Admin only |
| POST | `/ai/reindex` | Rebuild every title's embedding. Admin only |

### Catalog and admin CRUD

| Resource | Endpoints |
| --- | --- |
| Content | `GET /content` (supports `?search=`), `GET /content/:id/details`, `POST /content`, `PUT /content/:id`, `DELETE /content/:id` |
| Genre | `GET /genre`, `POST /genre`, `PUT /genre/:id`, `DELETE /genre/:id` |
| Season | `GET /season`, `POST /season`, `PUT /season/:id`, `DELETE /season/:id` |
| Episode | `GET /episode`, `POST /episode`, `PUT /episode/:id`, `DELETE /episode/:id` |
| Plan | `GET /plan`, `POST /plan`, `PUT /plan/:id` |
| User | `GET /user`, `POST /user`, `PUT /user/:id` |
| Subscription | `GET /subscription`, `PUT /subscription/:id` |
| Profile | `GET /profile` |

Health check: `GET /api` returns `{ "message": "Netflix Clone API is running" }`.

---

## Data model

| Collection | Key fields |
| --- | --- |
| `User` | `name`, `email` (unique), `hashedPassword`, `role` (`Admin` or `User`), `isActive` |
| `Profile` | `userId`, `name`, `avatarUrl`, `isKids`, `language`, `maturityLevel` |
| `Plan` | `name`, `price`, `maxStreams`, `videoQuality` |
| `Subscription` | `userId`, `planId`, `status`, `startDate`, `endDate`, `paymentRef` |
| `Genre` | `name`, `description` |
| `Content` | `title`, `description`, `type`, `genreId`, `releaseYear`, `maturityRating`, `durationMins`, `posterUrl`, `bannerUrl`, `trailer`, `videoUrl`, `isFeatured`, `avgRating`, plus hidden `embedding` and `embeddingHash` |
| `Season` | `contentId`, `seasonNumber`, `title`, `releaseYear` |
| `Episode` | `seasonId`, `episodeNumber`, `title`, `description`, `durationMinis`, `videoUrl`, `thumbnailUrl` |
| `WatchHistory` | `profileId`, `contentId`, `episodeId?`, `watchedAt` (unique per profile and title) |

---

## Payments (Stripe)

1. The viewer picks a plan on **Account → Plan**.
2. The backend creates a Stripe Checkout session. The price always comes from the database, never from the client.
3. After payment Stripe redirects to `<CLIENT_URL>/?session_id=...#/account/plan`.
4. The frontend calls `/subscription/me/confirm`. The backend verifies the session is paid and belongs to the user, then activates a one-month subscription. Refreshing the page does not extend it twice.
5. An active subscription past its end date is marked `Expired` the next time it is loaded.

Use Stripe test mode and the test card `4242 4242 4242 4242` with any future expiry and any CVC.

---

## Deployment

### Backend on Netlify
1. Create a Netlify site from the `backend` folder. `netlify.toml` already sets the functions directory and redirects `/api/*` to the Express function.
2. Add the environment variables listed above in **Site configuration → Environment variables**, then redeploy.
3. In MongoDB Atlas **Network Access**, allow the function to connect (for example `0.0.0.0/0`).
4. Set `CLIENT_URL` to your frontend URL (no trailing slash).
5. Seed the database and run `npm run ai:index` once from your machine against the same `MONGO_URI`.

If the database is unreachable the API answers `503` with a hint, such as a wrong username or password, a malformed URI or Atlas blocking the connection.

### Frontend on Vercel
1. Import the `frontend` folder as a Vite project.
2. Set `VITE_API_URL` to `https://<your-backend-site>/api`.
3. `vercel.json` rewrites every path to `index.html`, so `/admin` works on refresh.

---

## Known limitations

These are worth fixing before using the project in production:

- **Admin CRUD routes are not protected on the backend.** Only the AI insights and reindex routes check the `Admin` role. Routes such as `/user`, `/plan`, `/subscription`, `/content`, `/genre`, `/season` and `/episode` do not require a token. Add `protect` plus an admin check to them.
- **`/admin` has no login guard in the frontend.** The link is hidden from non-admins, but the page itself is reachable by URL.
- `/user` and `/subscription` list endpoints return full documents, which includes `hashedPassword` for users.
- The JWT is stored in `localStorage`.
- The AI rate limiter is in-memory, so on serverless hosting it is per function instance, not global.
- Demo seed credentials are public.

---

## Tech stack

**Backend:** Node.js, Express 5, TypeScript, Mongoose 9, jsonwebtoken, bcryptjs, cors, Stripe, OpenAI SDK, serverless-http, tsx

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Axios, ESLint

---

## Author

**Pasindu Prabashwara**
