import { Manager } from "../index";

export function validateProperty<T>(prop: T | undefined, validator: (value: T) => boolean, errorMessage: string) {
    if (!validator(prop)) {
        throw new Error(errorMessage);
    }
}

export function makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    console.log(url, options)
    return fetch(url, options)
        .then(res => res.json())
        .then(json => json as T);
}

export const sources = {
    youtube: "youtube",
    soundcloud: "soundcloud",
    twitch: "twitch",
    vimeo: "vimeo",
    http: "http",
    local: "local"
}

export class Plugin {
    public name: string;
    public load(manager: Manager): void {}
    public unload(manager: Manager): void {}
}