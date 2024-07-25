import { Manager } from "../index";

export function validateProperty<T>(
  prop: T | undefined,
  validator: (value: T) => boolean,
  errorMessage: string,
) {
  if (!validator(prop)) {
    throw new Error(errorMessage);
  }
}

export function makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    let request = fetch(url, options)
    .then((res) => res.json().catch(() => res.text()))
    .then((json) => json as T)
    
    if (!request) return;
    return request;
}

export const sources = {
  youtube: "ytsearch",
  youtubemusic: "ytmsearch",
  soundcloud: "scsearch",
  local: "local",
};

export class Plugin {
  public name: string;
  public load(manager: Manager): void {}
  public unload(manager: Manager): void {}
}
