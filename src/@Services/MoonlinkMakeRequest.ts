import http from "http";
import https from "https";
import * as http2 from "http2";
import { Structure } from "../../index";
export type Headers = {
    Authorization?: string | null;
};

export function makeRequest(
    uri: string,
    options: any,
    data?: any
): Promise<any> {
    return new Promise(resolve => {
        const url = new URL(uri);
        if (Structure.manager.options.http2 === true) {
            let client = http2.connect(url.origin, {
                protocol: url.protocol == "https:" ? "https:" : "http:",
                rejectUnauthorized: false
            });
            const reqOptions = {
                ":method": options.method,
                ":path": url.pathname + url.search,
                "User-Agent":
                    "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
                DNT: "1",
                "Content-Type": "application/json",
                ...(options.headers || {})
            };
            let chunks: any = "";
            const req = client.request(reqOptions);

            req.on("error", error => {
                Structure.manager.emit(
                    "debug",
                    `@Moonlink(MakeRequest[HTTP/2]) - An error occurred when requesting the ${url}: ${error}`
                );
                client.close();
                resolve(error);
            });
            req.on("response", headers => {
                req.setEncoding("utf8");
                req.on("data", chunk => (chunks += chunk));
                req.on("end", () => {
                    client.close();
                    resolve(JSON.parse(chunks));
                });

                req.on("error", error => {
                    Structure.manager.emit(
                        "debug",
                        `@Moonlink(MakeRequest[HTTP/2]) - An error occurred when requesting the ${url}: ${error}`
                    );
                    client.close();
                    resolve(error);
                });
            });
            console.log(data);
            data ? req.end(JSON.stringify(data)) : req.end();
        }

        let requestModule;

        if (url.protocol === "https:") {
            requestModule = https;
        } else {
            requestModule = http;
        }
        options.headers = {
            "Content-Type": "application/json",
            ...options.headers
        };
        const reqOptions = {
            port: url.port ? url.port : url.protocol === "https:" ? 443 : 80,
            method: "GET",
            ...options
        };

        const req = requestModule.request(url, reqOptions, async (res: any) => {
            const chunks: Uint8Array[] = [];

            res.on("data", async (chunk: any) => {
                chunks.push(chunk);
            });

            res.on("end", async () => {
                try {
                    const responseData: any = Buffer.concat(chunks).toString();
                    resolve(JSON.parse(responseData));
                } catch (err) {
                    resolve(err);
                }
            });

            res.on("error", (err: Error) => {
                resolve(err);
            });
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}
