import http from "http";
import { parse as parseUrl } from "url";
import { sendToInflux } from "../../resources/instrument/instrument.js";

const MEASUREMENT = "perf_site";

/** Reports browser-side postback duration after the next page loads. */
const perfClient = `
<script>
(function () {
  var pending = sessionStorage.getItem("perf_pending");
  if (pending) {
    sessionStorage.removeItem("perf_pending");
    try {
      var p = JSON.parse(pending);
      var ms = Math.round(performance.now() - p.start);
      fetch("/perf/report?action=" + encodeURIComponent(p.action) + "&metric=" + ms);
    } catch (e) {}
  }
  window.perfNavigate = function (action, url) {
    sessionStorage.setItem("perf_pending", JSON.stringify({ action: action, start: performance.now() }));
    window.location.href = url;
  };
})();
</script>
`;

const homePage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Demo</title>
    <style> body { font-family: Arial, sans-serif; padding: 20px; } </style>
    ${perfClient}
    <script>
        function submitForm() {
            var v = document.getElementById("formInput").value;
            perfNavigate("postback_form", "/result?input=" + encodeURIComponent(v));
        }
        function submitName() {
            var v = document.getElementById("nameInput").value;
            perfNavigate("postback_name", "/result?input=" + encodeURIComponent(v));
        }
    </script>
</head>
<body>
    <h1>Performance demo page</h1>

    <h2>Form postback</h2>
    <form onsubmit="event.preventDefault(); submitForm();">
        <input type="text" id="formInput" placeholder="Type something" value="demo">
        <button type="submit">Submit</button>
    </form>

    <h2>Name postback</h2>
    <input type="text" id="nameInput" placeholder="Your name" value="k6-user">
    <button onclick="submitName()">Submit name</button>

    <h2>Link navigation</h2>
    <a href="/about" onclick="event.preventDefault(); perfNavigate('postback_about', '/about');">Go to About</a>
</body>
</html>
`;

const resultPage = (userInput) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Result</title>
    <style> body { font-family: Arial, sans-serif; padding: 20px; } </style>
    ${perfClient}
</head>
<body>
    <h1>Result</h1>
    <p>You entered: <strong>${userInput}</strong></p>
    <a href="/" onclick="event.preventDefault(); perfNavigate('postback_home', '/');">Back home</a>
</body>
</html>
`;

const aboutPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>About</title>
    <style> body { font-family: Arial, sans-serif; padding: 20px; } </style>
    ${perfClient}
</head>
<body>
    <h1>About</h1>
    <a href="/" onclick="event.preventDefault(); perfNavigate('postback_home', '/');">Back home</a>
</body>
</html>
`;

function randomDelay(min, max, callback) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeout(callback, delay);
}

const MIN_DELAY = 500;
const MAX_DELAY = 3000;

function reportServerPage(action, startedAt) {
    const ms = Date.now() - startedAt;
    sendToInflux(MEASUREMENT, action, 1, ms, "server_ms");
}

const server = http.createServer((req, res) => {
    const startedAt = Date.now();
    const parsedUrl = parseUrl(req.url, true);
    const pathname = parsedUrl.pathname ?? "/";

    if (pathname === "/perf/report") {
        const action = String(parsedUrl.query.action ?? "postback");
        const metric = Number(parsedUrl.query.metric ?? 0) || 0;
        sendToInflux(MEASUREMENT, action, 1, metric, "browser_ms");
        res.writeHead(204);
        res.end();
        return;
    }

    randomDelay(MIN_DELAY, MAX_DELAY, () => {
        if (pathname === "/") {
            reportServerPage("serve_home", startedAt);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(homePage);
        } else if (pathname === "/result") {
            reportServerPage("serve_result", startedAt);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(resultPage(parsedUrl.query.input || ""));
        } else if (pathname === "/about") {
            reportServerPage("serve_about", startedAt);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(aboutPage);
        } else {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("<h1>404</h1>");
        }
    });
});

server.listen(4000, () => {
    console.log("Performance demo at http://localhost:4000");
});
