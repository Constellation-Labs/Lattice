const WETH = artifacts.require("WETH9");
const Factory = artifacts.require("BasicswapFactory");
const Router = artifacts.require("BasicswapRouter02");

// module.exports = function(deployer, network, accounts) {
//     deployer.deploy(WETH).then(function() {
//         return deployer.deploy(Factory, accounts[0]);
//       }).then(function() {
//         return deployer.deploy(Router, Factory.address, WETH.address);
//       });
// };

module.exports = function(deployer, network, accounts) {
        deployer.deploy(Factory, accounts[0]).then(function() {
        return deployer.deploy(Router, Factory.address, "0xc778417E063141139Fce010982780140Aa0cD5Ab");
      });
};