var express = require("express");
var matcher = require("../service/matcher");
var router = express.Router();
const nftFunctions = require("../scripts/upload-image");
// const image = require("./image2.png");
// import { uploadImageAndMintNFT } from "../scripts/upload-image";

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/buy", async (req, res) => {
  //   const image = req.body.file;
  const retVal = await nftFunctions.uploadImageAndMintNFT(
    "./image2.png",
    "Image 2",
    1
  );
  console.log(retVal);
  //Add message giving status update !!
  res.json(retVal);
});

router.post("/sell", (req, res) => {
  out = matcher.addSellOrder(
    req.body.walletId,
    req.body.creatorId,
    req.body.quantity,
    req.body.price
  );
  res.send("ok");
});

module.exports = router;

// console.log(functs);
// functs.uploadImageAndMintNFT("./image2", "Image 2", 1);
