[moonlink.js](../README.md) / [Exports](../modules.md) / MoonlinkNode

# Class: MoonlinkNode

## Table of contents

### Constructors

- [constructor](MoonlinkNode.md#constructor)

### Properties

- [\_manager](MoonlinkNode.md#_manager)
- [calls](MoonlinkNode.md#calls)
- [db](MoonlinkNode.md#db)
- [host](MoonlinkNode.md#host)
- [http](MoonlinkNode.md#http)
- [identifier](MoonlinkNode.md#identifier)
- [info](MoonlinkNode.md#info)
- [password](MoonlinkNode.md#password)
- [port](MoonlinkNode.md#port)
- [reconnectAttempts](MoonlinkNode.md#reconnectattempts)
- [reconnectTimeout](MoonlinkNode.md#reconnecttimeout)
- [rest](MoonlinkNode.md#rest)
- [resume](MoonlinkNode.md#resume)
- [resumeStatus](MoonlinkNode.md#resumestatus)
- [resumeTimeout](MoonlinkNode.md#resumetimeout)
- [resumed](MoonlinkNode.md#resumed)
- [retryAmount](MoonlinkNode.md#retryamount)
- [retryDelay](MoonlinkNode.md#retrydelay)
- [secure](MoonlinkNode.md#secure)
- [sessionId](MoonlinkNode.md#sessionid)
- [socket](MoonlinkNode.md#socket)
- [state](MoonlinkNode.md#state)
- [stats](MoonlinkNode.md#stats)
- [version](MoonlinkNode.md#version)

### Accessors

- [address](MoonlinkNode.md#address)

### Methods

- [check](MoonlinkNode.md#check)
- [close](MoonlinkNode.md#close)
- [connect](MoonlinkNode.md#connect)
- [error](MoonlinkNode.md#error)
- [handleEvent](MoonlinkNode.md#handleevent)
- [message](MoonlinkNode.md#message)
- [movePlayersToNextNode](MoonlinkNode.md#moveplayerstonextnode)
- [open](MoonlinkNode.md#open)
- [reconnect](MoonlinkNode.md#reconnect)
- [request](MoonlinkNode.md#request)

## Constructors

### constructor

• **new MoonlinkNode**(`node`): [`MoonlinkNode`](MoonlinkNode.md)

Initializes a new MoonlinkNode instance with the provided configuration.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `node` | [`INode`](../interfaces/INode.md) | The configuration object for the Lavalink node. |

#### Returns

[`MoonlinkNode`](MoonlinkNode.md)

#### Defined in

[src/@Entities/MoonlinkNode.ts:50](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L50)

## Properties

### \_manager

• `Private` **\_manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Entities/MoonlinkNode.ts:19](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L19)

___

### calls

• **calls**: `number` = `0`

#### Defined in

[src/@Entities/MoonlinkNode.ts:42](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L42)

___

### db

• **db**: [`MoonlinkDatabase`](MoonlinkDatabase.md) = `Structure.db`

#### Defined in

[src/@Entities/MoonlinkNode.ts:43](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L43)

___

### host

• **host**: `string`

#### Defined in

[src/@Entities/MoonlinkNode.ts:26](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L26)

___

### http

• **http**: `string`

#### Defined in

[src/@Entities/MoonlinkNode.ts:31](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L31)

___

### identifier

• `Optional` **identifier**: `string`

#### Defined in

[src/@Entities/MoonlinkNode.ts:27](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L27)

___

### info

• **info**: `any` = `{}`

#### Defined in

[src/@Entities/MoonlinkNode.ts:41](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L41)

___

### password

• **password**: `string`

#### Defined in

[src/@Entities/MoonlinkNode.ts:28](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L28)

___

### port

• **port**: `number`

#### Defined in

[src/@Entities/MoonlinkNode.ts:29](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L29)

___

### reconnectAttempts

• `Private` **reconnectAttempts**: `number` = `1`

#### Defined in

[src/@Entities/MoonlinkNode.ts:21](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L21)

___

### reconnectTimeout

• `Private` `Optional` **reconnectTimeout**: `Timeout`

#### Defined in

[src/@Entities/MoonlinkNode.ts:20](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L20)

___

### rest

• **rest**: [`MoonlinkRestFul`](MoonlinkRestFul.md)

#### Defined in

[src/@Entities/MoonlinkNode.ts:32](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L32)

___

### resume

• `Optional` **resume**: `boolean`

#### Defined in

[src/@Entities/MoonlinkNode.ts:33](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L33)

___

### resumeStatus

• `Private` **resumeStatus**: `boolean` = `false`

#### Defined in

[src/@Entities/MoonlinkNode.ts:24](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L24)

___

### resumeTimeout

• `Optional` **resumeTimeout**: `number` = `30000`

#### Defined in

[src/@Entities/MoonlinkNode.ts:35](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L35)

___

### resumed

• `Optional` **resumed**: `boolean`

#### Defined in

[src/@Entities/MoonlinkNode.ts:34](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L34)

___

### retryAmount

• `Private` **retryAmount**: `number` = `6`

#### Defined in

[src/@Entities/MoonlinkNode.ts:22](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L22)

___

### retryDelay

• `Private` **retryDelay**: `number` = `120000`

#### Defined in

[src/@Entities/MoonlinkNode.ts:23](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L23)

___

### secure

• **secure**: `boolean`

#### Defined in

[src/@Entities/MoonlinkNode.ts:30](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L30)

___

### sessionId

• **sessionId**: `string`

#### Defined in

[src/@Entities/MoonlinkNode.ts:36](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L36)

___

### socket

• **socket**: `MoonlinkWebSocket`

#### Defined in

[src/@Entities/MoonlinkNode.ts:37](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L37)

___

### state

• **state**: `string` = `State.DISCONNECTED`

#### Defined in

[src/@Entities/MoonlinkNode.ts:39](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L39)

___

### stats

• **stats**: [`INodeStats`](../interfaces/INodeStats.md)

#### Defined in

[src/@Entities/MoonlinkNode.ts:40](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L40)

___

### version

• **version**: `string` = `""`

#### Defined in

[src/@Entities/MoonlinkNode.ts:38](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L38)

## Accessors

### address

• `get` **address**(): `string`

Returns the formatted address string composed of the host and port.

#### Returns

`string`

The formatted address string.

#### Defined in

[src/@Entities/MoonlinkNode.ts:96](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L96)

## Methods

### check

▸ **check**(`node`): `void`

Validates the correctness of essential configuration options for the node.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `node` | [`INode`](../interfaces/INode.md) | The configuration object for the Lavalink node. |

#### Returns

`void`

#### Defined in

[src/@Entities/MoonlinkNode.ts:105](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L105)

___

### close

▸ **close**(`code`, `reason`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `code` | `number` |
| `reason` | `any` |

#### Returns

`void`

#### Defined in

[src/@Entities/MoonlinkNode.ts:269](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L269)

___

### connect

▸ **connect**(): `Promise`\<`any`\>

Establishes a WebSocket connection to the Lavalink server.

#### Returns

`Promise`\<`any`\>

A promise representing the connection process.

#### Defined in

[src/@Entities/MoonlinkNode.ts:159](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L159)

___

### error

▸ **error**(`error`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `Error` |

#### Returns

`void`

#### Defined in

[src/@Entities/MoonlinkNode.ts:421](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L421)

___

### handleEvent

▸ **handleEvent**(`payload`): `Promise`\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `any` |

#### Returns

`Promise`\<`any`\>

#### Defined in

[src/@Entities/MoonlinkNode.ts:430](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L430)

___

### message

▸ **message**(`data`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `string` \| `Buffer` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/@Entities/MoonlinkNode.ts:299](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L299)

___

### movePlayersToNextNode

▸ **movePlayersToNextNode**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/@Entities/MoonlinkNode.ts:193](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L193)

___

### open

▸ **open**(): `void`

#### Returns

`void`

#### Defined in

[src/@Entities/MoonlinkNode.ts:182](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L182)

___

### reconnect

▸ **reconnect**(): `void`

#### Returns

`void`

#### Defined in

[src/@Entities/MoonlinkNode.ts:239](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L239)

___

### request

▸ **request**(`endpoint`, `params`): `Promise`\<`object`\>

Sends a request to the specified endpoint with parameters and returns a promise that resolves to the response object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `endpoint` | `string` | The endpoint to send the request to. |
| `params` | `any` | The parameters for the request. |

#### Returns

`Promise`\<`object`\>

A promise resolving to the response object.

#### Defined in

[src/@Entities/MoonlinkNode.ts:149](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkNode.ts#L149)
