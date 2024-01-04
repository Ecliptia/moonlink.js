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

[src/@Services/MoonlinkRestFul.ts:14](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L14)

## Properties

### manager

• **manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Services/MoonlinkRestFul.ts:9](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L9)

___

### node

• **node**: [`MoonlinkNode`](MoonlinkNode.md)

#### Defined in

[src/@Services/MoonlinkRestFul.ts:11](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L11)

___

### sessionId

• **sessionId**: `string`

#### Defined in

[src/@Services/MoonlinkRestFul.ts:10](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L10)

___

### url

• **url**: `string`

#### Defined in

[src/@Services/MoonlinkRestFul.ts:12](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L12)

## Methods

### decodeTrack

▸ **decodeTrack**(`encodedTrack`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `encodedTrack` | `string` |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:61](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L61)

___

### decodeTracks

▸ **decodeTracks**(`data`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`RestOptions`](../interfaces/RestOptions.md) |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:65](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L65)

___

### delete

▸ **delete**(`endpoint`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:56](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L56)

___

### destroy

▸ **destroy**(`guildId`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `guildId` | `string` |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:32](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L32)

___

### ensureUrlIsSet

▸ **ensureUrlIsSet**(): `void`

#### Returns

`void`

#### Defined in

[src/@Services/MoonlinkRestFul.ts:89](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L89)

___

### get

▸ **get**(`endpoint`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:38](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L38)

___

### getInfo

▸ **getInfo**(): `Promise`\<`object`\>

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:69](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L69)

___

### getStats

▸ **getStats**(): `Promise`\<`object`\>

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:73](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L73)

___

### getVersion

▸ **getVersion**(): `Promise`\<`object`\>

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:77](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L77)

___

### makeDeleteRequest

▸ **makeDeleteRequest**(`endpoint`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:139](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L139)

___

### makeGetRequest

▸ **makeGetRequest**(`endpoint`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:95](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L95)

___

### makePatchRequest

▸ **makePatchRequest**(`endpoint`, `data`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |
| `data` | `any` |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:122](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L122)

___

### makePostRequest

▸ **makePostRequest**(`endpoint`, `data`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |
| `data` | `any` |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:105](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L105)

___

### patch

▸ **patch**(`endpoint`, `data`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |
| `data` | `any` |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:48](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L48)

___

### post

▸ **post**(`endpoint`, `data`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |
| `data` | [`RestOptions`](../interfaces/RestOptions.md) |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:43](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L43)

___

### routePlannerFreeAddress

▸ **routePlannerFreeAddress**(`data`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`RestOptions`](../interfaces/RestOptions.md) |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:81](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L81)

___

### routePlannerFreeAll

▸ **routePlannerFreeAll**(`data`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`RestOptions`](../interfaces/RestOptions.md) |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:85](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L85)

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

[src/@Services/MoonlinkRestFul.ts:19](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L19)

___

### update

▸ **update**(`data`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`RestOptions`](../interfaces/RestOptions.md) |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:24](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkRestFul.ts#L24)
