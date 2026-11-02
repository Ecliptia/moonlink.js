import { BackendAdapter } from './BackendAdapter';

export class LavalinkAdapter extends BackendAdapter {
    public readonly kind = 'lavalink' as const;
}
