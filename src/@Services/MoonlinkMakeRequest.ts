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
        if (!options.method) {
            options.method = "GET";
        }

        let requestModule;
        if (url.protocol === "https:") {
            requestModule = https;
            if (
                Structure.manager.options.http2 !== undefined &&
                typeof Structure.manager.options.http2 == "boolean" &&
                Structure.manager.options.http2 == true
            )
                requestModule = http2;
        } else {
            requestModule = http;
        }
        options.headers = {
            "Content-Type": "application/json",
            ...options.headers
        };
        const opts = {
            port: url.port ? url.port : url.protocol === "https:" ? 443 : 80,
            ...options
        };

        const req = requestModule.request(url, opts, async (res: any) => {
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
