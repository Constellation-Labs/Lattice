import { Currency, ETHER, Token, CurrencyAmount, JSBI, TokenAmount } from 'lattswap'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { AppDispatch, AppState } from '../index'
import { useCurrencyBalances } from '../wallet/hooks'
import _ from 'lodash'
import { Field, selectCurrency, switchCurrencies, typeInput, setDex } from './actions'
import { useOneSplitContract } from '../../hooks/useAgregator'

export const getDexCodeSum = (dexCodes: any) => {
  const sumCode = _.reduce(
    dexCodes,
    (sum, n) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      return parseInt(sum) + parseInt(n)
    },
    0
  )
  return `0x${sumCode.toString(16)}`
}

export const UNISWAPCODE = getDexCodeSum(['0x04', '0x08'])
export const SUSHISWAPCODE = getDexCodeSum(['0x2000', '0x4000'])
export const MOONISWAPCODE = getDexCodeSum(['0x02', '0x400'])
export const BALANCERCODE = getDexCodeSum(['0x20000', '0x40000', '0x80000'])
export const BASICSWAPCODE = getDexCodeSum(['0x200000', '0x400000'])

export const fullFlags = [UNISWAPCODE, SUSHISWAPCODE, MOONISWAPCODE, BALANCERCODE]

export const dexResultMap = {
  Uniswap: [0, 1],
  Sushiswap: [2, 3],
  Mooniswap: [4, 5],
  Balancer: [6, 7, 8],
  Basicswap: [9, 10]
}

export function usePolyState(): AppState['poly'] {
  return useSelector<AppState, AppState['poly']>(state => state.poly)
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

export function useQuotaQueryCallbackParams() {
  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId }
  } = usePolyState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const parsedValue = parseTypedValue(typedValue, inputCurrency)
  return useMemo(() => {
    return {
      inputCurrency,
      inputCurrencyId,
      outputCurrency,
      outputCurrencyId,
      parsedValue
    }
  }, [inputCurrency, inputCurrencyId, outputCurrency, outputCurrencyId, parsedValue])
}

export function useQuotaQueryCallback() {
  const splitContract = useOneSplitContract()
  const { outputCurrency, parsedValue, inputCurrencyId, outputCurrencyId } = useQuotaQueryCallbackParams()
  return useMemo(() => {
    return {
      callback: async (flag: any) => {
        let result
        try {
          if (!splitContract) return null
          const fromToken = inputCurrencyId === 'ETH' ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : inputCurrencyId
          const destToken = outputCurrencyId === 'ETH' ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : outputCurrencyId
          const res = await splitContract.getExpectedReturn(fromToken, destToken, parsedValue, 100, flag)
          const distribution = res.distribution.toString()
          const decimals = outputCurrency?.decimals
          const formatValue = Number(formatUnits(res.returnAmount, decimals).toString()).toFixed(6)
          result = {
            formatValue,
            distribution
          }
        } catch (e) {
          result = null
        }
        return result
      }
    }
  }, [inputCurrencyId, outputCurrency, outputCurrencyId, parsedValue, splitContract])
}

export function useDerivedPolyInfo() {
  const { account } = useActiveWeb3React()
  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId }
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
  return {
    currencies,
    currencyBalances,
    inputError,
    approveAmount
  }
}
