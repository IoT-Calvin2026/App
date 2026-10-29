# Garden Guard App

The frontend connects to the local Garden Guard API at `http://localhost:5001`
by default. All routes are
centralized in `api.js`, including collection and document-detail methods for
events, motion, and soil moisture.

For a deployed backend, set the API origin before loading `index.html`:

```html
<script>
	window.GARDEN_GUARD_API_BASE_URL = "https://your-api.example.com";
</script>
<script src="api.js"></script>
```

Alternatively, set `garden-guard-api-base-url` in local storage. With no API
base URL or backend available, the dashboard remains usable and shows empty
connection states instead of failing to load.