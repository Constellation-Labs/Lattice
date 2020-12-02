pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//
//  [ msg.sender ]
//       | |
//       | |
//       \_/
// +---------------+ ________________________________
// | OneSplitAudit | _______________________________  \
// +---------------+                                 \ \
//       | |                      ______________      | | (staticcall)
//       | |                    /  ____________  \    | |
//       | | (call)            / /              \ \   | |
//       | |                  / /               | |   | |
//       \_/                  | |               \_/   \_/
// +--------------+           | |           +----------------------+
// | OneSplitWrap |           | |           |   OneSplitViewWrap   |
// +--------------+           | |           +----------------------+
//       | |                  | |                     | |
//       | | (delegatecall)   | | (staticcall)        | | (staticcall)
//       \_/                  | |                     \_/
// +--------------+           | |             +------------------+
// |   OneSplit   |           | |             |   OneSplitView   |
// +--------------+           | |             +------------------+
//       | |                  / /
//        \ \________________/ /
//         \__________________/
//


contract IOneSplitConsts {
    // flags = FLAG_DISABLE_UNISWAP + FLAG_DISABLE_BANCOR + ...
    uint256 internal constant FLAG_DISABLE_WETH = 0x01;
    uint256 internal constant FLAG_DISABLE_MOONISWAP = 0x02;
    uint256 internal constant FLAG_DISABLE_UNISWAP_V2 = 0x04;
    uint256 internal constant FLAG_DISABLE_UNISWAP_V2_ETH = 0x08;
    uint256 internal constant FLAG_DISABLE_ALL_SPLIT_SOURCES = 0x10;
    uint256 internal constant FLAG_DISABLE_ALL_WRAP_SOURCES = 0x20;

    uint256 internal constant FLAG_DISABLE_UNISWAP_V2_ALL = 0x80;
    uint256 internal constant FLAG_DISABLE_SPLIT_RECALCULATION = 0x100;
    uint256 internal constant FLAG_DISABLE_MOONISWAP_ALL = 0x200;
    uint256 internal constant FLAG_DISABLE_MOONISWAP_ETH = 0x400;
    uint256 internal constant FLAG_DISABLE_MOONISWAP_POOL_TOKEN = 0x800;
    uint256 internal constant FLAG_DISABLE_SUSHISWAP_ALL = 0x1000;
    uint256 internal constant FLAG_DISABLE_SUSHISWAP = 0x2000;
    uint256 internal constant FLAG_DISABLE_SHUSISWAP_ETH = 0x4000;
    uint256 internal constant FLAG_DISABLE_BALANCER_ALL = 0x10000;
    uint256 internal constant FLAG_DISABLE_BALANCER_1 = 0x20000;
    uint256 internal constant FLAG_DISABLE_BALANCER_2 = 0x40000;
    uint256 internal constant FLAG_DISABLE_BALANCER_3 = 0x80000;
    uint256 internal constant FLAG_DISABLE_BASICSWAP_ALL = 0x100000;
    uint256 internal constant FLAG_DISABLE_BASICSWAP = 0x200000;
    uint256 internal constant FLAG_DISABLE_BASICSWAP_ETH = 0x400000;
}


contract IOneSplit is IOneSplitConsts {
    function getExpectedReturn(
        IERC20 fromToken,
        IERC20 destToken,
        uint256 amount,
        uint256 parts,
        uint256 flags // See constants in IOneSplit.sol
    )
        public
        view
        returns(
            uint256 returnAmount,
            uint256[] memory distribution
        );

    function getExpectedReturnWithGas(
        IERC20 fromToken,
        IERC20 destToken,
        uint256 amount,
        uint256 parts,
        uint256 flags, // See constants in IOneSplit.sol
        uint256 destTokenEthPriceTimesGasPrice
    )
        public
        view
        returns(
            uint256 returnAmount,
            uint256 estimateGasAmount,
            uint256[] memory distribution
        );

    function swap(
        IERC20 fromToken,
        IERC20 destToken,
        uint256 amount,
        uint256 minReturn,
        uint256[] memory distribution,
        uint256 flags
    )
        public
        payable
        returns(uint256 returnAmount);
}


contract IOneSplitMulti is IOneSplit {
    function getExpectedReturnWithGasMulti(
        IERC20[] memory tokens,
        uint256 amount,
        uint256[] memory parts,
        uint256[] memory flags,
        uint256[] memory destTokenEthPriceTimesGasPrices
    )
        public
        view
        returns(
            uint256[] memory returnAmounts,
            uint256 estimateGasAmount,
            uint256[] memory distribution
        );

    function swapMulti(
        IERC20[] memory tokens,
        uint256 amount,
        uint256 minReturn,
        uint256[] memory distribution,
        uint256[] memory flags
    )
        public
        payable
        returns(uint256 returnAmount);
}
