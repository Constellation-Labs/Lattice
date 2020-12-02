# Aggregator (MVP)

On-chain DEX aggregator based on 1inch protocol

Currently it supports Uniswap V2, Mooniswap, Sushiswap and Lattice's basic swap. More to be added.

## Deployed Contracts
- OneSplitAudit@Ropsten - https://ropsten.etherscan.io/address/0x1d54420AdBe011C3115b72CcB876cFcBD8e3aa59

## How to use it
To swap tokens you need to first call method `getExpectedReturn` (see methods section), it returns `distribution` array. Each element of this array matches element of exchanges and represents fraction of trading volume.<br>
Then call `getExpectedReturnWithGas` to take into account gas when splitting. This method returns more profitable `distribution` array for exchange.<br>
Then call method `swap` with param `distribution` which was recieved earlier from method `getExpectedReturn`.

Swap may be customized by flags.

## Methods

If you need Ether instead of any token use `address(0)` or `address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)` as param `fromToken`/`destToken`

### getExpectedReturn
```
function getExpectedReturn(
    IERC20 fromToken,
    IERC20 destToken,
    uint256 amount,
    uint256 parts,
    uint256 flags
)
    public
    view
    returns(
        uint256 returnAmount,
        uint256[] memory distribution
    )
```

Calculate expected returning amount of desired token

| Params | Type | Description |
| ----- | ----- | ----- |
| fromToken | IERC20 | Address of trading off token |
| destToken | IERC20 | Address of desired token |
| amount | uint256 | Amount for `fromToken` |
| parts | uint256 | Number of pieces source volume could be splitted (Works like granularity, higly affects gas usage. Should be called offchain, but could be called onchain if user swaps not his own funds, but this is still considered as not safe) |
| flags | uint256 | Flags for enabling and disabling some features (default: `0`), see flags description |
  
Return values: 

| Params | Type | Description |
| ----- | ----- | ----- |
| returnAmount | uint256 | Expected returning amount of desired token |
| distribution | uint256[] | Array of weights for volume distribution  |
  
**Notice:** This method is equal to `getExpectedReturnWithGas(fromToken, destToken, amount, parts, flags, 0)`

**Example:**
```
let Web3 = require('web3')

let provider = new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/YOUR_TOKEN')
let web3 = new Web3(provider)

let ABI = [{"inputs":[{"internalType":"contract IOneSplitMulti","name":"impl","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newImpl","type":"address"}],"name":"ImplementationUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IERC20","name":"fromToken","type":"address"},{"indexed":true,"internalType":"contract IERC20","name":"destToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"fromTokenAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"destTokenAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"minReturn","type":"uint256"},{"indexed":false,"internalType":"uint256[]","name":"distribution","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"flags","type":"uint256[]"},{"indexed":false,"internalType":"address","name":"referral","type":"address"},{"indexed":false,"internalType":"uint256","name":"feePercent","type":"uint256"}],"name":"Swapped","type":"event"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"constant":true,"inputs":[],"name":"chi","outputs":[{"internalType":"contract IFreeFromUpTo","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"contract IERC20","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"claimAsset","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"contract IERC20","name":"fromToken","type":"address"},{"internalType":"contract IERC20","name":"destToken","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"parts","type":"uint256"},{"internalType":"uint256","name":"flags","type":"uint256"}],"name":"getExpectedReturn","outputs":[{"internalType":"uint256","name":"returnAmount","type":"uint256"},{"internalType":"uint256[]","name":"distribution","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"contract IERC20","name":"fromToken","type":"address"},{"internalType":"contract IERC20","name":"destToken","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"parts","type":"uint256"},{"internalType":"uint256","name":"flags","type":"uint256"},{"internalType":"uint256","name":"destTokenEthPriceTimesGasPrice","type":"uint256"}],"name":"getExpectedReturnWithGas","outputs":[{"internalType":"uint256","name":"returnAmount","type":"uint256"},{"internalType":"uint256","name":"estimateGasAmount","type":"uint256"},{"internalType":"uint256[]","name":"distribution","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"contract IERC20[]","name":"tokens","type":"address[]"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256[]","name":"parts","type":"uint256[]"},{"internalType":"uint256[]","name":"flags","type":"uint256[]"},{"internalType":"uint256[]","name":"destTokenEthPriceTimesGasPrices","type":"uint256[]"}],"name":"getExpectedReturnWithGasMulti","outputs":[{"internalType":"uint256[]","name":"returnAmounts","type":"uint256[]"},{"internalType":"uint256","name":"estimateGasAmount","type":"uint256"},{"internalType":"uint256[]","name":"distribution","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"oneSplitImpl","outputs":[{"internalType":"contract IOneSplitMulti","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"contract IOneSplitMulti","name":"impl","type":"address"}],"name":"setNewImpl","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"contract IERC20","name":"fromToken","type":"address"},{"internalType":"contract IERC20","name":"destToken","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"minReturn","type":"uint256"},{"internalType":"uint256[]","name":"distribution","type":"uint256[]"},{"internalType":"uint256","name":"flags","type":"uint256"}],"name":"swap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"internalType":"contract IERC20[]","name":"tokens","type":"address[]"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"minReturn","type":"uint256"},{"internalType":"uint256[]","name":"distribution","type":"uint256[]"},{"internalType":"uint256[]","name":"flags","type":"uint256[]"}],"name":"swapMulti","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"internalType":"contract IERC20","name":"fromToken","type":"address"},{"internalType":"contract IERC20","name":"destToken","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"minReturn","type":"uint256"},{"internalType":"uint256[]","name":"distribution","type":"uint256[]"},{"internalType":"uint256","name":"flags","type":"uint256"},{"internalType":"address","name":"referral","type":"address"},{"internalType":"uint256","name":"feePercent","type":"uint256"}],"name":"swapWithReferral","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"internalType":"contract IERC20[]","name":"tokens","type":"address[]"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"minReturn","type":"uint256"},{"internalType":"uint256[]","name":"distribution","type":"uint256[]"},{"internalType":"uint256[]","name":"flags","type":"uint256[]"},{"internalType":"address","name":"referral","type":"address"},{"internalType":"uint256","name":"feePercent","type":"uint256"}],"name":"swapWithReferralMulti","outputs":[{"internalType":"uint256","name":"returnAmount","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]
let CONTRACT_ADDRESS = "0xC586BeF4a0992C495Cf22e1aeEE4E446CECDee0E"

let contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS)
contract.methods.getExpectedReturn(
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    100,
    10, 
    0
).call().then(data => {
    console.log(`returnAmount: ${data.returnAmount.toString()}`)
    console.log(`distribution: ${JSON.stringify(data.distribution)}`)
}).catch(error => {
    // TO DO: ...
});
```

### getExpectedReturnWithGas
```
function getExpectedReturnWithGas(
    IERC20 fromToken,
    IERC20 destToken,
    uint256 amount,
    uint256 parts,
    uint256 flags,
    uint256 destTokenEthPriceTimesGasPrice
)
    public
    view
    returns(
        uint256 returnAmount,
        uint256 estimateGasAmount,
        uint256[] memory distribution
    )
```

Calculate expected returning amount of desired token taking into account how gas protocols affect price

| Params | Type | Description |
| ----- | ----- | ----- |
| fromToken | IERC20 | Address of trading off token |
| destToken | IERC20 | Address of desired token |
| amount | uint256 | Amount for `fromToken` |
| parts | uint256 | Number of pieces source volume could be splitted (Works like granularity, higly affects gas usage. Should be called offchain, but could be called onchain if user swaps not his own funds, but this is still considered as not safe) |
| flags | uint256 | Flags for enabling and disabling some features (default: `0`), see flags description |
| destTokenEthPriceTimesGasPrice | uint256 | `returnAmount * gas_price`, where `returnAmount` is result of `getExpectedReturn(fromToken, destToken, amount, parts, flags)` |
  
Return values: 

| Params | Type | Description |
| ----- | ----- | ----- |
| returnAmount | uint256 | Expected returning amount of desired token |
| estimateGasAmount | uint256 | Expected gas amount of exchange |
| distribution | uint256[] | Array of weights for volume distribution  |
  

### swap
```
function swap(
    IERC20 fromToken,
    IERC20 destToken,
    uint256 amount,
    uint256 minReturn,
    uint256[] memory distribution,
    uint256 flags
) public payable returns(uint256)
```

Swap `amount` of `fromToken` to `destToken`

| Params | Type | Description |
| ----- | ----- | ----- |
| fromToken | IERC20 | Address of trading off token |
| destToken | IERC20 | Address of desired token |
| amount | uint256 | Amount for `fromToken` |
| minReturn | uint256 | Minimum expected return, else revert transaction |
| distribution | uint256[] | Array of weights for volume distribution (returned by `getExpectedReturn`) |
| flags | uint256 | Flags for enabling and disabling some features (default: `0`), see flags description |
  
**Notice:** Make sure the `flags` param coincides `flags` param in `getExpectedReturn` method if you want the same result
  
**Notice:** This method is equal to `swapWithReferral(fromToken, destToken, amount, minReturn, distribution, flags, address(0), 0)`
  
Return values: 
  
| Params | Type | Description |
| ----- | ----- | ----- |
| returnAmount | uint256 | Recieved amount of desired token |
