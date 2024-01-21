[moonlink.js](../README.md) / [Exports](../modules.md) / MoonlinkFilters

# Class: MoonlinkFilters

## Table of contents

### Constructors

- [constructor](MoonlinkFilters.md#constructor)

### Properties

- [channelMix](MoonlinkFilters.md#channelmix)
- [distortion](MoonlinkFilters.md#distortion)
- [equalizer](MoonlinkFilters.md#equalizer)
- [karaoke](MoonlinkFilters.md#karaoke)
- [lowPass](MoonlinkFilters.md#lowpass)
- [manager](MoonlinkFilters.md#manager)
- [player](MoonlinkFilters.md#player)
- [rest](MoonlinkFilters.md#rest)
- [rotation](MoonlinkFilters.md#rotation)
- [timescale](MoonlinkFilters.md#timescale)
- [tremolo](MoonlinkFilters.md#tremolo)
- [vibrato](MoonlinkFilters.md#vibrato)
- [volume](MoonlinkFilters.md#volume)

### Methods

- [resetFilters](MoonlinkFilters.md#resetfilters)
- [setChannelMix](MoonlinkFilters.md#setchannelmix)
- [setDistortion](MoonlinkFilters.md#setdistortion)
- [setEqualizer](MoonlinkFilters.md#setequalizer)
- [setKaraoke](MoonlinkFilters.md#setkaraoke)
- [setLowPass](MoonlinkFilters.md#setlowpass)
- [setRotation](MoonlinkFilters.md#setrotation)
- [setTimescale](MoonlinkFilters.md#settimescale)
- [setTremolo](MoonlinkFilters.md#settremolo)
- [setVibrato](MoonlinkFilters.md#setvibrato)
- [setVolume](MoonlinkFilters.md#setvolume)
- [updateFiltersFromRest](MoonlinkFilters.md#updatefiltersfromrest)

## Constructors

### constructor

• **new MoonlinkFilters**(`player`): [`MoonlinkFilters`](MoonlinkFilters.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `player` | `any` |

#### Returns

[`MoonlinkFilters`](MoonlinkFilters.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:33](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L33)

## Properties

### channelMix

• **channelMix**: [`ChannelMix`](../interfaces/ChannelMix.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:30](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L30)

___

### distortion

• **distortion**: [`Distortion`](../interfaces/Distortion.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:29](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L29)

___

### equalizer

• **equalizer**: [`Equalizer`](../interfaces/Equalizer.md)[]

#### Defined in

[src/@Utils/MoonlinkFilters.ts:23](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L23)

___

### karaoke

• **karaoke**: [`Karaoke`](../interfaces/Karaoke.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:24](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L24)

___

### lowPass

• **lowPass**: [`LowPass`](../interfaces/LowPass.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:31](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L31)

___

### manager

• `Private` **manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:20](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L20)

___

### player

• `Private` **player**: [`MoonlinkPlayer`](MoonlinkPlayer.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:19](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L19)

___

### rest

• `Private` **rest**: [`MoonlinkRestFul`](MoonlinkRestFul.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:21](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L21)

___

### rotation

• **rotation**: [`Rotation`](../interfaces/Rotation.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:28](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L28)

___

### timescale

• **timescale**: [`Timescale`](../interfaces/Timescale.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:25](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L25)

___

### tremolo

• **tremolo**: [`Tremolo`](../interfaces/Tremolo.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:26](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L26)

___

### vibrato

• **vibrato**: [`Vibrato`](../interfaces/Vibrato.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:27](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L27)

___

### volume

• **volume**: `number`

#### Defined in

[src/@Utils/MoonlinkFilters.ts:22](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L22)

## Methods

### resetFilters

▸ **resetFilters**(): [`MoonlinkFilters`](MoonlinkFilters.md)

#### Returns

[`MoonlinkFilters`](MoonlinkFilters.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:119](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L119)

___

### setChannelMix

▸ **setChannelMix**(`channelMix`): [`MoonlinkFilters`](MoonlinkFilters.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `channelMix` | [`ChannelMix`](../interfaces/ChannelMix.md) |

#### Returns

[`MoonlinkFilters`](MoonlinkFilters.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:105](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L105)

___

### setDistortion

▸ **setDistortion**(`distortion`): [`MoonlinkFilters`](MoonlinkFilters.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `distortion` | [`Distortion`](../interfaces/Distortion.md) |

#### Returns

[`MoonlinkFilters`](MoonlinkFilters.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:98](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L98)

___

### setEqualizer

▸ **setEqualizer**(`equalizer`): [`MoonlinkFilters`](MoonlinkFilters.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `equalizer` | [`Equalizer`](../interfaces/Equalizer.md)[] |

#### Returns

[`MoonlinkFilters`](MoonlinkFilters.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:56](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L56)

___

### setKaraoke

▸ **setKaraoke**(`karaoke`): [`MoonlinkFilters`](MoonlinkFilters.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `karaoke` | [`Karaoke`](../interfaces/Karaoke.md) |

#### Returns

[`MoonlinkFilters`](MoonlinkFilters.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:63](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L63)

___

### setLowPass

▸ **setLowPass**(`lowPass`): [`MoonlinkFilters`](MoonlinkFilters.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `lowPass` | [`LowPass`](../interfaces/LowPass.md) |

#### Returns

[`MoonlinkFilters`](MoonlinkFilters.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:112](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L112)

___

### setRotation

▸ **setRotation**(`rotation`): [`MoonlinkFilters`](MoonlinkFilters.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rotation` | [`Rotation`](../interfaces/Rotation.md) |

#### Returns

[`MoonlinkFilters`](MoonlinkFilters.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:91](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L91)

___

### setTimescale

▸ **setTimescale**(`timescale`): [`MoonlinkFilters`](MoonlinkFilters.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `timescale` | [`Timescale`](../interfaces/Timescale.md) |

#### Returns

[`MoonlinkFilters`](MoonlinkFilters.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:70](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L70)

___

### setTremolo

▸ **setTremolo**(`tremolo`): [`MoonlinkFilters`](MoonlinkFilters.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `tremolo` | [`Tremolo`](../interfaces/Tremolo.md) |

#### Returns

[`MoonlinkFilters`](MoonlinkFilters.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:77](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L77)

___

### setVibrato

▸ **setVibrato**(`vibrato`): [`MoonlinkFilters`](MoonlinkFilters.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `vibrato` | [`Vibrato`](../interfaces/Vibrato.md) |

#### Returns

[`MoonlinkFilters`](MoonlinkFilters.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:84](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L84)

___

### setVolume

▸ **setVolume**(`volume`): [`MoonlinkFilters`](MoonlinkFilters.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `volume` | `number` |

#### Returns

[`MoonlinkFilters`](MoonlinkFilters.md)

#### Defined in

[src/@Utils/MoonlinkFilters.ts:49](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L49)

___

### updateFiltersFromRest

▸ **updateFiltersFromRest**(): `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/@Utils/MoonlinkFilters.ts:134](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkFilters.ts#L134)
