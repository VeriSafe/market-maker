import { CHAIN_ID } from './config';
import { BigNumber } from '@0x/utils';

// To be changed according to actual moment
export const VSFprice = new BigNumber(0.0000001);
// Minimal number of fees
export const MinOrders = 10;

export const currentEpochId = 10;

// add here addresses registered on market maker program
export const whitelistedAddresses = [''];

// Veridex exchange address
export const feeRecipientAddress = '0x5265Bde27F57E738bE6c1F6AB3544e82cdc92a8f';

const getVSFAddressFromChainID = (chainId: number) => {
    switch (chainId) {
        case 1:
            return '0xac9ce326e95f51b5005e9fe1dd8085a01f18450c';
        case 3:
            return '0xba3a79d758f19efe588247388754b8e4d6edda81';
        default:
            return '0xac9ce326e95f51b5005e9fe1dd8085a01f18450c';
    }
};

export const VSFAddress = getVSFAddressFromChainID(CHAIN_ID);

const getDistributorContractFromChainID = (chainId: number) => {
    switch (chainId) {
        case 1:
            return '0x85cff7889982cd0b17de498c8ed0994918db7a99';
        case 3:
            return '0x11b725f52e6c225ba4316003Ae72b483D6261F27';
        default:
            return '0x85cff7889982cd0b17de498c8ed0994918db7a99';
    }
};

export const rewardsDistributorContract = getDistributorContractFromChainID(CHAIN_ID);
