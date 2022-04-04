const { assert } = require("chai");

// eslint-disable-next-line no-undef
const DappToken = artifacts.require("DappToken");
// eslint-disable-next-line no-undef
const DaiToken = artifacts.require("DaiToken");
// eslint-disable-next-line no-undef
const TokenFarm = artifacts.require("TokenFarm");

require("chai")
  .use(require("chai-as-promised"))
  .should();

// helper function, to avoid writing very large number (1000000e18) many times
function tokens(n) {
  // eslint-disable-next-line no-undef
  return web3.utils.toWei(n, "Ether");
}

// eslint-disable-next-line no-undef
contract("TokenFarm", ([owner, investor]) => {
  let daiToken;
  let dappToken;
  let tokenFarm;

  // eslint-disable-next-line no-undef
  before(async () => {
    //load Contracts
    daiToken = await DaiToken.new();
    dappToken = await DappToken.new();
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

    // transfer all the DappTokens to the tokenFarm contract (1 million)
    await dappToken.transfer(tokenFarm.address, tokens("1000000"));

    // transfer 100 Mock Dai Tokens to the investor,  investor is accounts[1]
    await daiToken.transfer(investor, tokens("100"), { from: owner });
  });

  describe("Mock DAI deployment", async () => {
    it("has a name", async () => {
      const name = await daiToken.name();
      assert.equal(name, "Mock DAI Token");
    });
  });
  describe("Dapp Token deployment", async () => {
    it("has a name", async () => {
      const name = await dappToken.name();
      assert.equal(name, "DApp Token");
    });
  });
  describe("Token Farm deployment", async () => {
    it("has a name", async () => {
      const name = await tokenFarm.name();
      assert.equal(name, "Dapp Token Farm");
    });

    it("has all the tokens (1 M. Dapp Token)", async () => {
      const balanceWei = await dappToken.balanceOf(tokenFarm.address);
      // eslint-disable-next-line no-undef
      const balance = web3.utils.fromWei(balanceWei);
      assert.equal(balance, "1000000");
    });
  });

  describe("Farming Tokens", async () => {
    it("rewards investors for staking mDai Tokens", async () => {
      let result;

      //check investor's balance, before staking
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "investor mockDai Wallet is correct, before staking"
      );

      // stake mock Dai Token to the smart contract
      await daiToken.approve(tokenFarm.address, tokens("100"), {
        from: investor,
      });
      await tokenFarm.stakeTokens(tokens("100"), { from: investor });

      //check staking result
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("0"),
        "investor mockDai Wallet is correct, after staking"
      );

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        tokens("100"),
        "tokenFarm mockDai Wallet is correct, after staking"
      );

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "stakingBalance is correct, after staking"
      );

      result = await tokenFarm.isStaking(investor);
      assert.equal(
        result.toString(),
        "true",
        "isStaking is true, after staking"
      );
      
      //test for issuing tokens
      // call issueToken func. as if from owner, to issue tokens
      await tokenFarm.issueTokens( {from: owner} );
      // ckeck whether balance of the investor after issuance
      result = await dappToken.balanceOf(investor); 
      assert.equal(
        result.toString(), 
        tokens("100"), 
        "the balance of investor should be 100 after issuance" 
        );

        //ensure that only owner can call the issueToken function
        await tokenFarm.issueTokens( {from: investor} ).should.be.rejected;
      
      // test for unstaking tokens:
      // unstake tokens
      await tokenFarm.unstakeTokens( { from: investor});

      // check the new balances after unstaking, for investor, in dai
      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(), tokens("100"), "the mock DAI balance of investor should be 100 after unstaking");
      // daiToken balance of tokenFarm
      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(result.toString(), tokens("0"), "the daiToken balance of tokenFarm should be 0 after unstaking");
      // check the new balances after unstaking, for investor, in TokenFarm wallet
      result = await tokenFarm.stakingBalance(investor);
      assert.equal(result.toString(), tokens("0"), "the tokenFarm balance of investor should be 0 after unstaking");
      // check the isStaking status is false
      result = await tokenFarm.isStaking(investor);
      assert.equal(result.toString(), 'false', "isStaking should be zero" );
    });
  });


}); //end of contract() function
