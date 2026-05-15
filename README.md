# Enter ObserQAbility!

A hands-on introduction to **ObserQAbility**—bringing **QA** and **observability (o11y)** together—with small JavaScript examples you can run locally, inspect in InfluxDB, and chart in Grafana.

## What is observability (o11y)?

Observability means understanding the **internal state** of a system from **external signals**—knowing how something is doing **without opening the hood**.

To get there you typically need:

| Piece | What it does |
|-------|----------------|
| **Telemetry** | Data leaving the system (metrics, events, logs) |
| **Instrumentation** | Code, libraries, or agents that produce that data—manual, SDK, or agent-based |
| **Storage** | Somewhere to keep history (here we use a time-series DB) |
| **Visualization** | Dashboards and alerts humans can read (e.g. Grafana) |

## What is ObserQAbility?

**ObserQAbility** (nickname **oQAy**, “oh-kiu-ey-ee”) is the **fusion of QA and observability** in both directions:

- **QA inside o11y** — checks, validations, and assertions live next to your telemetry (e.g. a user action triggers a check and writes pass/fail to the same store).
- **o11y inside QA** — automations and tests **emit signals** (pass/fail, breakage, timing) so you see quality trends over time, not only the last CI log.
- **Mix and extend** — RUM, performance, CI change hints, automation health; the patterns stack.

This repo keeps instrumentation **deliberately simple** (`sendToInflux` and plain HTTP writes) so you see what is being stored before you adopt heavier tools.

## Repository layout

| Path | Contents |
|------|----------|
| [`examples/`](./examples/README.md) | Seven walkthroughs (first steps → RUM → performance) |
| [`resources/instrument/`](./resources/instrument/instrument.js) | Shared helper to write points to InfluxDB |
| [`resources/testedSW/`](./resources/testedSW/README.md) | Playground web page and API used by the demos |

## Get started

1. Read **[Examples](./examples/README.md)** for the suggested order and tool list (Node, **InfluxDB 1.x**, Grafana, Selenium, k6).
2. Complete **[First steps](./examples/01_first_steps/README.md)** and confirm data appears in database **`ObserQAbility`**.
3. Pick any example that matches your interest—each folder has its own README and runnable code (except example 4, which is concept-only).

**Quick defaults:** Influx at `http://localhost:8086`, demo site often at `http://localhost:4000`.

## Examples at a glance

| | Topic |
|---|--------|
| 1 | First steps — send your first metric |
| 2 | QA within the app |
| 3 | Selenium pass/fail → Influx |
| 4 | Software changes vs QA (CI/CD concept) |
| 5 | Automation health (breakages, not just test fail) |
| 6 | Real user monitoring |
| 7 | Performance (site + k6) |

Full descriptions and run instructions: **[Examples index](./examples/README.md)**.
