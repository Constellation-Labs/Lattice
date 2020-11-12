import React from 'react'
import styled from 'styled-components'
// import { formatUnits } from '@ethersproject/units'
// import { Field } from '../../state/poly/actions'
import { usePolyState } from '../../state/poly/hooks'
// import { useOneSplitContract } from '../../hooks/useAgregator'
// import { useCurrency } from '../../hooks/Tokens'
import DexQueryRow from '../../components/DexQueryRow'
// import { useDispatch } from 'react-redux'
// import { AppDispatch } from '../../state'
// import { setDexResult } from '../../state/poly/actions'

import _ from 'lodash'
import { lighten } from 'polished'

const ListWrapper = styled.div`
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  background: ${({ theme }) => lighten(0.1, theme.baseBg)};
`
const ListTitle = styled.div`
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
`

export default function List() {
  const { dex } = usePolyState()
  // const dispatch = useDispatch<AppDispatch>()
  // const splitContract = useOneSplitContract()
  // const inputCurrency = useCurrency(inputCurrencyId)
  // const outCurrency = useCurrency(outputCurrencyId)
  // const parsedValue = parseTypedValue(typedValue, inputCurrency)
  // let disabledDexId: string | number | undefined
  // const disabledDex = _.find(dex, ({ active }) => {
  //   return active === false
  // })
  // if (disabledDex) {
  //   disabledDexId = disabledDex.id
  // }
  // useEffect(() => {
  //   const queryAmount = async () => {
  //     if (!splitContract || !inputCurrencyId || !outputCurrencyId || !typedValue) return
  //     const decimals = outCurrency?.decimals
  //     const res = await getQuoteQuery(splitContract, disabledDexId, inputCurrencyId, outputCurrencyId, parsedValue)
  //     const distribution = res.distribution.toString()
  //     const formatValue = Number(formatUnits(res.returnAmount, decimals).toString()).toFixed(6)
  //     dispatch(setDexResult({ dexResult: { distribution, returnAmount: formatValue } }))
  //   }
  //   queryAmount()
  // }, [inputCurrencyId, outputCurrencyId, typedValue, splitContract, parsedValue, disabledDexId, dispatch, outCurrency, dex])
  return (
    <ListWrapper>
      {dex && (
        <ListTitle>
          <div>Exchange</div>
          <div>Amount</div>
          <div>Distribution</div>
        </ListTitle>
      )}
      {dex && (
        <>
          {_.map(dex, ({ id, name, amount, diff, active }) => {
            return <DexQueryRow key={id} id={id} diff={diff} name={name} amount={amount} active={active} />
          })}
        </>
      )}
    </ListWrapper>
  )
}
