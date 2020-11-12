const OneSplitView = artifacts.require("OneSplitView");
const OneSplitViewWrap = artifacts.require("OneSplitViewWrap");
const OneSplit = artifacts.require("OneSplit");
const OneSplitWrap = artifacts.require("OneSplitWrap");
const OneSplitAudit = artifacts.require("OneSplitAudit");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(OneSplitView).then(function() {
        return deployer.deploy(OneSplitViewWrap, OneSplitView.address);
      }).then(function() {
        return deployer.deploy(OneSplit, OneSplitViewWrap.address);
      }).then(function() {
        return deployer.deploy(OneSplitWrap, OneSplitViewWrap.address, OneSplit.address);
      }).then(function() {
        return deployer.deploy(OneSplitAudit, OneSplitWrap.address);
      });
};