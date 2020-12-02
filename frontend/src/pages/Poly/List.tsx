import React from 'react'
import styled from 'styled-components'
import { usePolyState } from '../../state/poly/hooks'
import DexQueryRow from '../../components/DexQueryRow'

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
  const { dex, flags } = usePolyState()
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
          {_.map(dex, ({ id, name, code }) => {
            return <DexQueryRow key={id} code={code} active={_.indexOf(flags, code) < 0} id={id} name={name} />
          })}
        </>
      )}
    </ListWrapper>
  )
}
