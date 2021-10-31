var express = require("express");
var matcher = require("../service/matcher");
var router = express.Router();
const nftFunctions = require("../scripts/upload-image");
const minting = require("../scripts/mint-nft");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/mint", async (req, res) => {
  const retVal = await nftFunctions.uploadImageAndMintNFT(
    "./image2.png",
    "Image 2",
    1
  );
  console.log(retVal);
  //Add message giving status update !!
  res.json(retVal);
});

router.post("/buy", async (req, res) => {
  const senderPrivateKey = req.body.senderPrivate;
  const senderPublicKey = req.body.senderPublic;
  const receiverPublicKey = req.body.receiverPublic;
  const numTokens = req.body.numTokens;
  const tokenResult = minting.transferTokens(
    numTokens,
    senderPrivateKey,
    receiverPublicKey
  );
  const ethResult = minting.transferEth(
    0.1,
    senderPrivateKey,
    senderPublicKey,
    receiverPublicKey
  );
  //Add message giving status update !!
  res.json({ tokenResult: tokenResult, ethResult: ethResult });
});

router.post("/sell", (req, res) => {
  // Only difference from /buy endpoint is that the parameters should be switched
  const senderPrivateKey = req.body.senderPrivate;
  const senderPublicKey = req.body.senderPublic;
  const receiverPublicKey = req.body.receiverPublic;
  const numTokens = req.body.numTokens;
  const tokenResult = minting.transferTokens(numTokens);
  const ethResult = minting.transferTokens(0.1);
  //Add message giving status update !!
  const tokenResult = minting.transferTokens(
    numTokens,
    senderPrivateKey,
    receiverPublicKey
  );
  const ethResult = minting.transferEth(
    0.1,
    senderPrivateKey,
    senderPublicKey,
    receiverPublicKey
  );
  res.json({ tokenResult: tokenResult, ethResult: ethResult });
  res.send("ok");
});

module.exports = router;
