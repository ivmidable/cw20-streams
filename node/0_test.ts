import { SigningCosmWasmClient, Secp256k1HdWallet, GasPrice, Coin } from "cosmwasm";

import * as fs from 'fs';
import axios from 'axios';
import { ClientRequest } from "http";
import assert from "assert";

const rpcEndpoint = "https://rpc.uni.juno.deuslabs.fi";

//CODING CHALLENGE, add wasm files.
const _wasm = fs.readFileSync("../artifacts/cw20_base.wasm");

const mnemonic =
    "test peanut elevator motor proud globe obtain gasp sad balance nature ladder";

//CODING CHALLENGE, update code id's once contracts have been uploaded.
const code_id = 0;

//CODING CHALLENGE, update contract address once contracts have been instantiated.
const contract_address = "";

async function setupClient(mnemonic: string, rpc: string, gas: string | undefined): Promise<SigningCosmWasmClient> {
    if (gas === undefined) {
        let wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'juno'});
        let client = await SigningCosmWasmClient.connectWithSigner(rpc, wallet);
        return client;
    } else {
        let gas_price = GasPrice.fromString(gas);
        let wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'juno' });
        let client = await SigningCosmWasmClient.connectWithSigner(rpc, wallet, { gasPrice: gas_price });
        return client;
    }
}

async function getAddress(mnemonic: string, prefix: string = 'juno') {
    let wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix });
    let accounts = await wallet.getAccounts();
    return accounts[0].address;
}

describe("cw-streams Fullstack Test", () => {
    xit("Generate Wallet", async () => {
        let wallet = await Secp256k1HdWallet.generate(12);
        console.log(wallet.mnemonic);
    });

    xit("Get Address", async() => {
        console.log(await getAddress(mnemonic));
    }).timeout(200000);

    xit("Get Testnet Tokens", async () => {
        //let wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'juno' });
        //console.log(await wallet.getAccounts());
        console.log(await getAddress(mnemonic));
        try {
            let res = await axios.post("https://faucet.uni.juno.deuslabs.fi/credit", { "denom": "ujunox", "address": await getAddress(mnemonic) });
            console.log(res);
        } catch (e) {
            console.log(e);
        }
    }).timeout(100000);

    xit("Send Testnet Tokens", async () => {
        let client = await setupClient(mnemonic, rpcEndpoint, "0.025ujunox");
        let receiver = "";
        let res = await client.sendTokens(await getAddress(mnemonic), receiver, [{denom:"ujunox", amount:"1000000"}], "auto");
        console.log(res);
    }).timeout(100000);

    //same as
    //junod tx wasm store artifacts/messages.wasm --from wallet --node https://rpc.uni.juno.deuslabs.fi --chain_id=uni-3 --gas-price=0.025ujunox --gas auto
    xit("Upload code to testnet", async () => {
        let client = await setupClient(mnemonic, rpcEndpoint, "0.025ujunox");
        let res = await client.upload(await getAddress(mnemonic), _wasm, "auto");
        //calculateFee()
        console.log(JSON.stringify(res.logs[0].events));
    }).timeout(100000);

    xit("Instantiate code on testnet", async () => {
        let client = await setupClient(mnemonic, rpcEndpoint, "0.025ujunox");
        let res = await client.instantiate(await getAddress(mnemonic), code_id, { }, "messages", "auto");
        console.log(res);
    }).timeout(100000);

    //Coding challenge, add tests for the rest of the contract.
    //Struct for cw20-base instantiation
    /*pub struct InstantiateMsg {
        pub name: String,
        pub symbol: String,
        pub decimals: u8,
        pub initial_balances: Vec<Cw20Coin>,
        pub mint: Option<MinterResponse>,
        pub marketing: Option<InstantiateMarketingInfo>,
    }*/

    //Struct for cw20-streams instantiation
    /*pub struct InstantiateMsg {
        pub owner: Option<String>,
        pub cw20_addr: String,
    }*/

    //Struct for cw20-streams create_stream
    // REMEMBER you must use cw20's send execute message to create a stream!
    /*CreateStream {
        recipient: String,
        start_time: u64,
        end_time: u64,
    }*/

});