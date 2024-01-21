import * as http from "http";
import * as https from "https";
import * as http2 from "http2";
import { Structure } from "../../index";

export function makeRequest<T>(
    uri: string,
    options: http.RequestOptions | (https.RequestOptions & { method?: string }),
    data?: Record<string, any>
): Promise<T> {
    return new Promise<T>(resolve => {
        const url = new URL(uri);
        if (Structure.manager.options.http2 === true) {
            let client = http2.connect(url.origin, {
                protocol: url.protocol === "https:" ? "https:" : "http:",
                rejectUnauthorized: false
            });

            const reqOptions: http2.OutgoingHttpHeaders = {
                ":method": options.method,
                ":path": url.pathname + url.search,
                "User-Agent": "Moonlink(Bot)",
                "Content-Type": "application/json",
                ...(options.headers || {})
            };
            let chunks: string = "";

            const req = client.request(reqOptions);

            req.on("error", error => {
                Structure.manager.emit(
                    "debug",
                    `@Moonlink(MakeRequest[HTTP/2]) - An error occurred when requesting the ${url}: ${error}`
                );
                client.close();
                resolve(error as T);
            });

            req.on("response", headers => {
                req.setEncoding("utf8");
                req.on("data", chunk => (chunks += chunk));
                req.on("end", () => {
                    client.close();
                    try {
                        const parsedData = JSON.parse(chunks) as T;
                        resolve(parsedData);
                    } catch (parseError) {
                        resolve(parseError as T);
                    }
                });

                req.on("error", error => {
                    Structure.manager.emit(
                        "debug",
                        `@Moonlink(MakeRequest[HTTP/2]) - An error occurred when requesting the ${url}: ${error}`
                    );
                    client.close();
                    resolve(error as T);
                });
            });

            data ? req.end(JSON.stringify(data)) : req.end();
        } else {
            let requestModule: typeof http | typeof https = http;

            if (url.protocol === "https:") {
                requestModule = https;
            }

            options.headers = {
                "Content-Type": "application/json",
                ...(options.headers || {})
            };

            const reqOptions: http.RequestOptions = {
                host: url.hostname,
                port: url.port
                    ? parseInt(url.port)
                    : url.protocol === "https:"
                    ? 443
                    : 80,
                path: url.pathname + url.search,
                method: options.method || "GET",
                ...options
            };

            const req: http.ClientRequest = requestModule.request(
                url,
                reqOptions,
                async (res: http.IncomingMessage) => {
                    const chunks: Uint8Array[] = [];

                    res.on("data", async (chunk: Uint8Array) => {
                        chunks.push(chunk);
                    });

                    res.on("end", async () => {
                        try {
                            const responseData: string = Buffer.concat(chunks).toString();

                            const parsedData = JSON.parse(responseData) as T;
                            resolve(parsedData);
                        } catch (err) {
                            resolve(err as T);
                        }
                    });

                    res.on("error", (err: Error) => {
                        resolve(err as T);
                    });
                }
            );

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        }
    });
}
