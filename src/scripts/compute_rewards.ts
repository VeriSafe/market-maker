import * as fs from 'fs';

import { getContractWrappers } from '../services/contract_wrappers';
import { ExchangeFillEventArgs, ExchangeEvents } from '@0x/contract-wrappers';
import { feeRecipientAddress, whitelistedAddresses, currentEpochId, VSFprice, MinOrders } from '../data/constants';
import { epochs } from '../data/epoch';
import { BigNumber } from '@0x/utils';
import { tokenAmountInUnitsToBigNumber, getWethAssetData } from '../utils/tokens';

const currentEpoch = epochs.find(e => e.epochId === currentEpochId);
const fromBlock = (currentEpoch && currentEpoch.fromBlock) || 0;
const toBlock = (currentEpoch && currentEpoch.toBlock) || 0;
// 10 gwei
const vsfPrice = VSFprice;

// minimal orders count to be elegible
const minOrders = MinOrders;

interface feeCollected {
    fee: BigNumber;
    orders: number;
}

interface vsfCollected {
    vsf: string;
}
/**
 * This script computes the rewards o
 */
const computeRewards = async () => {
    const contractWrappers = await getContractWrappers();
    // Note: If too many events, we need to split the blocks in intervals
    // Only events with Veridex fee Recipient Address will be computed
    const events = await contractWrappers.exchange.getLogsAsync<ExchangeFillEventArgs>(
        ExchangeEvents.Fill,
        {
            fromBlock,
            toBlock,
        },
        {
            feeRecipientAddress: feeRecipientAddress,
        },
    );

    const filteredEvents = events.filter(e =>
        // Only whitelisted maker addresses are on the market maker program
        whitelistedAddresses.map(a => a.toLowerCase()).includes(e.args.makerAddress),
    );
    const feeCollectedByMaker = new Map<string, feeCollected>();
    // compute rewards on epoch
    for (const iterator of filteredEvents) {
        if (feeCollectedByMaker.has(iterator.args.makerAddress.toLowerCase())) {
            let wethFee = new BigNumber(0);
            const wethAssetData = getWethAssetData();
            const { takerFeePaid, takerFeeAssetData, protocolFeePaid } = iterator.args;
            if (takerFeePaid.gt(0) && takerFeeAssetData.toLowerCase() === wethAssetData.toLowerCase()) {
                // Note: We are rebating half of the fee
                wethFee = takerFeePaid.dividedBy(2).integerValue();
            }
            const entry = feeCollectedByMaker.get(iterator.args.makerAddress.toLowerCase()) as feeCollected;
            feeCollectedByMaker.set(iterator.args.makerAddress.toLowerCase(), {
                fee: entry.fee.plus(protocolFeePaid).plus(wethFee),
                orders: entry.orders + 1,
            });
        } else {
            let wethFee = new BigNumber(0);
            const wethAssetData = getWethAssetData();
            const { takerFeePaid, takerFeeAssetData, protocolFeePaid } = iterator.args;
            if (takerFeePaid.gt(0) && takerFeeAssetData.toLowerCase() === wethAssetData.toLowerCase()) {
                // Note: We are rebating half of the fee
                wethFee = takerFeePaid.dividedBy(2).integerValue();
            }
            feeCollectedByMaker.set(iterator.args.makerAddress.toLowerCase(), {
                fee: protocolFeePaid.plus(wethFee),
                orders: 1,
            });
        }
    }
    // compute vsf rewards and check if maker has the minimum requirement
    const vsfRewardByMaker = new Map<string, vsfCollected>();
    for (const iterator of feeCollectedByMaker.entries()) {
        const value = iterator[1];
        const address = iterator[0];
        if (value.orders >= minOrders) {
            // ether is 18 decimals
            const ether = tokenAmountInUnitsToBigNumber(value.fee, 18);
            console.log(ether);
            vsfRewardByMaker.set(address, { vsf: ether.dividedBy(vsfPrice).toString() });
        }
    }

    const eventString = JSON.stringify([...vsfRewardByMaker]);
    console.log(eventString);
    fs.writeFile(`files/vsf_rewards_${currentEpochId}.json`, eventString, 'utf8', err => {
        if (err) throw err;
        console.log('The file has been saved!');
    });

    const feeEvents = JSON.stringify([...feeCollectedByMaker]);
    console.log(eventString);
    fs.writeFile(`files/eth_rewards_${currentEpochId}.json`, feeEvents, 'utf8', err => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
};

computeRewards();
