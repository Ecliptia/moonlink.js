import { Track } from '../../index';
export class Queue {
    public tracks: Track[] = [];
    
    public add(track: Track): boolean {
        this.tracks.push(track)
        return true
    } 
}