# QA within the application

This example is the mirror image of “automation pushes metrics out”: here, **a check runs inside the product** when someone uses it. The browser performs a small assertion (like a UI test would), then the server **forwards the pass/fail result to InfluxDB** with `sendToInflux`. You can chart those points in Grafana the same way as any other telemetry.

## What is different from the plain test site?

This folder contains a **modified copy** of the playground site: [`webpage.js`](./webpage.js) matches the structure of [`../../resources/testedSW/webpage.js`](../../resources/testedSW/webpage.js) for sections 1–10, plus an extra block at the top:

- **Section 0 — QA demo: frontend text validation**  
  The page compares the real `<h1>` text to an “expected” string you can edit, measures how long that took, updates a small **PASS/FAIL** box in the UI, then calls the backend.

So the “test” is **triggered by user action** (click **Validate & Report**), not by an external runner.

## Flow

1. In the browser, `runFrontendTextValidation()` reads the expected heading from the input, reads the actual `h1`, and sets `status` to **1** (pass) or **0** (fail).
2. It sends a **`GET /qa/report?...`** with `status`, `metric` (duration in ms), and `errorMessage`.
3. The Node server handles [`/qa/report`](./webpage.js) and calls [`sendToInflux`](./instrument.js) with:
   - **measurement:** `QA_Within`
   - **action (tag):** `FrontendTextValidation`
   - **fields:** `status`, `metric`, `error_message`

Instrumentation lives in [`instrument.js`](./instrument.js) (same HTTP line-protocol pattern as [`../../resources/instrument/instrument.js`](../../resources/instrument/instrument.js) and [first steps](../01_first_steps/README.md)): InfluxDB **1.x** on `localhost:8086`, database `ObserQAbility`.

## Before you run

- **InfluxDB 1.x** with database `ObserQAbility` (writes log to the server console if Influx is unreachable).
- **Node.js** with ESM enabled for `.js` in this folder (if `node webpage.js` complains about `import`, add a local `package.json` with `"type": "module"` or run from a parent project that already uses modules).

## Run the demo

From this directory:

```bash
node webpage.js
```

Open `http://localhost:4000`, use section **0** to run a passing check (default expected text matches the `h1`), or change the expected string to force a **fail** and watch the status box and server logs. Each click that completes the flow produces a point in Influx under `QA_Within` / `FrontendTextValidation`.

## Why this is useful

It shows how **product-side QA signals** can be emitted in real time as users (or internal testers) hit flows—without waiting for a nightly Selenium job—while still landing in the same metrics store as the rest of your observability story.
