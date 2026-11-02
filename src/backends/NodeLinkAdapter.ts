import { BackendAdapter } from './BackendAdapter';

export class NodeLinkAdapter extends BackendAdapter {
    public readonly kind = 'nodelink' as const;
}
