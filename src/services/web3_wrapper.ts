import { RPCSubprovider, Web3ProviderEngine } from '@0x/subproviders';
import { providerUtils } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';

import { RPC_URL } from '../data/config';

let web3Wrapper: Web3Wrapper | null = null;
export const getWeb3Wrapper = () => {
    if (!web3Wrapper) {
        const provider = new Web3ProviderEngine();
        provider.addProvider(new RPCSubprovider(RPC_URL));
        providerUtils.startProviderEngine(provider);
        web3Wrapper = new Web3Wrapper(provider);
        return web3Wrapper;
    } else {
        return web3Wrapper;
    }
};

export const deleteWeb3Wrapper = () => {
    web3Wrapper = null;
};
