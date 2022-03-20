pragma solidity >=0.5.0;

import './DaiToken.sol';
import './DappToken.sol';

contract TokenFarm {
    address public owner;
    string public name = 'Dapp Token Farm';
    string public someVar = 'this is for testing';
    DappToken public dappToken;
    DaiToken public daiToken;

    address[] public stakers;
    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // 1. staking Tokens (deposit tokens) - investor deposit dai to the smart contract to earn rewards

    function stakeTokens(uint _amount) public {
        
        // check if _amount is greater than zero
        require(_amount > 0, "the amount should be more than zero.");

        // transfer daiTokens from msg.sender to this smart contract    
        daiToken.transferFrom(msg.sender, address(this), _amount);

        //update the stakingBalance
        stakingBalance[msg.sender] += _amount; 

        // if the msg.sender hasnot staked before, put the sender to the stakers list
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        //update status of hasStaked
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;       
    }

    // 2. issueing tokens (earn interest)

    // investors, who stake daiToken to the tokenFarm, earn dapp token

    function issueToken() public returns (bool) {
        // only the owner of the contract can call this function
        require(msg.sender == owner, "only the owner of the contract can call this function");

        for (uint i = 0; i < stakers.length; i++) {
            address receipent = stakers[i];
            uint balance = stakingBalance[receipent];
            if (balance > 0) {
                dappToken.transfer(receipent, balance);
            }
        }

    }





    // 3. unstaking tokens (withdraw)

}