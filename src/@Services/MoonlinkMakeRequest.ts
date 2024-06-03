export function makeRequest<T>(url: string, options: RequestInit, data?: any): Promise<T> {
    data ? options.body = JSON.stringify(data) : null;
    options.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Moonlink/3* (https://github.com/Ecliptia/moonlink.js)',
        ...options.headers
    };

        return fetch(url, options)
        .then(res => res.json())
        .then(json => json as T);
}