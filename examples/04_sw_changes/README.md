# Detecting QA impacts from software changes

Observability can help you **spot when a code change might break or weaken your QA automations**—not after a long investigation, but **soon after the change lands** (for example, right after a merge or a deployment in your CI/CD pipeline).

The idea is simple: your pipeline (or a small step in it) **records “something changed here”** in the same place you already look for metrics (for example InfluxDB + Grafana). QA can then get an **alert or a dashboard** that says: “this area of the product was touched—check your tests if they cover it.”

This example stays **high level**. Wiring it up depends on your tools (GitHub Actions, Jenkins, GitLab, and so on). Below are **plain-language examples** of what you might track and how QA would use it.

---

## Why this matters for QA

- Developers change code often. Your **automated checks** (UI, API, smoke) are tied to **specific screens, APIs, or flows**.
- If nobody tells QA **which** part of the system changed, you only find out when a test fails—or worse, when a bug slips through.
- A **light signal** from the pipeline (“this module / this path / this service was built or deployed”) gives QA a **heads-up** to rerun or update tests **on purpose**, not only when something is already red.

---

## Example 1 — “The login screen was in this build”

**What you record (in simple words):**  
“We built a new version of the **web app** that includes files under **login**.”

**What QA does:**  
If you have Selenium (or manual scripts) around login, you **open that area first** after this build, or you **add a quick smoke** on login before sign-off.

**Takeaway:** You do not need to know *how* the pipeline detected “login”—only that the **signal name** (for example `area=login`) is easy to read on a chart or in an alert.

---

## Example 2 — “The payment API was deployed”

**What you record:**  
“We deployed **payment-service** to **staging**.”

**What QA does:**  
Run your **payment API tests** (or the subset that hits staging), even if nothing else failed yet.

**Takeaway:** The signal is tied to **what changed** (which app or service), not to every line of code.

---

## Example 3 — “A shared library used by many tests changed”

**What you record:**  
“We released a new version of **shared-ui-components**.”

**What QA does:**  
Treat it like a **wide impact**: run a **short regression pack** across main journeys, because many pages might look the same but behave differently.

**Takeaway:** Sometimes the risk is **breadth**, not one screen. The observability signal can say **“library X”** so QA knows to cast a wider net.

---

## What “instrumenting CI/CD” means here (in one sentence)

Someone adds a **small step** after a meaningful event (merge, build, deploy) that **sends one line of data** (time, environment, team, area or service name) to your metrics store—same idea as the `sendToInflux` examples elsewhere in this repo, but the **“action”** is “code changed” instead of “test passed.”

---

## What this example does *not* do

It does **not** replace code review, test reports, or ticket systems. It only adds a **simple, visible breadcrumb** so QA and release managers can **react early** when software changes and automations might drift apart.

If you later add a tiny script or pipeline snippet to this folder, you can link it here under “How we did it in this repo.”
