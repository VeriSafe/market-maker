pragma solidity ^0.5.2;

interface Token {
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract onlyOwner {
  address public owner;
  /** 
  * @dev The Ownable constructor sets the original `owner` of the contract to the sender
  * account.
  */
  constructor() public {
    owner = msg.sender;
  }
  modifier isOwner {
    require(msg.sender == owner);
    _;
  }
}

contract SwapDistributor is onlyOwner{

  Token token;
  address distTokens;

  constructor() public{
      address _contract = 0xBA3a79D758f19eFe588247388754b8e4d6EddA81;
      distTokens = _contract;
      token = Token(_contract);
  }
  
  function setTokenContract(address _contract) isOwner public{
      distTokens = _contract;
      token = Token(_contract);
  } 
  
  function getTokenContract() public view returns(address){
      return distTokens;
  }
  /**
   * @dev Values must be in the minimal unit (in wei in case of 18 decimals)
   * 
   * **/
  function sendAmount(address[] memory _users, uint256[] memory _values) isOwner public returns(bool){
    require(_users.length == _values.length, "Lenght of users and values must be equal");
    uint256 total_balance = 0;
    for(uint i=0; i< _values.length; i++){
       total_balance = total_balance + _values[i];
	}
	require(token.balanceOf(address(this)) >= total_balance, "Distributor balance needs to be higher than total distributed values");
    
	for(uint i=0; i< _users.length; i++){
       token.transfer(_users[i], _values[i]);
	}
    return true;
  }
    /**
   * @dev Values must be in the minimal unit (in wei in case of 18 decimals). Set the allowance to the contract be
   * able to do the transfer
   * 
   * **/
  function sendAmountAllowance(address[] memory _users, uint256[] memory _values) public returns(bool){
    require(_users.length == _values.length, "Lenght of users and values must be equal");
    require(msg.sender != address(0));
    uint256 total_balance = 0;
    for(uint i=0; i< _values.length; i++){
       total_balance = total_balance + _values[i];
	}
	require(token.balanceOf(msg.sender) >= total_balance, "Sender balance needs to be higher than total distributed values");
    require(token.allowance(msg.sender, address(this)) >= total_balance, "Allowance balance to the distributor needs to be higher than total distributed values");
	for(uint i=0; i< _users.length; i++){
       token.transferFrom(msg.sender, _users[i], _values[i]);
	}
    return true;
  }
  /**
   * @dev Use this if your token is different from the one supported natively in this contract, set the allowance for the token
   * contract you use here
   * 
   * **/
  function sendAllowanceFromToken(address[] memory _users, uint256[] memory _values, address _contract) public returns(bool){
    Token _token = Token(_contract);
    require(_users.length == _values.length, "Lenght of users and values must be equal");
    require(msg.sender != address(0));
    uint256 total_balance = 0;
    for(uint i=0; i< _values.length; i++){
       total_balance = total_balance + _values[i];
	}
	require(_token.balanceOf(msg.sender) >= total_balance, "Sender balance needs to be higher than total distributed values");
    require(_token.allowance(msg.sender, address(this)) >= total_balance, "Allowance balance to the distributor needs to be higher than total distributed values");
	for(uint i=0; i< _users.length; i++){
       _token.transferFrom(msg.sender, _users[i], _values[i]);
	}
    return true;
  }
  
  
  
  function returnAmount() isOwner public returns(bool){
        token.transfer(owner, token.balanceOf(address(this)));
  }
 
}