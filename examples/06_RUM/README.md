# Real user monitoring (RUM)

Observability can show you **what real people do** on your site: which buttons they press, which paths they follow, and how long a **full page change** (a “postback” / navigation) takes to come back. That helps QA and product teams spot confusing flows, slow screens, or places where users might be stuck after a bug.

This example is a **small, manual RUM demo**—not a full product like Datadog RUM, but the same idea: **capture events and timings**, send them to InfluxDB, and view them in Grafana.

## What we instrumented

The demo site is [`webpage.js`](./webpage.js), a copy of the playground app with two kinds of signals, all forwarded through [`sendToInflux`](../../resources/instrument/instrument.js) (measurement **`RUM`**):

| What happened | How it is recorded | Influx `action` (examples) |
|---------------|--------------------|----------------------------|
| User clicks a control (no full reload) | Browser calls `/rum/action` → server → Influx | `basic_button`, `toggle_hidden`, `dropdown_select`, … |
| User navigates to another page (form submit, link, back home) | Browser stores start time, loads new page, calls `/rum/page` with duration → Influx | `form_submit_load`, `about_link_load`, `back_home_load`, … |

- **Clicks:** `status=1`, `metric=0`, `error_message=user_click`
- **Postbacks / navigations:** `status=1`, **`metric`** = round-trip time in **milliseconds** (from click until the next page’s script runs), `error_message=navigation_ms`

The site still uses a random server delay (500–3000 ms), so load times will vary—that is intentional so you can see timing change in charts.

## How it works (simple)

1. The page loads a tiny script that defines `rumClick(action)` and `rumNavigate(action, url)`.
2. **`rumClick`** — fire-and-forget request to the server; you get one point per user action.
3. **`rumNavigate`** — save the action name and `performance.now()`, change `window.location`, then on the **next** page the script sends `/rum/page` with elapsed ms.

The browser cannot call `sendToInflux` directly (it runs in Node), so the pattern is: **browser → this app’s `/rum/...` endpoints → Influx**, same as [QA within](../02_qa_within/README.md).

## Before you run

- **InfluxDB 1.x** on `localhost:8086`, database `ObserQAbility`
- **Node.js** with ESM (if needed, add `"type": "module"` in a local `package.json` in this folder)

## Run and play

From this directory:

```bash
node webpage.js
```

Open `http://localhost:4000`, click around (buttons, form submit, **Go to About Page**, back home). Watch the server console for `✅ Sent …` lines and build a Grafana panel on measurement `RUM` (split by `action`, chart `metric` for `*_load` actions).

## What you could add later

Anything you can name in code: failed validations, rage clicks, API errors, session start/end. The goal here is only to show that **user behavior + load time** can live next to your QA and automation metrics in one place.
