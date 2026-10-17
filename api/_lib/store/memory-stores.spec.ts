import { createMemoryStores } from './memory';
import { describeStores } from './stores.contract';

describeStores('mémoire', async () => createMemoryStores());
