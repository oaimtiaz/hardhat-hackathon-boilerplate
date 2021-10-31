buyOrders = [];
sellOrders = [];

const O_WALLET = "abcxyz";
let orderId = 0;
const order = {
  walletAddress: "",
  id: "",
  quantity: 0,
  price: 0,
  orderId: -1,
};

//Create a new order with the wallet address, creator ID, quantity, and price
function createOrder(walletAddress, creatorId, quantity, price) {
  let tmp = Object.create(order);
  tmp.walletAddress = walletAddress;
  tmp.id = creatorId;
  tmp.quantity = quantity;
  tmp.price = price;
  tmp.orderId = ++orderId;
  return tmp;
}

function addBuyOrder(buyer, creatorId, quantity, price) {
  let order = createOrder(buyer, creatorId, quantity, price);
  buyOrders[buyOrders.length] = order;
  //Take eth from buyer's wallet to our wallet
  transferEth(buyer, O_WALLET, quantity);
  //Attempt Matching
  match();
  return {
    orderId: order.orderId,
    filled: true,
  };
}

function addSellOrder(seller, creatorId, quantity, price) {
  let order = createOrder(seller, creatorId, quantity, price);
  sellOrders[sellOrders.length] = order;
  //Transfer NFT from wallet to our wallet
  transferNFT(seller, O_WALLET, quantity);
  //Attempt Matching
  match();
}

function transferNFT(from, to, quantity) {}

function transferEth(from, to, amount) {}

/*
Attempt matching.
Takes first element of buyOrders and first element of sellOrders and reduces their quantity by the smallest amount.
If the quantity is 0, remove the order from the list.
If successful, transfer NFT from buyer's wallet to our wallet
*/
function match() {
  let res = "";
  while (buyOrders.length > 0 && sellOrders.length > 0) {
    let buyOrder = buyOrders[0];
    let sellOrder = sellOrders[0];

    //  let quantityLeft = buyOrder.quantity;
    let quantity = Math.min(buyOrder.quantity, sellOrder.quantity);
    let price = buyOrder.price;
    if (quantity > 0) {
      //Transfer NFT from our wallet to buyer's wallet
      transferNFT(O_WALLET, buyOrder.walletAddress, quantity);
      //Transfer eth from our wallet to seller's wallet
      transferEth(O_WALLET, sellOrder.walletAddress, price);
      buyOrder.quantity -= quantity;
      sellOrder.quantity -= quantity;
      if (buyOrder.quantity == 0) {
        buyOrders.shift();
        res = "Your order was filled!";
      }
      if (sellOrder.quantity == 0) {
        sellOrders.shift();
      }
    }
  }
}
