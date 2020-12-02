// import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JSBI, Percent, CurrencyAmount, Token } from 'lattswap'
import { useMemo } from 'react'
import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE, ETH_ADDRESS } from '../constants'
// import { getTradeVersion, useV1TradeExchangeAddress } from '../data/V1'
import { useTransactionAdder } from '../state/transactions/hooks'
import { isAddress, shortenAddress, calculateGasMargin } from '../utils'
// import isZero from '../utils/isZero'
// import v1SwapArguments from '../utils/v1SwapArguments'
import { useActiveWeb3React } from './index'
// import { useV1ExchangeContract } from './useContract'
import useTransactionDeadline from './useTransactionDeadline'
import useENS from './useENS'
// import { Version } from './useToggledVersion'
// import { useCurrency } from './Tokens'
// import { tryParseAmount } from '../state/swap/hooks'
import invariant from 'tiny-invariant'
import { getAddress } from '@ethersproject/address'
// import warning from 'tiny-warning'
import { Field } from '../state/swap/actions'
import { useOneSplitContract } from '../hooks/useAgregator'
import { useToken } from '../hooks/Tokens'
import { tryParseSwapAmount } from '../state/swap/hooks'
import isZero from '../utils/isZero'

import { usePolyState, getDexCodeSum } from '../state/poly/hooks'
import { BigNumber } from 'ethers'
export const ZERO = JSBI.BigInt(0)

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID
}

interface SwapCall {
  contract: Contract
  parameters: SwapParameters
}

// interface SuccessfulCall {
//   call: SwapCall
//   gasEstimate: BigNumber
// }

// interface FailedCall {
//   call: SwapCall
//   error: Error
// }

// type EstimatedSwapCall = SuccessfulCall | FailedCall

export interface TradeOptions {
  /**
   * How much the execution price is allowed to move unfavorably from the trade execution price.
   */
  allowedSlippage: Percent
  /**
   * How long the swap is valid until it expires, in seconds.
   * This will be used to produce a `deadline` parameter which is computed from when the swap call parameters
   * are generated.
   */
  ttl: number
  /**
   * The account that should receive the output of the swap.
   */
  recipient: string

  /**
   * Whether any of the tokens in the path are fee on transfer tokens, which should be handled with special methods
   */
  feeOnTransfer?: boolean
}

export interface TradeOptionsDeadline extends Omit<TradeOptions, 'ttl'> {
  /**
   * When the transaction expires.
   * This is an atlernate to specifying the ttl, for when you do not want to use local time.
   */
  deadline: number
}

/**
 * The parameters to use in the call to the Uniswap V2 Router to execute a trade.
 */
export interface SwapParameters {
  /**
   * The method to call on the Uniswap V2 Router.
   */
  methodName: string
  /**
   * The arguments to pass to the method, all hex encoded.
   */
  args: (string | string[] | number[] | number)[]
  /**
   * The amount of wei to send in hex.
   */
  value: string
}

// warns if addresses are not checksummed
export function validateAndParseAddress(address: string): string {
  try {
    const checksummedAddress = getAddress(address)
    // warning(address === checksummedAddress, `${address} is not checksummed.`)
    return checksummedAddress
  } catch (error) {
    invariant(false, `${address} is not a valid address.`)
  }
}

function toHex(currencyAmount: CurrencyAmount) {
  return `0x${currencyAmount.raw.toString(16)}`
}

const ZERO_HEX = '0x0'

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
function useSwapCallArguments(
  oneSplit: Contract | undefined, // trade to execute, required
  fromToken: Token | undefined | null,
  destToken: Token | undefined | null,
  input: CurrencyAmount | undefined,
  output: CurrencyAmount | undefined,
  distribution: number[],
  flag: string,
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null | undefined // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): SwapCall[] {
  const { account, chainId, library } = useActiveWeb3React()

  const { address: recipientAddress } = useENS(recipientAddressOrName)

  const recipient = recipientAddressOrName === null ? account : recipientAddress
  const deadline = useTransactionDeadline()

  // const v1Exchange = useV1ExchangeContract(useV1TradeExchangeAddress(trade), true)

  return useMemo(() => {
    // const tradeVersion = getTradeVersion(trade)
    if (
      !oneSplit ||
      !recipient ||
      !library ||
      !account ||
      !chainId ||
      !deadline ||
      !fromToken ||
      !destToken ||
      !input ||
      !output ||
      !distribution
    )
      return []

    const contract: Contract | null = oneSplit
    if (!contract) {
      return []
    }

    const swapMethods = []
    // console.log('allowedSlippage ======', allowedSlippage)
    swapMethods.push(
      swapCallParameters(oneSplit, fromToken, destToken, input, output, distribution, flag, {
        feeOnTransfer: false,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        recipient,
        deadline: deadline.toNumber()
      })
    )

    // if (trade.tradeType === TradeType.EXACT_INPUT) {
    //   swapMethods.push(
    //     swapCallParameters(fromToken, destToken, amount, {
    //       feeOnTransfer: true,
    //       allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
    //       recipient,
    //       deadline: deadline.toNumber()
    //     })
    //   )
    // }
    return swapMethods.map(parameters => ({ parameters, contract }))
  }, [
    account,
    allowedSlippage,
    chainId,
    deadline,
    library,
    recipient,
    fromToken,
    destToken,
    input,
    output,
    distribution
  ])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
): {
  // oneSplit: Contract | undefined, // trade to execute, required
  // fromToken: Token | undefined | null,
  // destToken: Token | undefined | null,
  // input: CurrencyAmount | undefined,
  // output: CurrencyAmount | undefined,
  // distribution: number[],
  // allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  // recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  state: SwapCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useActiveWeb3React()
  // swap state
  const {
    typedValue,
    result: { returnAmount, distribution },
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    flags
  } = usePolyState()
  // console.log(typedValue, inputCurrencyId , outputCurrencyId, '**************')
  const oneSplit = useOneSplitContract()
  const fromToken = useToken(inputCurrencyId)
  const destToken = useToken(outputCurrencyId)
  const input = tryParseSwapAmount(typedValue, fromToken)
  const output = tryParseSwapAmount(returnAmount, destToken)
  const distribute = distribution?.split(',')
  const _flag = getDexCodeSum(flags)
  // console.log(oneSplit, fromToken, destToken, input, output, distribution, '**************')

  const swapCalls = useSwapCallArguments(oneSplit, fromToken, destToken, input, output, distribute, _flag, allowedSlippage, account,)

  const addTransaction = useTransactionAdder()

  // const { address: recipientAddress } = useENS(null)
  const recipient = account

  return useMemo(() => {
    // console.log(inputCurrencyId, fromToken, outputCurrencyId , destToken, input, output, distribution, '****-------*****')

    if (!library || !account || !chainId || !destToken || !fromToken || !input || !output) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    // if (!recipient) {
    //   if (recipientAddressOrName !== null) {
    //     return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
    //   } else {
    //     return { state: SwapCallbackState.LOADING, callback: null, error: null }
    //   }
    // }

    // const tradeVersion = getTradeVersion(trade)

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        // const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
        //   swapCalls.map(call => {
        //     const {
        //       parameters: { methodName, args, value },
        //       contract
        //     } = call
        //     const options = !value || isZero(value) ? {} : { value }

        //     return contract.estimateGas[methodName](...args, options)
        //       .then(gasEstimate => {
        //         return {
        //           call,
        //           gasEstimate
        //         }
        //       })
        //       .catch(gasError => {
        //         console.debug('Gas estimate failed, trying eth_call to extract error', call)

        //         return contract.callStatic[methodName](...args, options)
        //           .then(result => {
        //             console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
        //             return { call, error: new Error('Unexpected issue with estimating the gas. Please try again.') }
        //           })
        //           .catch(callError => {
        //             console.debug('Call threw error', call, callError)
        //             let errorMessage: string
        //             switch (callError.reason) {
        //               case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
        //               case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
        //                 errorMessage =
        //                   'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
        //                 break
        //               default:
        //                 errorMessage = `The transaction cannot succeed due to error: ${callError.reason}. This is probably an issue with one of the tokens you are swapping.`
        //             }
        //             return { call, error: new Error(errorMessage) }
        //           })
        //       })
        //   })
        // )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        // const successfulEstimation = estimatedCalls.find(
        //   (el, ix, list): el is SuccessfulCall =>
        //     'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
        // )

        // if (!successfulEstimation) {
        //   const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
        //   if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
        //   throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
        // }

        // const {
        //   call: {
        //     contract,
        //     parameters: { methodName, args, value }
        //   },
        //   gasEstimate
        // } = successfulEstimation
        const {
          contract,
          parameters: { methodName, args, value }
        } = swapCalls[0]
        return contract[methodName](...args, {
          gasLimit: calculateGasMargin(BigNumber.from(940000)),
          ...(value && !isZero(value) ? { value, from: account } : { from: account })
        })
          .then((response: any) => {
            const inputSymbol = fromToken?.symbol
            const outputSymbol = destToken?.symbol
            const inputAmount = input?.toSignificant(3)
            const outputAmount = output?.toSignificant(3)

            const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
            const withRecipient =
              recipient === account ? base : `${base} to ${isAddress(account) ? shortenAddress(account) : account}`

            // const withVersion =
            //   tradeVersion === Version.v2 ? withRecipient : `${withRecipient} on ${(tradeVersion as any).toUpperCase()}`

            const withVersion = withRecipient
            addTransaction(response, {
              summary: withVersion
            })

            return response.hash
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, methodName, args, value)
              throw new Error(`Swap failed: ${error.message}`)
            }
          })
      },
      error: null
    }
  }, [
    library,
    account,
    chainId,
    recipient,
    swapCalls,
    addTransaction,
    output,
    input,
    fromToken,
    inputCurrencyId,
    outputCurrencyId,
    destToken,
    distribution
  ])
}

export function swapCallParameters(
  oneSplit: Contract | undefined, // trade to execute, required
  fromToken: Token | undefined | null,
  destToken: Token | undefined | null,
  input: CurrencyAmount | undefined,
  output: CurrencyAmount | undefined,
  distribution: number[],
  flag: string,
  options: TradeOptions | TradeOptionsDeadline
): SwapParameters {
  const etherIn = fromToken?.address === ETH_ADDRESS
  const etherOut = destToken?.address === ETH_ADDRESS
  // the router does not support both ether in and out
  invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
  invariant(!('ttl' in options) || options.ttl > 0, 'TTL')

  // const to: string = validateAndParseAddress(options.recipient)
  const amountIn: string = input ? toHex(input) : ''
  const amountOut: string = output ? toHex(output) : ''
  // const path: string[] = trade.route.path.map(token => token.address)
  // const deadline =
  //   'ttl' in options
  //     ? `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16)}`
  //     : `0x${options.deadline.toString(16)}`

  // const useFeeOnTransfer = Boolean(options.feeOnTransfer)

  let methodName: string
  let args: (string | string[] | number[] | number)[]
  let value: string
  // switch (trade.tradeType) {
  //   case TradeType.EXACT_INPUT:
  //     if (etherIn) {
  //       methodName = useFeeOnTransfer ? 'swapExactETHForTokensSupportingFeeOnTransferTokens' : 'swapExactETHForTokens'
  //       // (uint amountOutMin, address[] calldata path, address to, uint deadline)
  //       args = [amountOut, path, to, deadline]
  //       value = amountIn
  //     } else if (etherOut) {
  //       methodName = useFeeOnTransfer ? 'swapExactTokensForETHSupportingFeeOnTransferTokens' : 'swapExactTokensForETH'
  //       // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
  //       args = [amountIn, amountOut, path, to, deadline]
  //       value = ZERO_HEX
  //     } else {
  //       methodName = useFeeOnTransfer
  //         ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
  //         : 'swapExactTokensForTokens'
  //       // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
  //       args = [amountIn, amountOut, path, to, deadline]
  //       value = ZERO_HEX
  //     }
  //     break
  //   case TradeType.EXACT_OUTPUT:
  //     invariant(!useFeeOnTransfer, 'EXACT_OUT_FOT')
  //     if (etherIn) {
  //       methodName = 'swapETHForExactTokens'
  //       // (uint amountOut, address[] calldata path, address to, uint deadline)
  //       args = [amountOut, path, to, deadline]
  //       value = amountIn
  //     } else if (etherOut) {
  //       methodName = 'swapTokensForExactETH'
  //       // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
  //       args = [amountOut, amountIn, path, to, deadline]
  //       value = ZERO_HEX
  //     } else {
  //       methodName = 'swapTokensForExactTokens'
  //       // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
  //       args = [amountOut, amountIn, path, to, deadline]
  //       value = ZERO_HEX
  //     }
  //     break
  // }
  methodName = 'swap'

  args = [
    fromToken ? fromToken.address : ZERO_HEX,
    destToken ? destToken.address : ZERO_HEX,
    amountIn,
    amountOut,
    distribution,
    flag
  ]
  value = etherIn ? amountIn : ZERO_HEX

  return {
    methodName,
    args,
    value
  }
}

// /**
//  * Get the minimum amount that must be received from this trade for the given slippage tolerance
//  * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
//  */
// function minimumAmountOut(amount: CurrencyAmount, slippageTolerance: Percent): CurrencyAmount {
//   invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')

//   const slippageAdjustedAmountOut = new Fraction(ONE)
//     .add(slippageTolerance)
//     .invert()
//     .multiply(this.outputAmount.raw).quotient
//   return this.outputAmount instanceof TokenAmount
//     ? new TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
//     : CurrencyAmount.ether(slippageAdjustedAmountOut)
// }

// /**
//  * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
//  * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
//  */
// function maximumAmountIn(slippageTolerance: Percent): CurrencyAmount {
//   invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
//   if (this.tradeType === TradeType.EXACT_INPUT) {
//     return this.inputAmount
//   } else {
//     const slippageAdjustedAmountIn = new Fraction(ONE).add(slippageTolerance).multiply(this.inputAmount.raw).quotient
//     return this.inputAmount instanceof TokenAmount
//       ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
//       : CurrencyAmount.ether(slippageAdjustedAmountIn)
//   }
// }
