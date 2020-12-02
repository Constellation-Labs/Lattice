import { createReducer } from '@reduxjs/toolkit'
import { Field, replacePolyState, selectCurrency, switchCurrencies, typeInput, setResult, setDex } from './actions'
import _ from 'lodash'
import { dexResultMap, UNISWAPCODE, SUSHISWAPCODE, MOONISWAPCODE, BALANCERCODE, BASICSWAPCODE } from './hooks'

export interface PolyState {
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined
  }
  readonly flags?: any
  readonly result?: any
  readonly dex: Record<string, any>
}

const initialState: PolyState = {
  typedValue: '',
  [Field.INPUT]: {
    currencyId: ''
  },
  [Field.OUTPUT]: {
    currencyId: ''
  },
  flags: [],
  result: {
    returnAmount: '0',
    distribution: '0,0,0,0'
  },
  dex: {
    Uniswap: {
      code: UNISWAPCODE,
      codeList: ['0x04', '0x08'],
      id: 'Uniswap',
      name: 'Uniswap'
    },
    Sushiswap: {
      code: SUSHISWAPCODE,
      codeList: ['0x2000', '0x4000'],
      id: 'Sushiswap',
      name: 'Sushiswap'
    },
    Mooniswap: {
      code: MOONISWAPCODE,
      codeList: ['0x02', '0x400'],
      id: 'Mooniswap',
      name: 'Mooniswap'
    },
    Balancer: {
      code: BALANCERCODE,
      codeList: ['0x20000', '0x40000', '0x80000'],
      id: 'Balancer',
      name: 'Balancer'
    },
    Basicswap: {
      code: BASICSWAPCODE,
      codeList: ['0x200000', '0x400000'],
      id: 'Basicswap',
      name: 'Basicswap'
    }
  }
}

export default createReducer<PolyState>(initialState, builder =>
  builder
    .addCase(replacePolyState, (state, { payload: { typedValue, inputCurrencyId, outputCurrencyId, result } }) => {
      return {
        ...state,
        [Field.INPUT]: {
          currencyId: inputCurrencyId
        },
        [Field.OUTPUT]: {
          currencyId: outputCurrencyId
        },
        typedValue: typedValue,
        result
      }
    })
    .addCase(
      setDex,
      (
        state,
        {
          payload: {
            dexStatus: { id, active }
          }
        }
      ) => {
        let flags = _.cloneDeep(state.flags)
        if (!active) {
          flags.push(id)
          flags = _.uniq(flags)
        } else {
          flags = _.filter(flags, v => {
            return v !== id
          })
        }
        return {
          ...state,
          flags
        }
      }
    )
    .addCase(setResult, (state, { payload: { result } }) => {
      const { distribution } = result
      const { dex } = state
      const flags: any[] = []
      const distributionArr = _.split(distribution, ',')
      _.each(dex, ({ code }, key) => {
        // @ts-ignore
        const sliceIndex = dexResultMap[key]
        const sliceArr = distributionArr.slice(sliceIndex[0], sliceIndex[sliceIndex.length - 1] + 1)
        if (_.every(sliceArr, v => +v <= 0)) {
          flags.push(code)
        }
      })
      return {
        ...state,
        result,
        flags
      }
    })
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        return {
          ...state,
          [field]: { currencyId: currencyId },
          [otherField]: { currencyId: state[field].currencyId }
        }
      } else {
        // the normal case
        return {
          ...state,
          [field]: { currencyId: currencyId }
        }
      }
    })
    .addCase(switchCurrencies, (state, { payload: { typedValue } }) => {
      return {
        ...state,
        typedValue,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId }
      }
    })
    .addCase(typeInput, (state, { payload: { typedValue } }) => {
      return {
        ...state,
        typedValue
      }
    })
)
