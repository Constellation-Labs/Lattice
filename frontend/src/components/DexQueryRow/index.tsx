import { darken } from 'polished'
import React, { useEffect, useState } from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
import Card, { GreyCard } from '../Card'
import { AutoColumn } from '../Column'
import { RowBetween, RowRelative } from '../Row'
import {
  usePolyState,
  fullFlags,
  dexResultMap,
  getDexCodeSum,
  useQuotaQueryCallback,
  useQuotaQueryCallbackParams
} from '../../state/poly/hooks'
import { useOneSplitContract } from '../../hooks/useAgregator'

import _ from 'lodash'

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

const getSumDis = (arr: any[]) => {
  let sum = 0
  _.each(arr, v => {
    sum += +v
  })
  return sum
}

interface DexQueryRow {
  id?: string
  name?: string
  code?: string
  logo?: string
  active?: boolean
}

function DexQueryRow({ name, code, id, active }: DexQueryRow) {
  const {
    result: { distribution }
  } = usePolyState()
  const { inputCurrencyId, outputCurrency, parsedValue, outputCurrencyId } = useQuotaQueryCallbackParams()
  const { callback: quotaQueryCallback } = useQuotaQueryCallback()
  const [amount, setAmount] = useState('')
  const [diff, setDiff] = useState('')
  const splitContract = useOneSplitContract()
  const distribute = _.split(distribution, ',')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sum = getSumDis(distribute)
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const disSlice = dexResultMap[id]
  const dis = distribute.slice(disSlice[0], disSlice[disSlice.length - 1] + 1)
  const disSum = getSumDis(dis)
  const flag = _.filter(fullFlags, v => {
    return v !== code
  })
  const _flag = getDexCodeSum(flag)

  useEffect(() => {
    async function getQuery() {
      const res = await quotaQueryCallback(_flag)
      if (res) {
        const { formatValue } = res
        setAmount(formatValue.toString())
      }
      if (dis && sum) {
        setDiff(`${((+disSum / sum) * 100).toFixed(2)}%`)
      } else {
        setDiff('')
      }
    }
    if (active && inputCurrencyId && outputCurrencyId && parsedValue) {
      getQuery()
    } else {
      setAmount('')
      setDiff('')
    }
  }, [
    active,
    inputCurrencyId,
    parsedValue,
    splitContract,
    outputCurrency,
    dis,
    sum,
    _flag,
    quotaQueryCallback,
    outputCurrencyId
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
                  {Number(amount) ? amount : '-'}
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
