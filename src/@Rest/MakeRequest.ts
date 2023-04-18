import http from "http"
import https from "https"

export type headers = {
	Authorization?: string | null;
	'Content-Type'?: string | null;
  'User-Agent'?: string | null;
}
export interface options {
	method?: string;
	headers?: headers;
} 

export function makeRequest(uri: string, options: options, data?: any) {
	return new Promise((resolve) => {
  let url = new URL(uri)
	if(!options.method) options.method = "GET"; 
	if(!options.headers['User-Agent']) options.headers['User-Agent'] = 'Moonlink/Request'; 
	if(!options.headers['Content-Type']) options.headers['Content-Type'] = 'application/json';
	let request: any;
	url.protocol == 'https:' ? request = https.request : request = http.request;
	let opts = {
		port: url.port ? url.port : url.protocol == 'https:' ? 443 : 80,
    ...options,
	}
		let req = request(url, opts, async(res: any) => {
			const chunks: Uint8Array[] = [];
			res.on('data', async (chunk: any) => {
        chunks.push(chunk)
      });
      res.on('end', async () => {
        try {
          const data: any = Buffer.concat(chunks).toString();
          if (url.pathname == '/version') resolve(data)
          resolve(JSON.parse(data))
        } catch (err) {
          resolve(err)
        }
      })
      res.on('error', (err: Error) => {
        resolve(err)
      })
		})
   if(data) req.write(JSON.stringify(data))
   req.end();
	});
}