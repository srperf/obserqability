# ObserQAbility examples

These walkthroughs show practical ways to combine **QA** and **observability (o11y)**. Each folder is a small, hands-on demo—not production tooling, but enough to see the pattern and reuse it in your own stack.

If you think of other ideas, they belong here too; this list is a starting point, not a ceiling.

## What you will use

We keep instrumentation **manual** on purpose (plain `sendToInflux` calls instead of heavy agents or client libraries) so you see what actually gets sent to the database. Later, when you adopt agents or vendor SDKs, you will know what they are doing under the hood.


| Tool                  | Role in these examples                                                 |
| --------------------- | ---------------------------------------------------------------------- |
| **JavaScript / Node** | Demo apps and scripts                                                  |
| **InfluxDB 1.x**      | Time-series storage (**use v1.x—avoid v2 and v3** for these exercises) |
| **Grafana**           | Charts and alerts                                                      |
| **Selenium**          | Browser functional checks                                              |
| **k6**                | Load / HTTP performance checks                                         |


Shared write helper: `[../resources/instrument/instrument.js](../resources/instrument/instrument.js)`

Playground apps (pages and a small API) live under **[Tested software](../resources/testedSW/README.md)**. Several examples use a **copy** of those apps with extra instrumentation in the example folder.

## Suggested order


| #   | Example                                               | One-line idea                                                                     |
| --- | ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | [First steps](./01_first_steps/README.md)             | Install the stack and send your first point to Influx                             |
| 2   | [QA within](./02_qa_within/README.md)                 | **QA inside o11y** — checks run in the app when a user acts; results go to Influx |
| 3   | [Automations + o11y](./03_automations_o11y/README.md) | **o11y inside QA** — Selenium reports pass/fail per test to Influx                |
| 4   | [Software changes](./04_sw_changes/README.md)         | Concept: CI/CD signals when code changes might affect your tests                  |
| 5   | [QA automation health](./05_qa_status/README.md)      | Selenium reports **breakages** (exceptions, missing elements), not just test fail |
| 6   | [Real user monitoring](./06_RUM/README.md)            | **RUM** — log user clicks and postback load times from the live site              |
| 7   | [Performance](./07_performance/README.md)             | Site + **k6** both store response times; compare server, browser, and load tool   |


Examples **2** and **3** are two sides of the same coin: QA embedded in telemetry, and telemetry embedded in automations.

## Before you start

1. Work through [First steps](./01_first_steps/README.md) (Node, InfluxDB 1.x, Grafana, optional Selenium and k6).
2. Start the base site when an example asks for it, for example:
  `node ../resources/testedSW/webpage.js`  
   (listens on `http://localhost:4000` unless noted otherwise).
3. Open Grafana pointed at database `**ObserQAbility`**.

Examples **4** is documentation-only (no runnable app in that folder). The rest include code you can run locally.

## Quick reference

- **Influx:** `localhost:8086`, database `ObserQAbility`
- **Demo site:** `http://localhost:4000` (most examples)
- **Selenium examples:** install `selenium-webdriver` locally; see each example README (`package.json` is usually not committed)

Have fun exploring—and chart what matters to your team, not only what is easiest to count.