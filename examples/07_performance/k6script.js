import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 1,
  duration: "30s",
};

const BASE = __ENV.BASE_URL || "http://localhost:4000";

// Same postback-style URLs the site uses; k6 measures full HTTP time (network + server).
export default function () {
  http.get(`${BASE}/`);
  http.get(`${BASE}/result?input=k6`);
  http.get(`${BASE}/about`);
  sleep(5);
}
