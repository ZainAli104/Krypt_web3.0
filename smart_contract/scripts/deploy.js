const hre = require("hardhat");

const main = async () => {
  const Transactions = await hre.ethers.getContractFactory("Transactions");
  const Transaction = await Transactions.deploy();

  await Transaction.deployed();

  console.log(`Transactions deployed to ${Transaction.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
