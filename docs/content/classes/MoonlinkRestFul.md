[moonlink.js](../README.md) / [Exports](../modules.md) / MoonlinkRestFul

# Class: MoonlinkRestFul

## Table of contents

### Constructors

- [constructor](MoonlinkRestFul.md#constructor)

### Properties

- [manager](MoonlinkRestFul.md#manager)
- [node](MoonlinkRestFul.md#node)
- [sessionId](MoonlinkRestFul.md#sessionid)
- [url](MoonlinkRestFul.md#url)

### Methods

- [decodeTrack](MoonlinkRestFul.md#decodetrack)
- [decodeTracks](MoonlinkRestFul.md#decodetracks)
- [delete](MoonlinkRestFul.md#delete)
- [destroy](MoonlinkRestFul.md#destroy)
- [ensureUrlIsSet](MoonlinkRestFul.md#ensureurlisset)
- [get](MoonlinkRestFul.md#get)
- [getInfo](MoonlinkRestFul.md#getinfo)
- [getStats](MoonlinkRestFul.md#getstats)
- [getVersion](MoonlinkRestFul.md#getversion)
- [makeDeleteRequest](MoonlinkRestFul.md#makedeleterequest)
- [makeGetRequest](MoonlinkRestFul.md#makegetrequest)
- [makePatchRequest](MoonlinkRestFul.md#makepatchrequest)
- [makePostRequest](MoonlinkRestFul.md#makepostrequest)
- [patch](MoonlinkRestFul.md#patch)
- [post](MoonlinkRestFul.md#post)
- [routePlannerFreeAddress](MoonlinkRestFul.md#routeplannerfreeaddress)
- [routePlannerFreeAll](MoonlinkRestFul.md#routeplannerfreeall)
- [setSessionId](MoonlinkRestFul.md#setsessionid)
- [update](MoonlinkRestFul.md#update)

## Constructors

### constructor

• **new MoonlinkRestFul**(`node`): [`MoonlinkRestFul`](MoonlinkRestFul.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`MoonlinkNode`](MoonlinkNode.md) |

#### Returns

[`MoonlinkRestFul`](MoonlinkRestFul.md)

#### Defined in

[src/@Services/MoonlinkRestFul.ts:15](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L15)

## Properties

### manager

• **manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Services/MoonlinkRestFul.ts:10](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L10)

___

### node

• **node**: [`MoonlinkNode`](MoonlinkNode.md)

#### Defined in

[src/@Services/MoonlinkRestFul.ts:12](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L12)

___

### sessionId

• **sessionId**: `string`

#### Defined in

[src/@Services/MoonlinkRestFul.ts:11](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L11)

___

### url

• **url**: `string`

#### Defined in

[src/@Services/MoonlinkRestFul.ts:13](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L13)

## Methods

### decodeTrack

▸ **decodeTrack**(`encodedTrack`): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `encodedTrack` | `string` |

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:59](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L59)

___

### decodeTracks

▸ **decodeTracks**(`data`): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`RestOptions`](../interfaces/RestOptions.md) |

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:63](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L63)

___

### delete

▸ **delete**(`endpoint`): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:54](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L54)

___

### destroy

▸ **destroy**(`guildId`): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `guildId` | `string` |

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:33](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L33)

___

### ensureUrlIsSet

▸ **ensureUrlIsSet**(): `void`

#### Returns

`void`

#### Defined in

[src/@Services/MoonlinkRestFul.ts:87](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L87)

___

### get

▸ **get**(`endpoint`): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:39](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L39)

___

### getInfo

▸ **getInfo**(): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:67](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L67)

___

### getStats

▸ **getStats**(): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:71](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L71)

___

### getVersion

▸ **getVersion**(): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:75](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L75)

___

### makeDeleteRequest

▸ **makeDeleteRequest**(`endpoint`): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:137](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L137)

___

### makeGetRequest

▸ **makeGetRequest**(`endpoint`): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:93](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L93)

___

### makePatchRequest

▸ **makePatchRequest**(`endpoint`, `data`): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |
| `data` | `any` |

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:120](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L120)

___

### makePostRequest

▸ **makePostRequest**(`endpoint`, `data`): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |
| `data` | `any` |

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:103](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L103)

___

### patch

▸ **patch**(`endpoint`, `data`): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |
| `data` | `any` |

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:49](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L49)

___

### post

▸ **post**(`endpoint`, `data`): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |
| `data` | [`RestOptions`](../interfaces/RestOptions.md) |

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:44](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L44)

___

### routePlannerFreeAddress

▸ **routePlannerFreeAddress**(`data`): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`RestOptions`](../interfaces/RestOptions.md) |

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:79](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L79)

___

### routePlannerFreeAll

▸ **routePlannerFreeAll**(`data`): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`RestOptions`](../interfaces/RestOptions.md) |

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:83](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L83)

___

### setSessionId

▸ **setSessionId**(`sessionId`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sessionId` | `string` |

#### Returns

`void`

#### Defined in

[src/@Services/MoonlinkRestFul.ts:20](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L20)

___

### update

▸ **update**(`data`): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`RestOptions`](../interfaces/RestOptions.md) |

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:25](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Services/MoonlinkRestFul.ts#L25)
