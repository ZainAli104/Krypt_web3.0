require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.9",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/6n4YfGq5jgr3UcptRugwqeuxQeGXl2z6",
      accounts: ['3ce5071a192cb04606bd9aa10bd3fdd0df36bf71a709b2dd5beb6372e240dc0d']
    }
  }
};
