"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRequest = void 0;
function makeRequest(url, options, data) {
    data ? options.body = JSON.stringify(data) : null;
    options.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Moonlink/3* (https://github.com/Ecliptia/moonlink.js)'
    };
    return fetch(url, options)
        .then(res => res.json())
        .then(json => json);
}
exports.makeRequest = makeRequest;
