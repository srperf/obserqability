# Automations with observability

This example shows how a small Selenium run can **push pass/fail signals into InfluxDB** using the same plain HTTP write path as the rest of the repo. The idea is: your functional checks stay simple; **observability is just another side effect** of each assertion (success or failure, plus a short error message when it fails).

## What the script does

[`selenium_script_o11y.js`](./selenium_script_o11y.js) runs **two** checks against a site that is **already running**:

1. **Navigation** — open the home page, follow **Go to About Page**, and confirm the URL contains `/about`. Reports to Influx as action `nav_about`.
2. **Content** — open the home page and confirm the main `h1` contains `Welcome`. Reports as `home_h1`.

Each check calls `sendToInflux` from [`../../resources/instrument/instrument.js`](../../resources/instrument/instrument.js): measurement `selenium_smoke`, **tag** `action=<name>`, **fields** `status` (1 = pass, 0 = fail), `metric`, and `error_message` on failure. That matches the InfluxDB v1 line protocol setup used in [first steps](../01_first_steps/README.md).

## Before you run

- **InfluxDB 1.x** listening on `localhost:8086` with database `ObserQAbility` (as in `sendToInflux`). If Influx is down, the script still finishes; writes will log errors.
- **Chrome** installed; `selenium-webdriver` will use the Selenium Manager flow to obtain a matching driver.
- **Test app** from [`../../resources/testedSW/webpage.js`](../../resources/testedSW/webpage.js) (default `http://localhost:4000`). Start it in another terminal, for example:  
  `node ../../resources/testedSW/webpage.js`

## Run the automation

`package.json` is not checked into this repo (only the script and this README are). From this directory, set up a tiny local project once, then run:

```bash
npm init -y
npm pkg set type=module
npm install selenium-webdriver
node selenium_script_o11y.js
```

If the app runs elsewhere, set **`BASE_URL`** (for example `BASE_URL=http://127.0.0.1:4000`).

## After the run

In Grafana (or any tool pointed at the same Influx DB), you can chart or alert on `selenium_smoke` and the `action` tag over time—so you see **when** checks started failing, not only the last CI log line.
