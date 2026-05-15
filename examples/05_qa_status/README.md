# Observe your automations

Another thing we can do with observability and QA is watch **whether your automation itself is healthy**—not only whether a test “passed” or “failed,” but whether the script **broke** while running (exceptions, missing buttons after a UI change, timeouts, and so on). That helps you see **where** and **when** something went wrong, so you can fix it faster.

## What the script does

[`selenium_problems_o11y.js`](./selenium_problems_o11y.js) is a short Selenium run (same site as the other examples) that uses [`sendToInflux`](../../resources/instrument/instrument.js) to report **automation health**, not test pass/fail:

- If a step throws, it sends **`status=0`** to measurement `selenium_health`, with the **step name** (for example `go_to_about`) and a short **problem type** in `error_message`:
  - **`missing_element`** — control not found (often after a UI change)
  - **`timeout`** — page or element did not appear in time
  - **`exception`** — any other runtime error
- If the run finishes without problems, it sends **`automation_ok`** with **`status=1`**.

## Before you run

- **InfluxDB 1.x** on `localhost:8086`, database `ObserQAbility`.
- **Chrome** installed.
- **Test site** already running (default `http://localhost:4000`):  
  `node ../../resources/testedSW/webpage.js`

## Run

From this folder (same local setup as [example 03](../03_automations_o11y/README.md)—`package.json` is not in git):

```bash
npm init -y
npm pkg set type=module
npm install selenium-webdriver
node selenium_problems_o11y.js
```

Optional: `BASE_URL=http://127.0.0.1:4000 node selenium_problems_o11y.js`

To **see a problem on purpose**, rename or remove the “Go to About Page” link in the app, then run again—you should get `missing_element @ go_to_about` in Influx/Grafana.

## Benefits

You and your team can be alerted when a script **stops working**, with a hint of **which step** and **what kind of issue** it was—instead of digging through long logs with no starting point.
