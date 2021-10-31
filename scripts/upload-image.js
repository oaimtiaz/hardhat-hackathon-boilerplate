const pinataSDK = require("@pinata/sdk");
require("dotenv").config();
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

const pinata = pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

import { mintNFT, mintTokens } from "./mint-nft";

const fs = require("fs");

const uploadImageAndMintNFT = (
  file,
  fileName,
  tokenNumber,
  contentCreatorPublicKey
) => {
  const readableStreamForFile = fs.createReadStream(file);
  const options = {
    pinataMetadata: {
      name: fileName,
    },
    pinataOptions: {
      cidVersion: 0,
    },
  };

  pinata
    .pinFileToIPFS(readableStreamForFile, options)
    .then((result) => {
      //handle results here
      console.log(result);
      const cidNumber = result.IpfsHash;
      const url = `https://gateway.pinata.cloud/ipfs/${cidNumber}`;
      const description = `Token number: ${tokenNumber} - for content creator ${fileName}`;
      const jsonToPin = {
        name: fileName,
        image: url,
        description: description,
      };

      const JSONOptions = {
        pinataMetadata: {
          name: `${fileName} JSON ${tokenNumber}`,
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };

      pinata.pinJSONToIPFS(jsonToPin, JSONOptions).then((jsonResult) => {
        console.log(jsonResult);
        const jsonCidNumber = jsonResult.IpfsHash;
        const jsonUrl = `https://gateway.pinata.cloud/ipfs/${jsonCidNumber}`;
        mintNFT(jsonUrl, contentCreatorPublicKey);
        mintTokens(1);
      });
    })
    .catch((err) => {
      //handle error here
      console.log(err);
      // console.log(err);
    });
};

uploadImageAndMintNFT("./image2.png", "image2", 3);
