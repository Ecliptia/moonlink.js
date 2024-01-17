[moonlink.js](../README.md) / [Exports](../modules.md) / MoonlinkEvents

# Interface: MoonlinkEvents

## Table of contents

### Properties

- [autoLeaved](MoonlinkEvents.md#autoleaved)
- [debug](MoonlinkEvents.md#debug)
- [nodeClose](MoonlinkEvents.md#nodeclose)
- [nodeCreate](MoonlinkEvents.md#nodecreate)
- [nodeDestroy](MoonlinkEvents.md#nodedestroy)
- [nodeError](MoonlinkEvents.md#nodeerror)
- [nodeRaw](MoonlinkEvents.md#noderaw)
- [nodeReconnect](MoonlinkEvents.md#nodereconnect)
- [playerCreated](MoonlinkEvents.md#playercreated)
- [playerDisconnect](MoonlinkEvents.md#playerdisconnect)
- [playerMove](MoonlinkEvents.md#playermove)
- [playerResume](MoonlinkEvents.md#playerresume)
- [queueEnd](MoonlinkEvents.md#queueend)
- [socketClosed](MoonlinkEvents.md#socketclosed)
- [trackEnd](MoonlinkEvents.md#trackend)
- [trackError](MoonlinkEvents.md#trackerror)
- [trackStart](MoonlinkEvents.md#trackstart)
- [trackStuck](MoonlinkEvents.md#trackstuck)

## Properties

### autoLeaved

• **autoLeaved**: (`player`: [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md), `track?`: `any`) => `void`

#### Type declaration

▸ (`player`, `track?`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `player` | [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md) |
| `track?` | `any` |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:20](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L20)

___

### debug

• **debug**: (...`args`: `any`) => `void`

#### Type declaration

▸ (`...args`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any` |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:21](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L21)

___

### nodeClose

• **nodeClose**: (`node`: [`MoonlinkNode`](../classes/MoonlinkNode.md), `code`: `number`, `reason`: `any`) => `void`

#### Type declaration

▸ (`node`, `code`, `reason`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`MoonlinkNode`](../classes/MoonlinkNode.md) |
| `code` | `number` |
| `reason` | `any` |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:25](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L25)

___

### nodeCreate

• **nodeCreate**: (`node`: [`MoonlinkNode`](../classes/MoonlinkNode.md)) => `void`

#### Type declaration

▸ (`node`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`MoonlinkNode`](../classes/MoonlinkNode.md) |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:22](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L22)

___

### nodeDestroy

• **nodeDestroy**: (`node`: [`MoonlinkNode`](../classes/MoonlinkNode.md)) => `void`

#### Type declaration

▸ (`node`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`MoonlinkNode`](../classes/MoonlinkNode.md) |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:23](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L23)

___

### nodeError

• **nodeError**: (`node`: [`MoonlinkNode`](../classes/MoonlinkNode.md), `error`: `Error`) => `void`

#### Type declaration

▸ (`node`, `error`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`MoonlinkNode`](../classes/MoonlinkNode.md) |
| `error` | `Error` |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:27](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L27)

___

### nodeRaw

• **nodeRaw**: (`node`: [`MoonlinkNode`](../classes/MoonlinkNode.md), `payload`: `object`) => `void`

#### Type declaration

▸ (`node`, `payload`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`MoonlinkNode`](../classes/MoonlinkNode.md) |
| `payload` | `object` |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:26](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L26)

___

### nodeReconnect

• **nodeReconnect**: (`node`: [`MoonlinkNode`](../classes/MoonlinkNode.md)) => `void`

#### Type declaration

▸ (`node`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`MoonlinkNode`](../classes/MoonlinkNode.md) |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:24](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L24)

___

### playerCreated

• **playerCreated**: (`guildId`: `string`) => `void`

#### Type declaration

▸ (`guildId`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `guildId` | `string` |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:33](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L33)

___

### playerDisconnect

• **playerDisconnect**: (`player`: [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md)) => `void`

#### Type declaration

▸ (`player`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `player` | [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md) |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:34](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L34)

___

### playerMove

• **playerMove**: (`player`: [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md), `newVoiceChannel`: `string`, `oldVoiceChannel`: `string`) => `void`

#### Type declaration

▸ (`player`, `newVoiceChannel`, `oldVoiceChannel`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `player` | [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md) |
| `newVoiceChannel` | `string` |
| `oldVoiceChannel` | `string` |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:36](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L36)

___

### playerResume

• **playerResume**: (`player`: [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md)) => `void`

#### Type declaration

▸ (`player`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `player` | [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md) |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:35](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L35)

___

### queueEnd

• **queueEnd**: (`player`: [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md), `track?`: `any`) => `void`

#### Type declaration

▸ (`player`, `track?`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `player` | [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md) |
| `track?` | `any` |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:32](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L32)

___

### socketClosed

• **socketClosed**: (`player`: [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md), `track`: `any`) => `void`

#### Type declaration

▸ (`player`, `track`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `player` | [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md) |
| `track` | `any` |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:41](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L41)

___

### trackEnd

• **trackEnd**: (`player`: [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md), `track`: `any`, `payload?`: `any`) => `void`

#### Type declaration

▸ (`player`, `track`, `payload?`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `player` | [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md) |
| `track` | `any` |
| `payload?` | `any` |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:29](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L29)

___

### trackError

• **trackError**: (`player`: [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md), `track`: `any`) => `void`

#### Type declaration

▸ (`player`, `track`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `player` | [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md) |
| `track` | `any` |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:31](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L31)

___

### trackStart

• **trackStart**: (`player`: [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md), `current`: `any`) => `void`

#### Type declaration

▸ (`player`, `current`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `player` | [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md) |
| `current` | `any` |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:28](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L28)

___

### trackStuck

• **trackStuck**: (`player`: [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md), `track`: `any`) => `void`

#### Type declaration

▸ (`player`, `track`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `player` | [`MoonlinkPlayer`](../classes/MoonlinkPlayer.md) |
| `track` | `any` |

##### Returns

`void`

#### Defined in

[src/@Managers/MoonlinkManager.ts:30](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Managers/MoonlinkManager.ts#L30)
