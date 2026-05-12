import http from "http";

// Function to send data to InfluxDB
export async function sendToInflux(measurement, action, status=0, metric = 0, errorMessage = "") {
    const data = `${measurement},action=${action} status=${status},metric=${metric},error_message="${errorMessage}"`;

    const options = {
        hostname: "localhost",
        port: 8086,
        path: "/write?db=ObserQAbility",
        method: "POST",
        headers: {
            "Content-Type": "text/plain",
            "Content-Length": Buffer.byteLength(data),
        },
    };

    const req = http.request(options, (res) => {
        if (res.statusCode === 204) {
            console.log(`✅ Sent ${action} data to InfluxDB under ${measurement}`);
        } else {
            console.error(`❌ Failed to send data to InfluxDB. Status: ${res.statusCode}`);
        }
    });

    req.on("error", (error) => {
        console.error("❌ Error sending data to InfluxDB:", error.message);
    });

    req.write(data);
    req.end();
}