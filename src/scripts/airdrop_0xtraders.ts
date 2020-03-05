import * as fs from 'fs';
import Web3 from 'web3';
import { PRIVATE_KEY, RPC_URL } from '../data/config';
import { VSFAddress, rewardsDistributorContract } from '../data/constants';
import { unitsInTokenAmount } from '../utils/tokens';

const distributor_abi = JSON.parse(fs.readFileSync('src/abi/distributor_abi.json', 'utf8'));
const web3 = new Web3(RPC_URL);

const privateKey = PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
console.log(account.address);

const contract = new web3.eth.Contract(distributor_abi, rewardsDistributorContract);

const zeroxtraders = JSON.parse(fs.readFileSync(`files/0xtraders.json`, 'utf8'));

const zeroxaddresses: string[] = zeroxtraders;

const vsf_amount = '88';

//@ts-ignore
const airdrop = async (addresses: string[], values: string[], nonce: number) => {
    /* const gasAmount = await contract.methods
        .sendAllowanceFromToken(addresses, values, VSFAddress)
        .estimateGas({ from: account.address, gas: 3500000, gasPrice: web3.utils.toWei('1', 'Gwei') });

    const block = await web3.eth.getBlock('latest');
    console.log('gasLimit: ' + block.gasLimit);
    console.log(`Gas Amount estimated: ${gasAmount}`);
    if (block.gasLimit < gasAmount) {
        console.log('higher than block gas limit');
    }*/
    contract.methods
        .sendAllowanceFromToken(addresses, values, VSFAddress)
        .send({
            from: account.address,
            gas: 690000,
            gasPrice: web3.utils.toWei('1', 'Gwei'),
            nonce,
        })
        .on('receipt', (receipt: { transactionHash: any }) => {
            console.log('receipt');
            console.log(receipt.transactionHash);
            const transfers = JSON.parse(fs.readFileSync(`files/0xtransfers_addresses.json`, 'utf8')) as string[];
            const transfers_done = new Set<string>(transfers);
            for (const ad of addresses) {
                transfers_done.add(ad);
            }
            fs.writeFileSync(`files/0xtransfers_addresses.json`, JSON.stringify([...transfers_done]), 'utf8');
        })
        .on('error', (error: any) => {
            console.log('error');
            console.log(error);
        });
};
const max_transfers_pertime = 20;
const total_transfers = Math.round(zeroxaddresses.length / max_transfers_pertime);
//const transactionCount = 69;
console.log(total_transfers);
const run = async () => {
    const transactionCount = await web3.eth.getTransactionCount(account.address);
    let k = 0;
    for (let index = 0; index < total_transfers; index++) {
        setTimeout(() => {
            const a = zeroxaddresses.slice(k * max_transfers_pertime, (k + 1) * max_transfers_pertime);
            const v = a.map(() => unitsInTokenAmount(vsf_amount, 18).toString());
            airdrop(a, v, transactionCount + k + 1);
            k++;
        }, index * 10000);
    }
};

run();
