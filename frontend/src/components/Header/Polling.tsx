import React, { useState, useEffect } from 'react'
import { ExternalLink } from '../../theme'

import { useBlockNumber } from '../../state/application/hooks'
import { getEtherscanLink } from '../../utils'
import { useActiveWeb3React } from '../../hooks'

import styles from './index.module.scss'

export default function Polling() {
  const { chainId } = useActiveWeb3React()

  const blockNumber = useBlockNumber()

  const [isMounted, setIsMounted] = useState(true)

  useEffect(
    () => {
      const timer1 = setTimeout(() => setIsMounted(true), 1000)

      // this will clear Timeout when component unmount like in willComponentUnmount
      return () => {
        setIsMounted(false)
        clearTimeout(timer1)
      }
    },
    [blockNumber] //useEffect will run only one time
    //if you pass a value to array, like this [data] than clearTimeout will run every time this value changes (useEffect re-run)
  )

  return (
    <ExternalLink href={chainId && blockNumber ? getEtherscanLink(chainId, blockNumber.toString(), 'block') : ''}>
      <div className={styles.polling}>
        {blockNumber}
        <span className={styles.dot}>{!isMounted && <i className={styles.spinner} />}</span>
      </div>
    </ExternalLink>
  )
}
