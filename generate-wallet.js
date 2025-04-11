const { Wallet } = require("ethers");

const wallet = Wallet.createRandom();

console.log("One Time Private key: ", wallet.privateKey);
console.log("Wallet Address: ", wallet.address);
