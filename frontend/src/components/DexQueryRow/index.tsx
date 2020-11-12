import { darken } from 'polished'
import React, { useEffect, useState } from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
import _ from 'lodash'

import Card, { GreyCard } from '../Card'
import { AutoColumn } from '../Column'
import { RowBetween, RowRelative } from '../Row'
import { formatUnits } from '@ethersproject/units'
import { Field } from '../../state/poly/actions'
import { getQuoteQuery, parseTypedValue, usePolyState } from '../../state/poly/hooks'
import { useOneSplitContract } from '../../hooks/useAgregator'
import { useCurrency } from '../../hooks/Tokens'

import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../state'
// import { setDexResult } from '../../state/poly/actions'
// import { stringify } from 'querystring'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

const StyledGreyCard = styled(GreyCard)`
  border-radius: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`
const dexResutMap = {
  Mooniswap: 0,
  Uniswap: 1
}

interface DexQueryRow {
  id?: string
  name?: string
  logo?: string
  amount?: string
  diff?: number
  active?: boolean
}

function DexQueryRow({ id, name, active }: DexQueryRow) {
  const [amount, setAmount] = useState<string>()
  const [diff, setDiff] = useState<string>()
  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    result: { distribution }
  } = usePolyState()
  const dispatch = useDispatch<AppDispatch>()
  const splitContract = useOneSplitContract()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outCurrency = useCurrency(outputCurrencyId)
  const parsedValue = parseTypedValue(typedValue, inputCurrency)
  //TODO
  const enableId = id
  useEffect(() => {
    console.log(typedValue, 'par', parsedValue, '-----------$$$$$$')
    const queryAmount = async () => {
      //todo
      if (!splitContract || !inputCurrencyId || !outputCurrencyId || !typedValue) return
      const decimals = outCurrency?.decimals
      const res = await getQuoteQuery(splitContract, enableId, inputCurrencyId, outputCurrencyId, parsedValue)
      const distribute = distribution.split(',')
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const index = dexResutMap[id]
      setDiff(typedValue > '0' && active ? distribute[index] * 10 + '%' : '-')
      const formatValue = Number(formatUnits(res.returnAmount, decimals).toString()).toFixed(6)
      setAmount(typedValue > '0' ? formatValue : '-')
      // dispatch(setDexResult({ dexResult: {id, returnAmount: formatValue } }))
    }
    queryAmount()
  }, [
    inputCurrencyId,
    outputCurrencyId,
    typedValue,
    parsedValue,
    dispatch,
    outCurrency,
    id,
    distribution,
    splitContract,
    enableId,
    active
  ])

  return (
    <>
      {
        <StyledGreyCard>
          <AutoColumn gap="24px">
            <FixedHeightRow>
              <RowRelative width={80}>
                {/* <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} /> */}
                <Text fontWeight={100} fontSize={20}>
                  {name}
                </Text>
              </RowRelative>
              <RowRelative width={80}>
                <Text fontWeight={100} fontSize={20}>
                  {amount ? amount : '-'}
                </Text>
              </RowRelative>
              <RowRelative width={20}>
                <Text fontWeight={100} fontSize={20}>
                  {diff ? diff : '-'}
                </Text>
              </RowRelative>
            </FixedHeightRow>
          </AutoColumn>
        </StyledGreyCard>
      }
    </>
  )
}

export default DexQueryRow
