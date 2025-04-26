"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Spotify {
    name;
    constructor() {
        this.name = "Spotify";
    }
    search(query, options) {
        return new Promise((resolve, reject) => {
            const { source, requester } = options;
            if (!query) {
                return reject(new Error("Moonlink.js > Spotify > Query is required"));
            }
            if (!source) {
                return reject(new Error("Moonlink.js > Spotify > Source is required"));
            }
            if (!requester) {
                return reject(new Error("Moonlink.js > Spotify > Requester is required"));
            }
            const result = {
                loadType: "track",
                tracks: [
                    {
                        title: "Sample Track",
                        uri: "spotify:track:1234567890",
                        duration: 300000,
                        requester: requester,
                    },
                ],
            };
            resolve(result);
        });
    }
    load(url, options) {
        return new Promise((resolve, reject) => {
            if (!url) {
                return reject(new Error("Moonlink.js > Spotify > URL is required"));
            }
            const result = {
                loadType: "track",
                tracks: [
                    {
                        title: "Sample Track",
                        uri: url,
                        duration: 300000,
                        requester: options.requester,
                    },
                ],
            };
            resolve(result);
        });
    }
    resolve(url, options) {
        return new Promise((resolve, reject) => {
            if (!url) {
                return reject(new Error("Moonlink.js > Spotify > URL is required"));
            }
            const result = {
                loadType: "track",
                tracks: [
                    {
                        title: "Sample Track",
                        uri: url,
                        duration: 300000,
                        requester: options.requester,
                    },
                ],
            };
            resolve(result);
        });
    }
}
exports.default = Spotify;
//# sourceMappingURL=Spotify.js.map