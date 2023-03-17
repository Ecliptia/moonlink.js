export namespace track {
    function skip(): any;
    function skipEdit(i: any): void;
    function current(): any;
    function editCurrent(track: any): void;
}
export let db: database;
export function sendDs(): any;
export function esdw(x: any): void;
export function request(node: any, endpoint: any, params: any): Promise<any>;
import makeRequest = require("./MakeRequest.js");
import database = require("./MoonlinkDatabase.js");
export declare const map: Map<any, any>;
export declare const filters: any[];
export { makeRequest };
