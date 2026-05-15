# Performance and observability

Performance data from your app, your users, and your test tools can all land in the **same observability store**. This example is intentionally small: one instrumented site plus one **k6** load script, both writing timings you can chart in Grafana.

## Performance from the website

[`webpage.js`](./webpage.js) uses [`sendToInflux`](../../resources/instrument/instrument.js) in two simple ways (measurement **`perf_site`**):

| When | What is measured | Example `action` | `error_message` hint |
|------|------------------|------------------|----------------------|
| Server finishes building a page | Time from request to HTML sent (includes the demo’s random 0.5–3s delay) | `serve_home`, `serve_result`, `serve_about` | `server_ms` |
| Browser finishes a **postback** (form, link, back home) | Round-trip from click until the next page runs the timing script | `postback_form`, `postback_about`, `postback_home`, … | `browser_ms` |

The browser calls `/perf/report`; the server forwards to Influx. That is the same pattern as [RUM](../06_RUM/README.md), but here we only focus on **response time**, not every click.

## Performance from k6

[`k6script.js`](./k6script.js) hits the same postback URLs (`/`, `/result`, `/about`), then **waits 5 seconds** before the next loop. You do **not** need to import `sendToInflux` in k6—k6 can push its own HTTP metrics to Influx when you use the built-in output.

From this folder, with the site already running on port **4000** and InfluxDB **1.x** on `localhost:8086` with database **`ObserQAbility`**:

```bash
k6 run --vus 1 --duration 30s --out influxdb=http://localhost:8086/ObserQAbility k6script.js
```

That runs **one virtual user** for **30 seconds**. k6 stores metrics under its own series names (for example `http_req_duration`); your site stores `perf_site`—compare them in Grafana.

Optional base URL:

```bash
k6 run --vus 1 --duration 30s -e BASE_URL=http://127.0.0.1:4000 --out influxdb=http://localhost:8086/ObserQAbility k6script.js
```

## Run the demo

**Terminal 1** — instrumented site:

```bash
node webpage.js
```

**Terminal 2** — k6 (after installing [k6](https://k6.io/docs/get-started/installation/)):

```bash
k6 run --vus 1 --duration 30s --out influxdb=http://localhost:8086/ObserQAbility k6script.js
```

**Optional** — use the site in a browser: submit the form or follow **Go to About** and watch `perf_site` points with `browser_ms` vs `server_ms`.

## What you should see

- **`perf_site`** from the app: server time per page and browser time per postback (often **higher** on the browser side because it includes network and rendering).
- **k6 metrics** in the same Influx database: automation-side HTTP duration—useful to spot slowness that only shows up under load or from outside the server.

This is only a sample. You could add Web Vitals, API timings, or Selenium durations the same way—anything you can measure and name.
