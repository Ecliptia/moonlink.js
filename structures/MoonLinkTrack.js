class MoonTrack {
	constructor(data, request) {
		if (data.info.thumbnail) this.thumb = data.info.thumbnail
		this.position = data.info.position
		this.title = data.info.title
		this.author = data.info.author
		this.url = data.info.uri
		this.identifier = data.info.identifier
		this.duration = data.info.length
		this.isSeekable = data.info.isSeekable
		this.track = data.track
		this.source = data.info.sourceName || undefined
	}
	get thumbnail() {
		if (this.thumb) return this.thumb
		if (this.source === 'youtube') {
			return `https://img.youtube.com/vi/${this.identifier}/sddefault.jpg`;
		}
		return 'https://media.discordapp.net/attachments/960186492653813862/978653257180254258/IMG_20220523_203520.png'
	}
}
module.exports = { MoonTrack }
