"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRequest = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
function makeRequest(uri, options, data) {
  return new Promise((resolve) => {
    let url = new URL(uri);
    if (!options.method) options.method = "GET";
    if (!options.headers["User-Agent"])
      options.headers["User-Agent"] = "Moonlink/Request";
    if (!options.headers["Content-Type"])
      options.headers["Content-Type"] = "application/json";
    let request;
    url.protocol == "https:"
      ? (request = https_1.default.request)
      : (request = http_1.default.request);
    let opts = {
      port: url.port ? url.port : url.protocol == "https:" ? 443 : 80,
      ...options,
    };
    let req = request(url, opts, async (res) => {
      const chunks = [];
      res.on("data", async (chunk) => {
        chunks.push(chunk);
      });
      res.on("end", async () => {
        try {
          const data = Buffer.concat(chunks).toString();
          if (url.pathname == "/version") resolve(data);
          resolve(JSON.parse(data));
        } catch (err) {
          resolve(err);
        }
      });
      res.on("error", (err) => {
        resolve(err);
      });
    });
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}
exports.makeRequest = makeRequest;
//# sourceMappingURL=MakeRequest.js.map
