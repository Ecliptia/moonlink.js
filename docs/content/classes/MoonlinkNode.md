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

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`INode`](../interfaces/INode.md) |

#### Returns

[`MoonlinkNode`](MoonlinkNode.md)

#### Defined in

[src/@Entities/MoonlinkNode.ts:37](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L37)

## Properties

### \_manager

• `Private` **\_manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Entities/MoonlinkNode.ts:13](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L13)

___

### calls

• **calls**: `number` = `0`

#### Defined in

[src/@Entities/MoonlinkNode.ts:34](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L34)

___

### db

• **db**: [`MoonlinkDatabase`](MoonlinkDatabase.md) = `Structure.db`

#### Defined in

[src/@Entities/MoonlinkNode.ts:35](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L35)

___

### host

• **host**: `string`

#### Defined in

[src/@Entities/MoonlinkNode.ts:20](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L20)

___

### http

• **http**: `string`

#### Defined in

[src/@Entities/MoonlinkNode.ts:25](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L25)

___

### identifier

• `Optional` **identifier**: `string`

#### Defined in

[src/@Entities/MoonlinkNode.ts:21](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L21)

___

### password

• **password**: `string`

#### Defined in

[src/@Entities/MoonlinkNode.ts:22](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L22)

___

### port

• **port**: `number`

#### Defined in

[src/@Entities/MoonlinkNode.ts:23](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L23)

___

### reconnectAttempts

• `Private` **reconnectAttempts**: `number` = `1`

#### Defined in

[src/@Entities/MoonlinkNode.ts:15](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L15)

___

### reconnectTimeout

• `Private` `Optional` **reconnectTimeout**: `Timeout`

#### Defined in

[src/@Entities/MoonlinkNode.ts:14](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L14)

___

### rest

• **rest**: [`MoonlinkRestFul`](MoonlinkRestFul.md)

#### Defined in

[src/@Entities/MoonlinkNode.ts:26](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L26)

___

### resume

• `Optional` **resume**: `boolean`

#### Defined in

[src/@Entities/MoonlinkNode.ts:27](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L27)

___

### resumeStatus

• `Private` **resumeStatus**: `boolean` = `false`

#### Defined in

[src/@Entities/MoonlinkNode.ts:18](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L18)

___

### resumeTimeout

• `Optional` **resumeTimeout**: `number` = `30000`

#### Defined in

[src/@Entities/MoonlinkNode.ts:29](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L29)

___

### resumed

• `Optional` **resumed**: `boolean`

#### Defined in

[src/@Entities/MoonlinkNode.ts:28](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L28)

___

### retryAmount

• `Private` **retryAmount**: `number` = `6`

#### Defined in

[src/@Entities/MoonlinkNode.ts:16](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L16)

___

### retryDelay

• `Private` **retryDelay**: `number` = `120000`

#### Defined in

[src/@Entities/MoonlinkNode.ts:17](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L17)

___

### secure

• **secure**: `boolean`

#### Defined in

[src/@Entities/MoonlinkNode.ts:24](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L24)

___

### sessionId

• **sessionId**: `string`

#### Defined in

[src/@Entities/MoonlinkNode.ts:30](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L30)

___

### socket

• **socket**: [`WebSocket`](WebSocket.md)

#### Defined in

[src/@Entities/MoonlinkNode.ts:31](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L31)

___

### state

• **state**: `string` = `State.DISCONNECTED`

#### Defined in

[src/@Entities/MoonlinkNode.ts:32](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L32)

___

### stats

• **stats**: [`INodeStats`](../interfaces/INodeStats.md)

#### Defined in

[src/@Entities/MoonlinkNode.ts:33](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L33)

## Accessors

### address

• `get` **address**(): `string`

#### Returns

`string`

#### Defined in

[src/@Entities/MoonlinkNode.ts:77](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L77)

## Methods

### check

▸ **check**(`node`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`INode`](../interfaces/INode.md) |

#### Returns

`void`

#### Defined in

[src/@Entities/MoonlinkNode.ts:80](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L80)

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

[src/@Entities/MoonlinkNode.ts:231](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L231)

___

### connect

▸ **connect**(): `Promise`\<`any`\>

#### Returns

`Promise`\<`any`\>

#### Defined in

[src/@Entities/MoonlinkNode.ts:122](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L122)

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

[src/@Entities/MoonlinkNode.ts:376](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L376)

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

[src/@Entities/MoonlinkNode.ts:385](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L385)

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

[src/@Entities/MoonlinkNode.ts:242](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L242)

___

### movePlayersToNextNode

▸ **movePlayersToNextNode**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/@Entities/MoonlinkNode.ts:155](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L155)

___

### open

▸ **open**(): `void`

#### Returns

`void`

#### Defined in

[src/@Entities/MoonlinkNode.ts:144](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L144)

___

### reconnect

▸ **reconnect**(): `void`

#### Returns

`void`

#### Defined in

[src/@Entities/MoonlinkNode.ts:201](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L201)

___

### request

▸ **request**(`endpoint`, `params`): `Promise`\<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `string` |
| `params` | `any` |

#### Returns

`Promise`\<`object`\>

#### Defined in

[src/@Entities/MoonlinkNode.ts:117](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Entities/MoonlinkNode.ts#L117)
