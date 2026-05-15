import { setTimeout as delay } from "node:timers/promises";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { sendToInflux } from "../../resources/instrument/instrument.js";

const QUIT_DEADLINE_MS = 10_000;
const BASE = process.env.BASE_URL ?? "http://localhost:4000";
const MEASUREMENT = "selenium_health";

/** Turn a thrown error into a short label QA can read on a dashboard. */
function problemKind(err) {
  const name = err?.name ?? "";
  const msg = err?.message ?? "";
  if (name === "NoSuchElementError" || /no such element/i.test(msg)) {
    return "missing_element"; // page may have changed
  }
  if (name === "TimeoutError" || /timeout/i.test(msg)) {
    return "timeout";
  }
  return "exception";
}

async function reportProblem(step, err) {
  const kind = problemKind(err);
  const detail = `${kind} @ ${step}: ${err.message}`.replace(/"/g, "'");
  await sendToInflux(MEASUREMENT, step, 0, 0, detail);
  console.error(`PROBLEM [${kind}] at step "${step}":`, err.message);
}

async function runStep(step, fn) {
  try {
    await fn();
  } catch (err) {
    await reportProblem(step, err);
    throw err;
  }
}

const driver = await new Builder()
  .forBrowser("chrome")
  .setChromeOptions(
    new chrome.Options().addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage")
  )
  .build();

let hadProblem = false;

try {
  await runStep("open_home", () => driver.get(BASE));

  await runStep("go_to_about", async () => {
    await driver.findElement(By.linkText("Go to About Page")).click();
    await driver.wait(until.urlContains("/about"), 10000);
  });

  await sendToInflux(MEASUREMENT, "automation_ok", 1, 0, "");
  console.log("OK: automation ran without problems");
} catch {
  hadProblem = true;
} finally {
  await Promise.race([driver.quit().catch(() => {}), delay(QUIT_DEADLINE_MS)]);
  process.exit(hadProblem ? 1 : 0);
}
