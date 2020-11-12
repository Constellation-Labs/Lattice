import { Currency, ETHER, Token, CurrencyAmount, JSBI, TokenAmount } from 'lattswap'
import { ParsedQs } from 'qs'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import { useCurrencyBalances } from '../wallet/hooks'
import { Field, selectCurrency, switchCurrencies, typeInput, setDex, setResult, setFlag } from './actions'
import { PolyState } from './reducer'
import customFetch from '../../utils/fetch'
import { useOneSplitContract } from '../../hooks/useAgregator'
import { FLAGS, REVERT_FLAGS } from '../../constants'
import { Contract } from 'ethers'
import _ from 'lodash'

export function usePolyState(): AppState['poly'] {
  return useSelector<AppState, AppState['poly']>(state => state.poly)
}

export function useSwapCallback() {
  const { result } = usePolyState()
  return useCallback(async () => {
    const { fromToken = {}, toToken = {}, toTokenAmount = 0 } = result
    const { symbol: fromTokenSymbol, address: fromTokenAddress } = fromToken
    const { symbol: toTokenSymbol, address: toTokenAddress } = toToken
    const amount = toTokenAmount
    const disableEstimate = true
    const params = {
      fromTokenSymbol,
      fromTokenAddress,
      toTokenSymbol,
      toTokenAddress,
      amount,
      disableEstimate,
      slippage: '0.1',
      fee: '0.1',
      gasPrice: 9900000001,
      fromAddress: '0xE8C902e5A810c2368c6eFefcb23B52Efc280aFe0'
    }
    const response = await customFetch(`${window.location.origin}/swap.json`, params)
    if (response && response.value) {
      window.alert('success')
    }
  }, [result])
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

export function parseTypedValue(value?: string, currency?: Currency | null | undefined) {
  if (!value || !currency) {
    return undefined
  }
  try {
    return parseUnits(value, currency.decimals).toString()
  } catch (error) {
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  return undefined
}

export function usePolyActionHandlers(): {
  onDexSwitch: (id: string, active: boolean) => void
  onCurrencySelection: (field: Field, currency: Currency) => void
  onUserInput: (field: Field, typedValue: string) => void
  onSwitchTokens: () => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : currency === ETHER ? 'ETH' : ''
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies({ typedValue: '0', result: {} }))
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onDexSwitch = useCallback(
    (id: string, active: boolean) => {
      dispatch(setDex({ dexStatus: { active, id } }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onDexSwitch
  }
}

export function useDerivedPolyInfo() {
  const dispatch = useDispatch<AppDispatch>()
  const { account } = useActiveWeb3React()
  const splitContract = useOneSplitContract()

  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    dex
  } = usePolyState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const approveAmount = tryParseAmount(typedValue, inputCurrency ? inputCurrency : undefined)
  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  ])
  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1]
  }
  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined
  }

  let inputError: string | undefined
  if (!account) {
    inputError = 'Connect Wallet'
  } else if (!typedValue) {
    inputError = 'Enter an amount'
  } else if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = 'Select a token'
  }
  const balanceIn = currencyBalances[Field.INPUT]

  if (balanceIn && approveAmount && balanceIn.lessThan(approveAmount)) {
    inputError = 'Insufficient ' + inputCurrency?.symbol + ' balance'
  }
  const parsedValue = parseTypedValue(typedValue, inputCurrency)
  useEffect(() => {
    async function getQuote() {
      if (!splitContract) return
      try {
        const fromToken = inputCurrencyId === 'ETH' ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : inputCurrencyId
        const destToken = outputCurrencyId === 'ETH' ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : outputCurrencyId
        let flag = '0'
        let disableIndex = '-1'
        _.each(dex, (value, key) => {
          if (!value.active) {
            disableIndex = key
          }
        })
        if (disableIndex !== '-1') {
          // @ts-ignore
          flag = REVERT_FLAGS.get(disableIndex)

          dispatch(setFlag({ flag }))
        } else {
          dispatch(setFlag({ flag }))
        }

        // const res = await splitContract.getExpectedReturn(fromToken, destToken, parsedValue, 100, 0)
        const res = await splitContract.getExpectedReturn(fromToken, destToken, parsedValue, 10, flag)
        const distribution = res.distribution.toString()
        const decimals = outputCurrency?.decimals
        const formatValue = Number(formatUnits(res.returnAmount, decimals).toString()).toFixed(6)
        dispatch(setResult({ result: { returnAmount: formatValue, distribution } }))
      } catch (e) {
        console.log(e, 'error')
      }
    }
    if (!inputError) {
      getQuote()
    }
  }, [splitContract, inputCurrencyId, outputCurrencyId, dispatch, inputError, parsedValue, outputCurrency, dex])

  return {
    currencies,
    currencyBalances,
    inputError,
    approveAmount
  }
}

function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === 'ETH') return 'ETH'
    if (valid === false) return 'ETH'
  }
  return 'ETH' ?? ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

export function queryParametersToPolyState(parsedQs: ParsedQs): PolyState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  return {
    result: {},
    [Field.INPUT]: {
      currencyId: inputCurrency
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    flag: '0'
  }
}

export function useDefaultsFromQuery() {
  const { chainId } = useActiveWeb3React()
  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId }
  } = usePolyState()

  useEffect(() => {
    if (!chainId) return
  }, [chainId, typedValue, inputCurrencyId, outputCurrencyId])

  return ''
}

export async function getQuoteQuery(
  splitContract: Contract,
  enabledDexId: number | string | undefined,
  inputCurrencyId: string,
  outputCurrencyId: string,
  parsedValue: string | undefined
) {
  if (!splitContract) return '-'
  const fromToken = inputCurrencyId === 'ETH' ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : inputCurrencyId
  const destToken = outputCurrencyId === 'ETH' ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : outputCurrencyId
  let flag = 0
  if (enabledDexId) {
    flag = FLAGS.get(enabledDexId)
  }
  return await splitContract.getExpectedReturn(fromToken, destToken, parsedValue, 1, flag)
}
