# Garden Guard App

Garden Guard is a static HTML/CSS/JavaScript frontend hosted by Firebase and a
separate Flask API that reads Firestore data.

## Structure

- `public/` - deployable frontend files
- `backend/Backend/` - Flask and Firestore API repository
- `firebase.json` - Firebase Hosting configuration
- `.github/workflows/` - Firebase Hosting preview and production deployments

## Frontend

The frontend connects to the local Garden Guard API at
`http://localhost:5000` by default. Routes are centralized in
`public/api.js`, including collection and document-detail methods for events,
motion, and soil moisture.

For a deployed backend, set the API origin before loading `public/index.html`:

```html
<script>
	window.GARDEN_GUARD_API_BASE_URL = "https://your-api.example.com";
</script>
<script src="api.js"></script>
```

Alternatively, set `garden-guard-api-base-url` in local storage. With no API
base URL or backend available, the dashboard remains usable and shows empty
connection states instead of failing to load.

## Local Development

Start the backend from `backend/Backend/`:

```bash
source .venv/bin/activate
python app.py
```

Serve the frontend from the project root with any static file server. For
Firebase Hosting emulation, run:

```bash
firebase emulators:start --only hosting
```

Deploy the frontend with:

```bash
firebase deploy --only hosting
```