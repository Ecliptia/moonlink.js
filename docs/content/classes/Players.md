# Class: PlayerManager

## Table of contents

### Constructors

- [constructor](PlayerManager.md#constructor)

### Methods

- [init](PlayerManager.md#init)
- [handleVoiceServerUpdate](PlayerManager.md#handlevoiceserverupdate)
- [handlePlayerDisconnect](PlayerManager.md#handleplayerdisconnect)
- [handlePlayerMove](PlayerManager.md#handleplayermove)
- [updateVoiceStates](PlayerManager.md#updatevoicestates)
- [attemptConnection](PlayerManager.md#attemptconnection)
- [has](PlayerManager.md#has)
- [get](PlayerManager.md#get)
- [create](PlayerManager.md#create)
- [delete](PlayerManager.md#delete)

## Constructors

### constructor

• **new PlayerManager**(): [`PlayerManager`](PlayerManager.md)

Creates a new instance of PlayerManager.

#### Returns

[`PlayerManager`](PlayerManager.md) - The created instance of PlayerManager.

## Methods

### init

▸ **init**(): `void`

Initializes the PlayerManager instance.

#### Returns

`void`

### handleVoiceServerUpdate

▸ **handleVoiceServerUpdate**(`update`: `any`, `guildId`: `string`): `void`

Handles voice server updates.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `update` | `any` | Voice server update data. |
| `guildId` | `string` | ID of the guild. |

#### Returns

`void`

### handlePlayerDisconnect

▸ **handlePlayerDisconnect**(`guildId`: `string`): `void`

Handles player disconnection.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `guildId` | `string` | ID of the guild. |

#### Returns

`void`

### handlePlayerMove

▸ **handlePlayerMove**(`newChannelId`: `string`, `oldChannelId`: `string`, `guildId`: `string`): `void`

Handles player movement between voice channels.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `newChannelId` | `string` | ID of the new voice channel. |
| `oldChannelId` | `string` | ID of the old voice channel. |
| `guildId` | `string` | ID of the guild. |

#### Returns

`void`

### updateVoiceStates

▸ **updateVoiceStates**(`guildId`: `string`, `update`: `any`): `void`

Updates voice states.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `guildId` | `string` | ID of the guild. |
| `update` | `any` | Voice state update data. |

#### Returns

`void`

### attemptConnection

▸ **attemptConnection**(`guildId`: `string`): `Promise`<`boolean`>

Attempts a connection to a voice channel.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `guildId` | `string` | ID of the guild. |

#### Returns

`Promise`<`boolean`> - A promise resolving to a boolean indicating whether the connection attempt was successful.

### has

▸ **has**(`guildId`: `string`): `boolean`

Checks if a player exists for a guild.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `guildId` | `string` | ID of the guild. |

#### Returns

`boolean` - Indicates whether a player exists for the guild.

### get

▸ **get**(`guildId`: `string`): `MoonlinkPlayer` | `null`

Gets the player instance for a guild.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `guildId` | `string` | ID of the guild. |

#### Returns

`MoonlinkPlayer` | `null` - The player instance for the guild, or null if not found.

### create

▸ **create**(`data`: `createOptions`): `MoonlinkPlayer`

Creates a new player instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `createOptions` | Options for creating the player. |

#### Returns

`MoonlinkPlayer` - The created player instance.

### delete

▸ **delete**(`guildId`: `string`): `void`

Deletes a player instance for a guild.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `guildId` | `string` | ID of the guild. |

#### Returns

`void`
