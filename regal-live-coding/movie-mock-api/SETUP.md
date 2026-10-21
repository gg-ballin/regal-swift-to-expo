# Local Movie API — Setup Instructions

Follow the steps below to get the API server running before you start the exercise.

---

## Prerequisites

You need **Node.js version 18 or later**.

To check whether it is already installed, open a terminal and run:

```
node --version
```

If the command is not found, or the version is below 18, download and install Node.js from:
**https://nodejs.org** (choose the LTS release)

---

## Step 1 — Start the server

Open a terminal, navigate to the extracted folder, and run:

```bash
cd movie-mock-api
npx json-server db.json --port 3001
```

`npx` downloads `json-server` automatically — no separate install step is needed.
The first run may take a few seconds to download the package.

You should see output similar to:

```
  \{^_^}/ hi!

  Loading db.json
  Done

  Resources
  http://localhost:3001/movies

  Home
  http://localhost:3001
```

**Leave this terminal open** for the duration of the exercise. The server must keep running while you work.

---

## Step 2 — Verify it is working

Open a second terminal (or your browser) and run one of the following:

```bash
# Fetch all movies
curl "http://localhost:3001/movies"

# Filter by release date range (adjust dates as needed)
curl "http://localhost:3001/movies?primary_release_date_gte=2026-03-11&primary_release_date_lte=2026-03-25"
```

Or just open **http://localhost:3001/movies** in your browser.

You should receive a JSON array of movie objects.

---

## API reference

**Base URL:** `http://localhost:3001`

| What | Example |
|---|---|
| All movies | `GET /movies` |
| Filter by date range | `GET /movies?primary_release_date_gte=YYYY-MM-DD&primary_release_date_lte=YYYY-MM-DD` |
| Single movie by ID | `GET /movies/23` |
| Poster image | `GET /images/23.png` |

**Date filter operators:** append `_gte` (≥) or `_lte` (≤) to any field name.

**Movie object shape:**
```json
{
  "id": 23,
  "title": "Project Hail Mary",
  "primary_release_date": "2026-03-20",
  "poster_path": "/images/23.png",
  "overview": "An astronaut wakes up alone on a spacecraft with no memory of who he is or how he got there…",
  "vote_average": 8.4,
  "backdrop_path": "/images/backdrop_23.jpg",
  "genres": ["Science Fiction", "Adventure", "Drama"],
  "director": "Phil Lord, Christopher Miller",
  "cast": ["Ryan Gosling", "Sandra Huller", "Milana Vayntrub"],
  "runtime": 156,
  "rating": "PG-13",
  "tagline": "Alone in space. Earth's last chance.",
  "plot_summary": "Astronaut Ryland Grace wakes up millions of miles from Earth…"
}
```

| Field | Type | Description |
|---|---|---|
| `id` | number | Unique movie identifier |
| `title` | string | Movie title |
| `primary_release_date` | string | Release date (`YYYY-MM-DD`) |
| `poster_path` | string | Relative URL for the poster image |
| `overview` | string | Short synopsis |
| `vote_average` | number | Average user rating (0–10) |
| `backdrop_path` | string | Relative URL for a wider backdrop image |
| `genres` | string[] | Genre names (e.g. `"Action"`, `"Comedy"`) |
| `director` | string | Director name(s) |
| `cast` | string[] | Top-billed cast members |
| `runtime` | number | Runtime in minutes |
| `rating` | string | MPAA rating (e.g. `"PG-13"`, `"R"`) |
| `tagline` | string | Short marketing tagline |
| `plot_summary` | string | Full plot summary for a details page |

To construct an image URL, prepend the base URL to `poster_path` or `backdrop_path`:
```
http://localhost:3001/images/23.png
http://localhost:3001/images/backdrop_23.jpg
```

---

## Troubleshooting

**Port 3001 is already in use**

Change the port number:
```bash
npx json-server db.json --port 3002
```
Then update your app's base URL to match.

**`npx` is not found**

Install json-server globally instead:
```bash
npm install -g json-server
json-server db.json --port 3001
```

**Permission error on macOS/Linux**

```bash
sudo npm install -g json-server
```
