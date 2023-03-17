class MoonlinkTrack {
	constructor(data, request) {
		
		this.position = data.info.position
		this.title = data.info.title
		this.author = data.info.author
		this.url = data.info.uri
		this.identifier = data.info.identifier
		this.duration = data.info.length
		this.isSeekable = data.info.isSeekable
		this.track = data.encodedTrack ? data.encodedTrack : data.track
		this.source = data.info.sourceName || undefined 
        this.requester = undefined
	}
        get thumbnail() {
            if(this.source === 'youtube') return `https://img.youtube.com/vi/${this.identifier}/sddefault.jpg`
        }
}
module.exports = { MoonlinkTrack }
