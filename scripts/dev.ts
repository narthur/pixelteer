import { compareUrls, createReport } from "../src/index.js";
import http from "http";
import path from "path";

const baseUrl1 = "http://localhost:3001";
const baseUrl2 = "http://localhost:3002";
const paths = ["/page1", "/page2", "/page3"];
const outDir = path.resolve("shots");
const force = process.argv.includes("--force");

function createServer(port: number) {
  return http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end(`Hello from http://localhost:${port}/${req.url}`);
    })
    .listen(port, () =>
      console.log(`Server running at http://localhost:${port}/`)
    );
}

console.log("Starting servers...");
const server1 = createServer(3001);
const server2 = createServer(3002);

console.log("Comparing URLs...");
compareUrls({
  baseUrl1,
  baseUrl2,
  paths,
  outDir,
  diffThreshold: 0.2,
  saveThreshold: 10,
  force,
  onSuccess: (data) => console.log(data),
  onError: (e) => console.error(e),
}).then(() => {
  console.log("Creating report...");
  createReport({
    shotsDir: outDir,
    baseUrl1,
    baseUrl2,
    outDir,
  });

  console.log("Stopping servers...");
  server1.close();
  server2.close();
  console.log("Done!");
});
