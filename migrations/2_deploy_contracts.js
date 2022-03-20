// eslint-disable-next-line no-undef
const DappToken = artifacts.require("DappToken");
// eslint-disable-next-line no-undef
const DaiToken = artifacts.require("DaiToken");
// eslint-disable-next-line no-undef
const TokenFarm = artifacts.require("TokenFarm");


module.exports = async function(deployer, network, accounts) {

  await deployer.deploy(DappToken);
  const dappToken = await DappToken.deployed();

  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed();

  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);
  const tokenFarm = await TokenFarm.deployed();

  //transfer all the DappTokens to the tokenFarm contract (1 million)
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')
  
  // transfer 100 Mock Dai Tokens to the investor,  investor is accounts[1]
  await daiToken.transfer(accounts[1], '100000000000000000000')
};
