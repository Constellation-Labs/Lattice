import { createAction } from '@reduxjs/toolkit'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export const selectCurrency = createAction<{ field: Field; currencyId: string }>('poly/selectCurrency')
export const switchCurrencies = createAction<{ typedValue: string; result: object | undefined }>(
  'poly/switchCurrencies'
)
export const typeInput = createAction<{ field: Field; typedValue: string }>('poly/typeInput')
export const setResult = createAction<{ result: any }>('poly/setResult')
export const setDex = createAction<{ dexStatus: { id: string; active: boolean } }>('poly/setDex')
export const setDexResult = createAction<{ dexResult: any }>('poly/setDexResult')
export const replacePolyState = createAction<{
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  result: any
}>('poly/replacePolyState')
export const setRecipient = createAction<{ recipient: string | null }>('poly/setRecipient')
export const setFlag = createAction<{ flag: string }>('poly/setFlag')
