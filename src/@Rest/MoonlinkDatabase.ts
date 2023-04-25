import fs from "fs";
import path from "path";
export class MoonlinkDatabase {
 public data: object = {};
 constructor() {
  this.fetch();
 }
 set(key: string, value: any): any {
  this.fetch();
  const keys: string[] = key.split(".");
  const obj: Function = (data: object, _key: any) => {
   if (_key.length === 1) data[_key[0]] = value;
   else {
    if (typeof data[_key[0]] !== "object") data[_key[0]] = {};
    data[_key[0]] = { ...data[_key[0]] };
    obj(data[_key[0]], _key.slice(1));
   }
  };
  obj(this.data, keys);
  this.save();
  return this.get(keys[0]);
 }
 get(key: string): any {
  this.save();
  const data = key.split(".").reduce((acc, curr) => acc?.[curr], this.data);
  return data;
 }
 push(key: string, value: any): any {
  this.save();
  const old_array = this.get(key) ?? [];
  if (!Array.isArray(old_array) && old_array !== undefined) return;
  old_array.push(value);
  this.set(key, old_array);
  this.save();
  return this.get(key.split(".")[0]);
 }
 delete(key: string): boolean {
  this.save();
  const data = this.get(key);
  key.split(".").reduce((o, curr, i, arr) => {
   if (i === arr.length - 1) delete o?.[curr];
   else return o?.[curr];
  }, this.data);
  this.save();
  return true;
 }
 fetch(): void {
  try {
   let data: any = JSON.parse(
    fs.readFileSync(__dirname + "/database.json").toString(),
    (key: any, value: any) => {
     return value;
    }
   );
   if (!data) data = {};
   this.data = data;
  } catch (err: any) {
   if (err.code == "ENOENT") this.data = {};
  }
 }
 save(): void {
  try {
   fs.writeFileSync(
    __dirname + "/database.json",
    JSON.stringify(this.data, null, 2)
   );
   this.fetch();
  } catch (e: any) {
   console.log(e);
  }
 }
}
