import { setTimeout as delay } from "node:timers/promises";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { sendToInflux } from "../../resources/instrument/instrument.js";

const QUIT_DEADLINE_MS = 10_000;

const BASE = process.env.BASE_URL ?? "http://localhost:4000";

async function report(action, pass, msg = "") {
  const err = pass ? "" : msg.replace(/"/g, '\\"');
  await sendToInflux("selenium_smoke", action, pass ? 1 : 0, 0, err);
}

const driver = await new Builder()
  .forBrowser("chrome")
  .setChromeOptions(
    new chrome.Options().addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage")
  )
  .build();

try {
  // 1) Navigation: home → About
  try {
    await driver.get(BASE);
    await driver.findElement(By.linkText("Go to About Page")).click();
    await driver.wait(until.urlContains("/about"), 10000);
    await report("nav_about", true);
    console.log("PASS: nav_about");
  } catch (e) {
    await report("nav_about", false, e.message);
    console.error("FAIL: nav_about", e.message);
  }

  // 2) Content: main heading on home
  try {
    await driver.get(BASE);
    const h1 = await driver.findElement(By.css("h1")).getText();
    if (!h1.includes("Welcome")) throw new Error(h1);
    await report("home_h1", true);
    console.log("PASS: home_h1");
  } catch (e) {
    await report("home_h1", false, e.message);
    console.error("FAIL: home_h1", e.message);
  }
} finally {
  // driver.quit() can hang waiting on chromedriver; cap wait then exit the process.
  await Promise.race([driver.quit().catch(() => {}), delay(QUIT_DEADLINE_MS)]);
  process.exit(0);
}
