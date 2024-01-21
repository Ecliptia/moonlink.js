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

[src/@Services/MoonlinkRestFul.ts:15](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L15)

## Properties

### manager

• **manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Services/MoonlinkRestFul.ts:10](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L10)

___

### node

• **node**: [`MoonlinkNode`](MoonlinkNode.md)

#### Defined in

[src/@Services/MoonlinkRestFul.ts:12](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L12)

___

### sessionId

• **sessionId**: `string`

#### Defined in

[src/@Services/MoonlinkRestFul.ts:11](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L11)

___

### url

• **url**: `string`

#### Defined in

[src/@Services/MoonlinkRestFul.ts:13](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L13)

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

[src/@Services/MoonlinkRestFul.ts:65](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L65)

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

[src/@Services/MoonlinkRestFul.ts:71](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L71)

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

[src/@Services/MoonlinkRestFul.ts:60](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L60)

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

[src/@Services/MoonlinkRestFul.ts:33](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L33)

___

### ensureUrlIsSet

▸ **ensureUrlIsSet**(): `void`

#### Returns

`void`

#### Defined in

[src/@Services/MoonlinkRestFul.ts:111](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L111)

___

### get

▸ **get**(`endpoint`): `Promise`\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |

#### Returns

`Promise`\<`any`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:39](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L39)

___

### getInfo

▸ **getInfo**(): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:77](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L77)

___

### getStats

▸ **getStats**(): `Promise`\<`Record`\<`string`, `unknown`\>\>

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:81](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L81)

___

### getVersion

▸ **getVersion**(): `Promise`\<`any`\>

#### Returns

`Promise`\<`any`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:85](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L85)

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

[src/@Services/MoonlinkRestFul.ts:166](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L166)

___

### makeGetRequest

▸ **makeGetRequest**(`endpoint`): `Promise`\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |

#### Returns

`Promise`\<`any`\>

#### Defined in

[src/@Services/MoonlinkRestFul.ts:117](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L117)

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

[src/@Services/MoonlinkRestFul.ts:149](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L149)

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

[src/@Services/MoonlinkRestFul.ts:132](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L132)

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

[src/@Services/MoonlinkRestFul.ts:52](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L52)

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

[src/@Services/MoonlinkRestFul.ts:44](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L44)

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

[src/@Services/MoonlinkRestFul.ts:99](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L99)

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

[src/@Services/MoonlinkRestFul.ts:105](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L105)

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

[src/@Services/MoonlinkRestFul.ts:20](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L20)

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

[src/@Services/MoonlinkRestFul.ts:25](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Services/MoonlinkRestFul.ts#L25)
