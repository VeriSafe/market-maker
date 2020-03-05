import * as fs from 'fs';
import Web3 from 'web3';
import { PRIVATE_KEY, RPC_URL } from '../data/config';
import { VSFAddress, currentEpochId, rewardsDistributorContract } from '../data/constants';

const distributor_abi = JSON.parse(fs.readFileSync('src/abi/distributor_abi.json', 'utf8'));
const web3 = new Web3(RPC_URL);

const privateKey = PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

const contract = new web3.eth.Contract(distributor_abi, rewardsDistributorContract);

const rewards = JSON.parse(fs.readFileSync(`vsf_rewards_${currentEpochId}.json`, 'utf8'));

const addresses = rewards.map((v: any[]) => v[0]);
const values = rewards.map((v: { vsf: any }[]) => v[1].vsf);

export const rewardsDistributor = async () => {
    const gasAmount = await contract.methods
        .sendAllowanceFromToken(addresses, values, VSFAddress)
        .estimateGas({ from: account.address, gas: 7000000 });
    const block = await web3.eth.getBlock('latest');
    console.log('gasLimit: ' + block.gasLimit);
    console.log(`Gas Amount estimated: ${gasAmount}`);
    if (block.gasLimit < gasAmount) {
        console.log('higher than block gas limit');
    }
    contract.methods
        .sendAllowanceFromToken(addresses, values, VSFAddress)
        .send({
            from: account.address,
            gas: 7000000,
            gasPrice: '5000000000',
            // gasLimit: 7000000,
        })
        .on('receipt', (receipt: { transactionHash: any }) => {
            console.log('receipt');
            console.log(receipt.transactionHash);
        })
        .on('error', (error: any) => {
            console.log('error');
            console.log(error);
        });
};
