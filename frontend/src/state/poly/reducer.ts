import { createReducer } from '@reduxjs/toolkit'
import {
  Field,
  replacePolyState,
  selectCurrency,
  switchCurrencies,
  typeInput,
  setResult,
  setDex,
  setDexResult,
  setFlag
} from './actions'
import { cloneDeep } from 'lodash'
import _ from 'lodash'

const dexResutMap = {
  Mooniswap: 0,
  Uniswap: 1
}

export interface PolyState {
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined
  }
  readonly result?: any
  readonly dex?: Record<string, any>
  readonly flag: string
}

const initialState: PolyState = {
  typedValue: '',
  flag: '0',
  [Field.INPUT]: {
    currencyId: ''
  },
  [Field.OUTPUT]: {
    currencyId: ''
  },
  result: {
    returnAmount: '0',
    distribution: '0,0,0,0'
  },
  dex: {
    Mooniswap: {
      id: 'Mooniswap',
      name: 'Mooniswap',
      active: true,
      amount: undefined
    },
    Uniswap: {
      id: 'Uniswap',
      name: 'Uniswap',
      active: true,
      amount: undefined
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
        const { dex } = state
        let sum = 0
        _.each(dex, ({ active }) => {
          if (active) {
            sum += 1
          }
        })
        if (sum !== 2 && active === false) {
          return
        }
        const __dex = cloneDeep(dex)
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        __dex[id].active = active
        return {
          ...state,
          dex: __dex
        }
      }
    )
    .addCase(setResult, (state, { payload: { result } }) => {
      return {
        ...state,
        result
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
      // @ts-ignore
    })
    .addCase(setFlag, (state, { payload: { flag } }) => {
      return {
        ...state,
        flag
      }
    })
    .addCase(setDexResult, (state, { payload: { dexResult } }) => {
      const { dex, result } = state

      const { returnAmount, id } = dexResult || {}
      const distributionArr = _.split(result.distribution, ',')
      // @ts-ignore
      const disIndex = dexResutMap[id]
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const selectDex = dex[id]
      // @ts-ignore
      dex[id] = {
        ...selectDex,
        amount: returnAmount,
        diff: distributionArr[disIndex]
      }

      // const index = _.findIndex(distributionArr, i => i > '0')
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      // const indexKey = dexResutMap[+index]
      // const __dex = _.cloneDeep(dex)

      // _.each(__dex, (value, key) => {
      //   if (indexKey === key) {
      //     // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      //     // @ts-ignore
      //     __dex[id] = {
      //       ...value,
      //       amount: returnAmount,
      //       // active: returnAmount > 0 ? !!1 : !!0
      //       diff: distributionArr[index]
      //     }
      //   } else {
      //     // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      //     // @ts-ignore
      //     __dex[key] = {
      //       ...value,
      //       amount: 0,
      //       // active: false
      //     }
      //   }
      // })
      return {
        ...state,
        dex: dex
      }
    })
)
