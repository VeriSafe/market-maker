import * as fs from 'fs';
import { unitsInTokenAmount, tokenAmountInUnits } from '../utils/tokens';
import { BigNumber } from '@0x/utils';
import { RPC_URL, PRIVATE_KEY } from '../data/config';
import Web3 from 'web3';

const vsf_amount = '88';
const zeroxtraders = JSON.parse(fs.readFileSync(`files/0xtraders.json`, 'utf8')) as string[];

const vsfAmounts = zeroxtraders.map(() => unitsInTokenAmount(vsf_amount, 18));

const totalVSF = vsfAmounts.reduce((p, c) => p.plus(c)).toString();

const web3 = new Web3(RPC_URL);
const privateKey = PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
web3.eth.getTransactionCount(account.address).then(c => console.log(c));

console.log(web3.utils.toWei('2', 'Gwei'));

console.log(web3.utils.toWei('1.5', 'Gwei'));
console.log(totalVSF);
console.log(tokenAmountInUnits(new BigNumber(totalVSF), 18));
