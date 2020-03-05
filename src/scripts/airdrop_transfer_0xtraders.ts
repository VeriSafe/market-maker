import * as fs from 'fs';
import Web3 from 'web3';
import { PRIVATE_KEY, RPC_URL } from '../data/config';
import { VSFAddress } from '../data/constants';
import { unitsInTokenAmount } from '../utils/tokens';

const erc20_abi = JSON.parse(fs.readFileSync('src/abi/erc20.json', 'utf8'));
console.log(RPC_URL);
const web3 = new Web3(RPC_URL);

const privateKey = PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
console.log(account.address);

const contract = new web3.eth.Contract(erc20_abi, VSFAddress);

const zeroxtraders = JSON.parse(fs.readFileSync(`files/0xtraders.json`, 'utf8'));

const zeroxaddresses: string[] = zeroxtraders;
interface Transfer {
    value: string;
    address: string;
    transactionHash: string;
}

interface TransferError {
    value: string;
    address: string;
    error: boolean;
}

const transfers: Transfer[] = [];
const transfers_pending: Transfer[] = [];
const transfers_error: TransferError[] = [];

const vsf_amount = '88';

let errorCount = 0;
let transferCount = 0;
//@ts-ignore
async function _transfer(address: string, value: string, transaction_count: number) {
    const nonce = (await web3.eth.getTransactionCount(account.address, 'pending')) + 1;
    console.log(`transaction_count: ${transaction_count}`);
    contract.methods
        .transfer(address, value)
        .send({
            from: account.address,
            gas: 38000,
            gasPrice: web3.utils.toWei('1', 'Gwei'),
            nonce,
        })
        .on('transactionHash', (hash: any) => {
            transfers_pending.push({ value: value, address: address, transactionHash: hash });
            const transfersString = JSON.stringify(transfers_pending);
            fs.writeFile('files/transfers_pending.json', transfersString, 'utf8', err => {
                if (err) throw err;
                console.log('The file has been saved!');
            });
        })
        .on('receipt', (receipt: any) => {
            const transferEvent = receipt.events['Transfer'].returnValues;
            transfers.push({
                value: transferEvent.value,
                address: transferEvent.to,
                transactionHash: receipt.transactionHash,
            });
            transferCount++;
            console.log(transferCount);
            const transfersString = JSON.stringify(transfers);
            fs.writeFile('files/transfers_receipt.json', transfersString, 'utf8', err => {
                if (err) throw err;
                console.log('The file has been saved!');
            });
        })
        .on('error', (error: any) => {
            errorCount++;
            console.log(errorCount);
            console.log(error);
            transfers_error.push({ value: value, address: address, error: true });
            const transfersString = JSON.stringify(transfers_error);
            fs.writeFile('files/transfers_error.json', transfersString, 'utf8', err => {
                if (err) throw err;
                console.log('The file has been saved!');
            });
        });
}

async function transfer() {
    const transaction_count = await web3.eth.getTransactionCount(account.address);
    let i = 0;
    let k = 0;
    for (const addr of zeroxaddresses) {
        //  const gasAmount = await contract.methods.transfer(addr, unitsInTokenAmount(vsf_amount, 18).toString()).estimateGas({ from: account.address });
        //   console.log(gasAmount);
        setTimeout(() => {
            _transfer(addr, unitsInTokenAmount(vsf_amount, 18).toString(), transaction_count + k);
            k++;
            console.log(k);
        }, i * 2000);

        i++;
        //console.log(i);
    }
}

try {
    transfer();
} catch (e) {
    console.log(e);
}
