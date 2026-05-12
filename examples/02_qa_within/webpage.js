import http from "http";
import { parse as parseUrl } from "url";
import {sendToInflux} from './instrument.js'

const homePage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webpage Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        #dynamicSection { margin-top: 20px; }
        #hiddenText { display: none; color: red; }
        /* --- BEGIN: QA DEMO (added) ---
           Styles for pass/fail feedback box used by the frontend validation demo.
           --- END: QA DEMO (added) --- */
        #qaStatus { margin-top: 10px; padding: 10px; border: 1px solid #ddd; }
        #qaStatus.pass { border-color: #2e7d32; color: #2e7d32; }
        #qaStatus.fail { border-color: #c62828; color: #c62828; }
    </style>
    <script>
        function showAlert() {
            alert("Button clicked!");
        }
        function addElement() {
            let newElement = document.createElement("p");
            newElement.textContent = "This is a dynamically added element!";
            document.getElementById("dynamicSection").appendChild(newElement);
        }
        function toggleHidden() {
            let hiddenText = document.getElementById("hiddenText");
            hiddenText.style.display = hiddenText.style.display === "none" ? "block" : "none";
        }
        function showPopup() {
            window.open("/popup", "PopupWindow", "width=300,height=200");
        }
        function submitForm() {
            let inputValue = document.getElementById('formInput').value;
            window.location.href = '/result?input=' + encodeURIComponent(inputValue);
        }
        function submitName() {
            let nameValue = document.getElementById('nameInput').value;
            window.location.href = '/result?input=' + encodeURIComponent(nameValue);
        }
        function updateCounter() {
            let counter = document.getElementById("counter");
            counter.textContent = parseInt(counter.textContent) + 1;
        }
        function showDropdownSelection() {
            let dropdown = document.getElementById("dropdown");
            alert("You selected: " + dropdown.value);
        }

        // --- BEGIN: QA DEMO (added) ---
        // Simulates a typical WebFrontEnd Testing-style assertion:
        // validate that the page H1 text matches an expected value, then report to backend.
        async function runFrontendTextValidation() {
            const startedAt = performance.now();
            const expected = document.getElementById("qaExpectedH1").value;
            const actual = document.querySelector("h1")?.textContent?.trim() || "";

            const passed = actual === expected;
            const status = passed ? 1 : 0;
            const errorMessage = passed
                ? "No error"
                : "h1 mismatch: expected='" + expected + "' actual='" + actual + "'";

            const metric = Math.round(performance.now() - startedAt);
            const qs = new URLSearchParams({
                status: String(status),
                metric: String(metric),
                errorMessage
            });

            const qaStatus = document.getElementById("qaStatus");
            qaStatus.className = passed ? "pass" : "fail";
            qaStatus.textContent = passed
                ? "PASS: h1 matched in " + metric + "ms (reported)"
                : "FAIL: " + errorMessage + " (reported)";

            await fetch("/qa/report?" + qs.toString());
        }
        // --- END: QA DEMO (added) ---
        setInterval(updateCounter, 1000);
    </script>
</head>
<body>

    <h1>Welcome to the Web Front End Test Page</h1>

    <!-- --- BEGIN: QA DEMO (added) ---
         UI controls for manually triggering pass/fail frontend validation.
         Change expected text to force FAIL, then click Validate & Report.
         --- END: QA DEMO (added) --- -->
    <h2>0. QA Demo: Frontend Text Validation</h2>
    <p>This simulates what an external UI test (e.g. Selenium) would assert.</p>
    <label>
        Expected H1 text:
        <input type="text" id="qaExpectedH1" style="width: 360px"
               value="Welcome to the Web Front End Test Page">
    </label>
    <button onclick="runFrontendTextValidation()">Validate & Report</button>
    <div id="qaStatus">Not run yet.</div>

    <h2>1. Basic Button Click</h2>
    <button onclick="showAlert()">Click me</button>

    <h2>2. Form Submission</h2>
    <form onsubmit="event.preventDefault(); submitForm();">
        <input type="text" id="formInput" placeholder="Type something">
        <button type="submit">Submit Form</button>
    </form>

    <h2>3. Hidden Element</h2>
    <p id="hiddenText">This text was hidden!</p>
    <button onclick="toggleHidden()">Show/Hide Text</button>

    <h2>4. Dynamic Elements</h2>
    <button onclick="setTimeout(addElement, 2000)">Add Element After 2 Seconds</button>
    <div id="dynamicSection"></div>

    <h2>5. Live Counter</h2>
    <p>Counter: <span id="counter">0</span></p>

    <h2>6. Text Input & Button</h2>
    <input type="text" id="nameInput" placeholder="Enter your name">
    <button onclick="submitName()">Submit</button>

    <h2>7. Dropdown</h2>
    <select id="dropdown">
        <option value="Option 1">Option 1</option>
        <option value="Option 2">Option 2</option>
        <option value="Option 3">Option 3</option>
    </select>
    <button onclick="showDropdownSelection()">Select</button>

    <h2>8. Alert & Pop-up</h2>
    <button onclick="showPopup()">Open Pop-up</button>

    <h2>9. Simple Table</h2>
    <table border="1">
        <tr><th>Name</th><th>Age</th></tr>
        <tr><td>Alice</td><td>25</td></tr>
        <tr><td>Bob</td><td>30</td></tr>
    </table>

    <h2>10. Link Navigation</h2>
    <a href="/about">Go to About Page</a>

</body>
</html>
`;

const resultPage = (userInput) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Submission Result</title>
    <style> body { font-family: Arial, sans-serif; padding: 20px; } </style>
</head>
<body>
    <h1>Submission Received</h1>
    <p>You entered: <strong>${userInput}</strong></p>
    <a href="/">Go Back to Main Page</a>
</body>
</html>
`;

const aboutPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Page</title>
    <style> body { font-family: Arial, sans-serif; padding: 20px; } </style>
</head>
<body>
    <h1>About Page</h1>
    <p>This is a test page for Web Front End navigation.</p>
    <a href="/">Go Back to Main Page</a>
</body>
</html>
`;

const popupPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Popup</title>
    <style> body { font-family: Arial, sans-serif; padding: 20px; text-align: center; } </style>
</head>
<body>
    <h1>This is a pop-up!</h1>
</body>
</html>
`;

function randomDelay(min, max, callback) {
    let delay = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeout(callback, delay);
}

const MIN_DELAY = 500;   // Minimum delay in ms
const MAX_DELAY = 3000;  // Maximum delay in ms

function sanitizeForInfluxField(value) {
    // Shared sendToInflux wraps this in quotes; avoid double-quotes/newlines here.
    return String(value).replace(/"/g, "'").replace(/\n/g, " ");
}

const server = http.createServer((req, res) => {
    const parsedUrl = parseUrl(req.url, true);

    function respondWith(content) {
        randomDelay(MIN_DELAY, MAX_DELAY, () => {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(content);
        });
    }
    randomDelay(MIN_DELAY, MAX_DELAY, () => {
        if (req.url === "/") {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(homePage);
        // --- BEGIN: QA DEMO REPORT ENDPOINT (added) ---
        // Receives frontend validation outcome and forwards it to InfluxDB.
        } else if (parsedUrl.pathname === "/qa/report") {
            const status = Number(parsedUrl.query.status ?? 0) ? 1 : 0;
            const metric = Number(parsedUrl.query.metric ?? 0) || 0;
            const errorMessage = String(parsedUrl.query.errorMessage ?? "");

            // Minimal backend part: just forward frontend result to Influx.
            sendToInflux(
                "QA_Within",
                "FrontendTextValidation",
                status,
                metric,
                sanitizeForInfluxField(errorMessage)
            );
            res.writeHead(204);
            res.end();
        // --- END: QA DEMO REPORT ENDPOINT (added) ---
        } else if (parsedUrl.pathname === "/result") {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(resultPage(parsedUrl.query.input || "Nothing entered"));
        } else if (req.url === "/about") {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(aboutPage);
        } else if (req.url === "/popup") {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(popupPage);
        } else {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("<h1>404 Not Found</h1>");
        }
    });
});

server.listen(4000, () => {
    console.log("Server running at http://localhost:4000");
});
