require("dotenv").config();
const API_URL = process.env.API_URL;
const PUBLIC_KEY = process.env.PUBLIC_KEY2;
const PUBLIC_KEY_TO = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY2;
const PRIVATE_KEY_TO = process.env.METAMASK_PRIVATE_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const { ethers } = require("hardhat");
const web3 = createAlchemyWeb3(API_URL);
const contract = require("../artifacts/contracts/MyNFT.sol/MyNFT.json");
const tranContract = require("../artifacts/contracts/Token.sol/Token.json");

const contractAddress = "0xb5a013E5bDF0244A71198Dc693d32cE642fF09Fe";
const transferContractAddress = "0x94f30B09653985d198Eb162905D343A91de47d79";

const nftContract = new web3.eth.Contract(contract.abi, contractAddress);

// Used to add tokens to balances within smart contract for a specific account
// Mint tokens for a specific account's public key
async function mintTokens(
  numTokens,
  fromPrivateKey = PRIVATE_KEY,
  toPublicKey = PUBLIC_KEY_TO
) {
  let provider = ethers.getDefaultProvider("ropsten");
  let wallet = new ethers.Wallet(fromPrivateKey);
  let walletSigner = wallet.connect(provider);

  let transferContract = new ethers.Contract(
    transferContractAddress,
    tranContract.abi,
    walletSigner
  );

  transferContract
    .mintTokens(numTokens, toPublicKey)
    .then((result) => console.log(result));
}

// Used to transfer tokens from one account to another, when selling or buying NFTs
// Your own private key, and someone else's public key
async function transferTokens(
  numTokens,
  fromPrivateKey = PRIVATE_KEY,
  transferToPublicKey = PUBLIC_KEY_TO
) {
  let provider = ethers.getDefaultProvider("ropsten");
  let wallet = new ethers.Wallet(fromPrivateKey);
  let walletSigner = wallet.connect(provider);

  // general token send
  let transferContract = new ethers.Contract(
    transferContractAddress,
    tranContract.abi,
    walletSigner
  );

  let overrides = {
    gasLimit: 750000,
  };

  // Send tokens
  // Cannot use msg.sender in smart contract
  transferContract
    .transfer(transferToPublicKey, numTokens, overrides)
    .then((result) => console.log(result));
}

// Our own account will be used to mint NFTs. No other account should be able to do this right now
// Any content creators will come to us to mint NFTs. The public key will be the content creator's
// Mint tokens for a specific account w/ public key specified
async function mintNFT(tokenURI, publicAccountKey = PUBLIC_KEY) {
  const nonce = await web3.eth.getTransactionCount(publicAccountKey, "latest"); //get latest nonce

  //the transaction
  const tx = {
    from: publicAccountKey,
    to: contractAddress,
    nonce: nonce,
    gas: 1000000,
    data: nftContract.methods.mintNFT(publicAccountKey, tokenURI).encodeABI(),
  };

  const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log(
              "The hash of your transaction is: ",
              hash,
              "\nCheck Alchemy's Mempool to view the status of your transaction!"
            );
          } else {
            console.log(
              "Something went wrong when submitting your transaction:",
              err
            );
          }
        }
      );
    })
    .catch((err) => {
      console.log(" Promise failed:", err);
    });
}

// transferTokens(1);

// mintNFT(
//   "https://gateway.pinata.cloud/ipfs/QmSLKSvWrc9Ma3119LsRxA8Pcj9Sm2jcMn7QWnAxfpVBqe"
// );

module.exports = mintTokens;
module.exports = mintNFT;
module.exports = transferTokens;

// mintTokens(100);
transferTokens(1);
