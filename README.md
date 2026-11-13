# CineVerse

A full-stack movie discovery and watchlist app built with the **MERN stack**. Browse real movie data from TMDB, search with live suggestions, watch trailers, build a personal watchlist and favorites, and rate and review films.

<!--
SCREENSHOTS: take a few screenshots of the running app, put them in docs/screenshots/,
then remove the comment markers so the images show up on GitHub.

| Home | Movie details |
| --- | --- |
| ![Home](docs/screenshots/home.png) | ![Details](docs/screenshots/details.png) |
| Explore | Dashboard |
| ![Explore](docs/screenshots/explore.png) | ![Dashboard](docs/screenshots/dashboard.png) |
-->

## Screenshots

Add your screenshots to `docs/screenshots/` (see the comment at the top of this file for the markdown to uncomment).

## Features

- **Home:** rotating cinematic hero, genre shortcuts, and horizontally scrolling rows for Trending, Popular, Top Rated, Upcoming and Now Playing, each with a "View all" link
- **Explore:** browse everything with genre filters, sort by popularity / rating / release date, curated category tabs, and infinite scroll. Every view lives in the URL, so it is shareable
- **Search:** debounced search-as-you-type with keyboard-navigable suggestions, a full results page, and proper empty and error states
- **Movie details:** poster, backdrop, tagline, overview, runtime, genres, TMDB score, cast and key crew, production companies, YouTube trailer, similar movies, IMDb link
- **Authentication:** register, login, logout, bcrypt-hashed passwords, JWT sessions that survive a refresh, protected routes, form validation on both client and server
- **Watchlist and favorites:** one-click save from any poster, persisted in MongoDB, duplicates prevented
- **Ratings and reviews:** 1-5 star rating with optional text, one review per user per movie, edit and delete your own, community average per movie
- **Dashboard:** profile (editable name), live stats, watchlist, favorites, your reviews and recently viewed movies
- **Polish:** loading skeletons, toasts, Framer Motion transitions, fully responsive layout

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, JavaScript, Tailwind CSS v4, React Router, Axios, Framer Motion, Lucide icons, Context API |
| Backend | Node.js, Express 5, MongoDB with Mongoose, JWT, bcrypt, helmet, express-rate-limit |
| Data | MongoDB Atlas, The Movie Database (TMDB) API |
| Hosting | Render (web service + static site) |

## How it fits together

```
React (Vite)  ──Axios + Bearer JWT──►  Express API  ──►  MongoDB Atlas
                                           │            (users, watchlist, reviews)
                                           └──►  TMDB v3 API (proxied + cached)
```

- The browser **only ever talks to your API**. The TMDB key, JWT secret and database credentials exist only on the server.
- `services/tmdbService.js` is the single place that calls TMDB. It caches responses in memory (5 to 30 minutes) and turns TMDB failures into clean API errors.
- Posters and backdrops load straight from TMDB's image CDN, which needs no key.
- Saved movies store a small snapshot (title, poster, rating), so the dashboard renders without extra TMDB calls.

### Project structure

```
cineverse/
├── backend/
│   ├── config/          env loading + database connection
│   ├── controllers/     request handlers (auth, user, movie, watchlist, review)
│   ├── middleware/      auth (JWT), validation, centralized error handling
│   ├── models/          User, Watchlist, Review
│   ├── routes/          one router per resource
│   ├── services/        tmdbService (TMDB proxy + cache), reviewService (aggregates)
│   ├── utils/           AppError, asyncHandler, cache, validators, token helper
│   ├── app.js           Express app (CORS, security headers, routes)
│   └── server.js        loads env, connects to MongoDB, starts listening
├── frontend/
│   └── src/
│       ├── components/  Navbar, MovieCard, MovieCarousel, HeroBanner, SearchBar, ...
│       ├── context/     Auth, Watchlist, Toast providers
│       ├── hooks/       useAsync, useInfiniteMovies, useDebounce, useGenres, ...
│       ├── layouts/     MainLayout, AuthLayout
│       ├── pages/       Home, Explore, MovieDetails, Dashboard, Login, Register
│       ├── services/    Axios client + one service per API area
│       └── utils/       constants, formatters, validators, image helper
└── render.yaml          Render blueprint for one-click deployment
```

## Getting started (Windows PowerShell)

### Prerequisites

- [Node.js](https://nodejs.org) 18 or newer (check with `node -v`)
- [Git](https://git-scm.com)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- A free [TMDB](https://www.themoviedb.org) account

### 1. Get a TMDB API key

1. Sign up at <https://www.themoviedb.org/signup> and confirm your email.
2. Open **Settings → API** (<https://www.themoviedb.org/settings/api>) and request an API key (choose "Developer", personal use).
3. Copy the **API Key** (32 characters). The long **API Read Access Token** also works. Either one goes into `TMDB_API_KEY`.

### 2. Create a MongoDB Atlas database

1. In Atlas, create a free **M0** cluster.
2. **Database Access → Add New Database User.** Pick a username and password and give it "Read and write to any database". Avoid special characters in the password, or URL-encode them.
3. **Network Access → Add IP Address.** Use **Allow access from anywhere** (`0.0.0.0/0`). Render's IP addresses change, so this is the simplest option for a portfolio project.
4. **Database → Connect → Drivers.** Copy the connection string and replace `<password>`. Add the database name `cineverse` before the `?`:

   ```
   mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/cineverse?retryWrites=true&w=majority
   ```

### 3. Backend

```powershell
cd cineverse\backend
npm install
Copy-Item .env.example .env
notepad .env
```

Fill in `.env`:

| Variable | Value |
| --- | --- |
| `PORT` | `5000` |
| `MONGO_URI` | your Atlas connection string |
| `JWT_SECRET` | a long random string. Generate one with the command below |
| `TMDB_API_KEY` | your TMDB key |
| `CLIENT_URL` | `http://localhost:5173` |

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm run dev
```

You should see `MongoDB connected` and `CineVerse API running on port 5000`. Check <http://localhost:5000/api/health>.

### 4. Frontend

Open a second PowerShell window:

```powershell
cd cineverse\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open <http://localhost:5173>. The defaults in `.env.example` already point at the local API.

### Production build (optional check)

```powershell
cd cineverse\frontend
npm run build
npm run preview
```

## Environment variables

**backend/.env**

| Name | Description |
| --- | --- |
| `PORT` | Port the API listens on (Render sets this for you) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign login tokens |
| `TMDB_API_KEY` | TMDB v3 API key or v4 read access token |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS, comma separated, no trailing slash |

**frontend/.env**

| Name | Description |
| --- | --- |
| `VITE_API_URL` | API base URL including `/api`, for example `http://localhost:5000/api` |
| `VITE_TMDB_IMAGE_BASE_URL` | TMDB image CDN, `https://image.tmdb.org/t/p` |

Vite bakes `VITE_*` values into the build, so after changing them you need to rebuild or restart the dev server. Never put secrets in `VITE_*` variables, because they are public.

## API documentation

Base URL: `/api`. Errors always look like `{ "success": false, "message": "...", "details"?: [...] }`.
Routes marked 🔒 need the header `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Body | Response |
| --- | --- | --- | --- |
| POST | `/auth/register` | `{ name, email, password }` | `201 { user, token }` |
| POST | `/auth/login` | `{ email, password }` | `200 { user, token }` |
| GET 🔒 | `/auth/me` | | `{ user }` |

Passwords need at least 8 characters with a letter and a number. Registering with an existing email returns `409`. Login failures return `401` with the same message for a wrong email and a wrong password.

### Users

| Method | Endpoint | Body | Response |
| --- | --- | --- | --- |
| GET 🔒 | `/users/profile` | | `{ user, stats: { watchlist, favorites, reviews, averageRating } }` |
| PUT 🔒 | `/users/profile` | `{ name }` | `{ user }` |
| POST 🔒 | `/users/recently-viewed` | `{ movieId, title, posterPath }` | `204` |

### Movies (TMDB proxy)

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/movies/category/:category?page=` | `trending`, `popular`, `top_rated`, `upcoming`, `now_playing` |
| GET | `/movies/genres` | `{ genres: [{ id, name }] }` |
| GET | `/movies/discover?page=&genre=&sort=` | `sort`: `popularity.desc`, `vote_average.desc`, `primary_release_date.desc` |
| GET | `/movies/search?q=&page=` | Full search results |
| GET | `/movies/suggestions?q=` | Up to 6 results for the search dropdown |
| GET | `/movies/:id` | Details plus `cast`, `crew`, `trailer` and `similar` |

### Watchlist and favorites 🔒

| Method | Endpoint | Body / query | Response |
| --- | --- | --- | --- |
| GET | `/watchlist?listType=` | `listType` optional: `watchlist` or `favorites` | `{ items }` |
| POST | `/watchlist` | `{ movieId, listType, title, posterPath, releaseDate, voteAverage }` | `201 { item }`, or `409` if already saved |
| DELETE | `/watchlist/:movieId?listType=` | | `{ movieId, listType }`, or `404` |

### Reviews and ratings

| Method | Endpoint | Body | Response |
| --- | --- | --- | --- |
| GET | `/reviews/movie/:movieId?page=` | | `{ reviews, stats: { average, count }, page, totalPages }` |
| GET 🔒 | `/reviews/movie/:movieId/mine` | | `{ review }` (`null` if none) |
| GET 🔒 | `/reviews/mine` | | `{ reviews }` |
| POST 🔒 | `/reviews` | `{ movieId, movieTitle, moviePosterPath, rating (1-5), content? }` | `201 { review }`, or `409` if already reviewed |
| PUT 🔒 | `/reviews/:id` | `{ rating, content? }` | `{ review }` (`403` if not yours) |
| DELETE 🔒 | `/reviews/:id` | | `{ id }` (`403` if not yours) |

## Deployment on Render

You will deploy two things: the API (web service) and the site (static site). The repository includes a `render.yaml` blueprint that creates both.

### 1. Push to GitHub

```powershell
cd cineverse
git init
git add .
git commit -m "Initial commit: CineVerse"
git branch -M main
```

Create an empty repository on GitHub (no README), then:

```powershell
git remote add origin https://github.com/<your-username>/cineverse.git
git push -u origin main
```

`.gitignore` already keeps `node_modules` and `.env` out of the repo. Double-check with `git status` that no `.env` file is staged.

### 2. Deploy with the blueprint

1. On [render.com](https://render.com): **New → Blueprint**, then select your repository.
2. Render reads `render.yaml` and asks for the values marked as secret:
   - `cineverse-api`: `MONGO_URI`, `TMDB_API_KEY`, and `CLIENT_URL` (you can put a placeholder for now). `JWT_SECRET` is generated automatically.
   - `cineverse-web`: `VITE_API_URL`, again a placeholder for now.
3. Click **Apply** and wait for both services to build.

### 3. Connect the two services

1. Copy the API URL (for example `https://cineverse-api.onrender.com`) and the site URL (for example `https://cineverse-web.onrender.com`).
2. On **cineverse-web → Environment**, set `VITE_API_URL` to `https://cineverse-api.onrender.com/api`, then **Manual Deploy → Clear build cache & deploy**. This step is needed because Vite embeds the value at build time.
3. On **cineverse-api → Environment**, set `CLIENT_URL` to the site URL (no trailing slash). Render restarts the API. Several origins can be given, comma separated.
4. Visit the site URL.

### Manual setup (without the blueprint)

- **Web Service:** root directory `backend`, build `npm install`, start `npm start`, health check path `/api/health`, plus the five environment variables above.
- **Static Site:** root directory `frontend`, build `npm install && npm run build`, publish directory `dist`, the two `VITE_*` variables, and a **Rewrite** rule `/*` → `/index.html` under *Redirects/Rewrites* so deep links like `/movie/123` work after a refresh.

> The free Render web service sleeps after about 15 minutes of inactivity, so the first request after a pause can take up to a minute. Open the site before a demo to wake it up.

## Design decisions (useful for interviews)

- **TMDB behind a backend proxy** keeps the API key private, allows caching and rate-limit protection, and lets the API return exactly the shape the UI needs (for example one call for details, cast, trailer and similar movies).
- **Ratings merged into reviews.** A rating without text is just a review with an empty body, so there is one model, one unique index (`user + movieId`), and simple aggregates for the community average.
- **One `Watchlist` collection with a `listType`** powers both watchlist and favorites. A compound unique index guarantees no duplicates even under concurrent requests.
- **Stateless JWT auth** stored in `localStorage` and sent as a Bearer token. That works across two Render domains without cross-site cookie configuration. The trade-off is exposure to XSS, which React's escaping and the `helmet` headers help mitigate. httpOnly cookies are the stricter alternative.
- **Centralized error handling:** controllers throw `AppError`; one middleware maps those, Mongoose validation errors, bad ids and duplicate keys to consistent JSON and correct status codes, and hides internals in production.
- **URL as state on the Explore page** (`?q=`, `?category=`, `?genre=`, `?sort=`) makes every view linkable and keeps the back button working.
- **Stale-response protection** in `useAsync` and `useInfiniteMovies` prevents a slow response from overwriting newer results.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Missing required environment variables` | `backend/.env` is missing or a value is empty |
| `MongoDB connection failed` | Check the password in `MONGO_URI` and that Atlas Network Access allows your IP |
| `TMDB rejected the API key` (502) | Check `TMDB_API_KEY`; new keys can take a few minutes to activate |
| Browser shows a CORS error | `CLIENT_URL` must exactly match the frontend origin (scheme, host, port, no trailing slash) |
| Refreshing `/movie/123` gives 404 in production | Add the rewrite rule `/*` → `/index.html` on the static site |
| Frontend still calls `localhost` in production | Set `VITE_API_URL` and redeploy with a cleared build cache |

## Credits

Movie data and images are provided by [TMDB](https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB.
