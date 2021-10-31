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
const transferContractAddress = "0x709E979E5A2d152a3f2c432b59c4884A7162b489";

const nftContract = new web3.eth.Contract(contract.abi, contractAddress);

// Used to add tokens to balances within smart contract for a specific account
// Mint tokens for a specific account's public key, using our own original account
async function mintTokens(numTokens, toPublicKey = PUBLIC_KEY) {
  let provider = ethers.getDefaultProvider("ropsten");
  let wallet = new ethers.Wallet(PRIVATE_KEY);
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
  console.log(fromPrivateKey);
  console.log(transferToPublicKey);
  console.log(numTokens);
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
    gasLimit: 100000,
  };

  // Send tokens
  // Cannot use msg.sender in smart contract
  const result = await transferContract.transfer(
    transferToPublicKey,
    numTokens,
    overrides
  );
  return result;
}

async function transferEth(
  amountEth,
  fromPrivateKey = PRIVATE_KEY,
  fromPublicKey = PUBLIC_KEY,
  transferToPublicKey = PUBLIC_KEY_TO
) {
  let provider = ethers.getDefaultProvider("ropsten");
  let wallet = new ethers.Wallet(fromPrivateKey);
  let walletSigner = wallet.connect(provider);

  const currGasPriceHex = await provider.getGasPrice();
  let currGasPrice = ethers.utils.hexlify(parseInt(currGasPriceHex));

  const tx = {
    from: fromPublicKey,
    to: transferToPublicKey,
    value: ethers.utils.parseEther(`${amountEth}`),
    nonce: provider.getTransactionCount(fromPublicKey, "latest"),
    gasLimit: ethers.utils.hexlify(100000), // 100000
    gasPrice: currGasPrice,
  };

  try {
    const transaction = await walletSigner.sendTransaction(tx);
    console.log("sending finished");
    return transaction;
  } catch (error) {
    console.log(error);
    return null;
  }
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

// mintNFT(
//   "https://gateway.pinata.cloud/ipfs/QmSLKSvWrc9Ma3119LsRxA8Pcj9Sm2jcMn7QWnAxfpVBqe"
// );

module.exports.mintTokens = mintTokens;
module.exports.mintNFT = mintNFT;
module.exports.transferTokens = transferTokens;
module.exports.transferEth = transferEth;

// transferEth(0.1);
// mintTokens(100);
