import { ChainId } from 'lattswap'
import React from 'react'
import { Text } from 'rebass'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import Logo from '../../assets/svg/logo.svg'

import { useActiveWeb3React } from '../../hooks'
import { useETHBalances } from '../../state/wallet/hooks'
import { YellowCard } from '../Card'
import Settings from '../Settings'
import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status'

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  padding: 1.2rem 1rem 1rem 1rem;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: calc(100%);
    position: relative;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
   flex-direction: row-reverse;
    align-items: center;
  `};
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`

const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};
`

const HeaderLinks = styled(Row)`
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem 0 1rem 1rem;
    justify-content: flex-end;
`};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.baseBg};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;
  :focus {
    border: 1px solid blue;
  }
`

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const NetworkCard = styled(YellowCard)`
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  background: linear-gradient(180deg, #abf4fa 0%, rgba(171, 244, 250, 0) 100%);
  box-shadow: 0px 0px 1px 1px rgba(0, 0, 0, 0.25);
  color: white;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
  font-size: 12px;
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 120px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`

const LattIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

const StyledNavLink = styled(NavLink)`
  ${({ theme }) => theme.flexRowNoWrap};
  height: 30px;
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 12px;
  width: fit-content;
  margin: 0 10px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem;
  min-width: 60px;
`

const StyledNavSwapLink = styled(StyledNavLink)`
  background: linear-gradient(180deg, #abf4fa 0%, rgba(171, 244, 250, 0) 100%);
  box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.25);
  color: white;
`
const StyledNavPoolLink = styled(StyledNavLink)`
  background: linear-gradient(180deg, #f19e9c 0%, rgba(241, 158, 156, 0) 100%);
  box-shadow: 0px 0px 1px 1px rgba(0, 0, 0, 0.25);
  color: white;
`

const StyledNavAggreLink = styled(StyledNavLink)`
  background: linear-gradient(180deg, #abf4fa 0%, rgba(171, 244, 250, 0) 100%);
  box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.25);
  color: white;
`

const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.RINKEBY]: 'Rinkeby',
  [ChainId.ROPSTEN]: 'Ropsten',
  [ChainId.GÖRLI]: 'Görli',
  [ChainId.KOVAN]: 'Kovan'
}

export default function Header() {
  const { account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

  return (
    <HeaderFrame>
      <HeaderRow>
        <Title href=".">
          <LattIcon>
            <img width={'70px'} src={Logo} alt="logo" />
          </LattIcon>
        </Title>
        <HeaderLinks>
          <StyledNavSwapLink id={`swap-nav-link`} to={'/swap'}>
            {t('swap')}
          </StyledNavSwapLink>
          <StyledNavPoolLink id={`pool-nav-link`} to={'/pool'}>
            {t('pool')}
          </StyledNavPoolLink>
          <StyledNavAggreLink id={`aggregation-nav-link`} to={'/poly'}>
            {t('aggregation')}
          </StyledNavAggreLink>
        </HeaderLinks>
      </HeaderRow>
      <HeaderControls>
        <HeaderElement>
          <HideSmall>
            {chainId && NETWORK_LABELS[chainId] && (
              <NetworkCard title={NETWORK_LABELS[chainId]}>{NETWORK_LABELS[chainId]}</NetworkCard>
            )}
          </HideSmall>
          <AccountElement active={!!account} style={{ pointerEvents: 'auto', transform: 'translateY(-1px)' }}>
            {account && userEthBalance ? (
              <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                {userEthBalance?.toSignificant(4)} ETH
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <HeaderElementWrap>
          <Settings />
        </HeaderElementWrap>
      </HeaderControls>
    </HeaderFrame>
  )
}
