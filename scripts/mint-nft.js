require("dotenv").config();
const API_URL = process.env.API_URL;
const PUBLIC_KEY = process.env.PUBLIC_KEY2;
const PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY2;
const PRIVATE_KEY_TO = process.env.METAMASK_PRIVATE_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const { ethers } = require("hardhat");
const web3 = createAlchemyWeb3(API_URL);
const contract = require("../artifacts/contracts/MyNFT.sol/MyNFT.json");
const tranContract = require("../artifacts/contracts/Token.sol/Token.json");

const contractAddress = "0xb5a013E5bDF0244A71198Dc693d32cE642fF09Fe";
const transferContractAddress = "0x146a4989EE3bC6897Cf6c235BFd290A89dC23E7C";

const nftContract = new web3.eth.Contract(contract.abi, contractAddress);

async function mintTokens(numTokens) {
  let provider = ethers.getDefaultProvider("ropsten");
  let wallet = new ethers.Wallet(PRIVATE_KEY);
  let walletSigner = wallet.connect(provider);

  let transferContract = new ethers.Contract(
    transferContractAddress,
    tranContract.abi,
    walletSigner
  );

  transferContract.mintTokens(numTokens).then((result) => console.log(result));
}

async function transferTokens(numTokens) {
  let provider = ethers.getDefaultProvider("ropsten");
  let wallet = new ethers.Wallet(PRIVATE_KEY);
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
  transferContract
    .transfer(PUBLIC_KEY_TO, numTokens, overrides)
    .then((result) => console.log(result));
}

async function mintNFT(tokenURI, publicAccountKey = PUBLIC_KEY) {
  const nonce = await web3.eth.getTransactionCount(publicAccountKey, "latest"); //get latest nonce

  //the transaction
  const tx = {
    from: publicAccountKey,
    to: contractAddress,
    nonce: nonce,
    gas: 1000000,
    data: nftContract.methods.mintNFT(PUBLIC_KEY, tokenURI).encodeABI(),
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

mintNFT(
  "https://gateway.pinata.cloud/ipfs/QmSLKSvWrc9Ma3119LsRxA8Pcj9Sm2jcMn7QWnAxfpVBqe"
);

module.exports = mintTokens;
module.exports = mintNFT;
module.exports = transferTokens;
