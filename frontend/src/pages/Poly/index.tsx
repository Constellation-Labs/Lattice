import React, { useCallback, useContext, useState, useEffect } from 'react'
import { ArrowRight } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonError, ButtonLight, ButtonConfirmed } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { AutoRow, RowBetween } from '../../components/Row'
import { ArrowWrapper, BottomGrouping, Wrapper } from '../../components/swap/styleds'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/poly/actions'
import Toggle from '../../components/Toggle'
import List from './List'
import Loader from '../../components/Loader'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { ONE_SPLIT_ADRESS } from '../../constants'
import { useSwapCallback } from '../../hooks/useOneInchSwapCallback'
import { lighten } from 'polished'

import { useDefaultsFromQuery, useDerivedPolyInfo, usePolyActionHandlers, usePolyState } from '../../state/poly/hooks'
import styled from 'styled-components'
import _ from 'lodash'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../state'
import { setResult } from '../../state/poly/actions'

const PolyWrapper = styled.div`
  position: relative;
  max-width: 1000px;
  width: 100%;
  background: ${({ theme }) => theme.swapBg};
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.01), 0 4px 8px rgba(0, 0, 0, 0.04), 0 16px 24px rgba(0, 0, 0, 0.04),
    0 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 1rem;
  padding: 1rem;
  margin-top: -5rem;
`

function PolyBody({ children }: { children: React.ReactNode }) {
  return <PolyWrapper>{children}</PolyWrapper>
}

const Title = styled(Text)<{ fontSize?: string; border?: boolean }>`
  font-size: ${({ fontSize }) => fontSize || '24px'};
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: ${({ border }) => (border ? '1px solid rgba(255, 255, 255, 0.3)' : 'none')};
`

const StyledBottomGrouping = styled(BottomGrouping)`
  margin: 1rem auto 0 auto;
  width: 400px;
`

const DexWrapper = styled.div`
  margin-top: 2rem;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  background: ${({ theme }) => lighten(0.1, theme.baseBg)};
`

export default function Swap() {
  useDefaultsFromQuery()

  const dispatch = useDispatch<AppDispatch>()
  const { account } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  const toggleWalletModal = useWalletModalToggle()

  const { typedValue, result, dex } = usePolyState()
  const { returnAmount = '0' } = result || {}
  const { currencies, inputError: swapInputError, approveAmount } = useDerivedPolyInfo()

  const isValid = !!swapInputError

  const [approval, approveCallback] = useApproveCallback(approveAmount, ONE_SPLIT_ADRESS)

  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED))

  const { onSwitchTokens, onCurrencySelection, onUserInput, onDexSwitch } = usePolyActionHandlers()
  // const swap = useSwapCallback()

  const handleReset = useCallback(() => {
    onUserInput(Field.INPUT, '')
    dispatch(setResult({ result: { returnAmount: '0', distribution: '0,0,0,0' } }))
  }, [onUserInput, dispatch])

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  const handleInputSelect = useCallback(
    inputCurrency => {
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )
  const handleOutputSelect = useCallback(
    outputCurrency => {
      onCurrencySelection(Field.OUTPUT, outputCurrency)
    },
    [onCurrencySelection]
  )

  const handleToggle = useCallback(
    (id: string, active: boolean) => {
      onDexSwitch(id, active)
    },
    [onDexSwitch]
  )
  // const oneSplitContract = useOneSplitContract()

  // const fromCurrency = useToken(inputCurrencyId === 'ETH' ? ETH_ADDRESS : inputCurrencyId )
  // const destCurrency = useToken(outputCurrencyId === 'ETH' ? ETH_ADDRESS : outputCurrencyId)
  // const swapAmount = tryParseSwapAmount('1', fromCurrency)
  // const returnAmount = tryParseSwapAmount('9', destCurrency)
  // const distribution = [100, 0, 0, 0]

  // const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(oneSplitContract, fromCurrency, destCurrency, swapAmount, returnAmount, distribution, 10, null)
  // const { callback: swapCallback } = useSwapCallback(oneSplitContract, fromCurrency, destCurrency, swapAmount, returnAmount, distribution, 10, null)
  const { callback: swapCallback } = useSwapCallback()

  const [
    {
      showConfirm
      // tradeToConfirm,
      // swapErrorMessage,
      // attemptingTxn,
      // txHash
    },
    setSwapState
  ] = useState<{
    showConfirm: boolean
    // tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    // tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  })

  const handleSwap = useCallback(() => {
    if (!swapCallback) {
      return
    }

    setSwapState({
      attemptingTxn: true,
      // tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined
    })

    swapCallback()
      .then(hash => {
        setSwapState({
          attemptingTxn: false,
          // tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: hash
        })
        handleReset()
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          // tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined
        })
      })
  }, [showConfirm, swapCallback])

  return (
    <>
      <PolyBody>
        <Title border={true}>Swap Token</Title>
        <Wrapper id="poly-page">
          <RowBetween>
            <div style={{ width: '400px' }}>
              <CurrencyInputPanel
                label={'From'}
                value={typedValue}
                showMaxButton={false}
                currency={currencies[Field.INPUT]}
                onUserInput={handleTypeInput}
                onCurrencySelect={handleInputSelect}
                otherCurrency={currencies[Field.OUTPUT]}
                id="poly-currency-input"
              />
            </div>
            <AutoColumn justify="space-between">
              <AutoRow justify={'center'} style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable>
                  <ArrowRight
                    size="16"
                    onClick={() => {
                      onSwitchTokens()
                    }}
                    color={theme.label}
                  />
                </ArrowWrapper>
              </AutoRow>
            </AutoColumn>
            <div style={{ width: '400px' }}>
              <CurrencyInputPanel
                disabled
                value={returnAmount}
                onUserInput={handleTypeOutput}
                label={'To'}
                showMaxButton={false}
                currency={currencies[Field.OUTPUT]}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT]}
                id="poly-currency-output"
              />
            </div>
          </RowBetween>
          <DexWrapper>
            <Title border={false} fontSize="16px">
              Spread across DEXes:
              <div style={{ marginTop: '1rem' }}>
                <RowBetween>
                  {dex &&
                    _.map(dex, ({ id, name, active }) => {
                      return (
                        <div key={id} style={{ display: 'flex', alignItems: 'center' }}>
                          <Toggle
                            toggle={() => {
                              if (id != null) {
                                handleToggle(id, !active)
                              }
                            }}
                            isActive={!!active}
                            id={id}
                          />
                          <Text style={{ marginLeft: '10px' }}>{name}</Text>
                        </div>
                      )
                    })}
                </RowBetween>
              </div>
            </Title>
          </DexWrapper>
          <StyledBottomGrouping>
            {!account ? (
              <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
            ) : showApproveFlow ? (
              <RowBetween>
                <ButtonConfirmed
                  onClick={approveCallback}
                  disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                  width="48%"
                  altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                  confirmed={approval === ApprovalState.APPROVED}
                >
                  {approval === ApprovalState.PENDING ? (
                    <AutoRow gap="6px" justify="center">
                      Approving <Loader stroke="white" />
                    </AutoRow>
                  ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve ' + currencies[Field.INPUT]?.symbol
                  )}
                </ButtonConfirmed>
                <ButtonError
                  onClick={() => {
                    handleSwap()
                  }}
                  width="48%"
                  id="swap-button1"
                  disabled={!isValid || approval !== ApprovalState.APPROVED}
                  error={isValid}
                >
                  <Text fontSize={14} fontWeight={500}>
                    Swap
                  </Text>
                </ButtonError>
              </RowBetween>
            ) : (
              <RowBetween>
                <ButtonError
                  onClick={() => {
                    handleSwap()
                  }}
                  width="100%"
                  id="swap-button"
                  disabled={isValid}
                  error={false}
                >
                  <Text fontSize={16} fontWeight={500}>
                    {swapInputError ? swapInputError : 'swap'}
                  </Text>
                </ButtonError>
              </RowBetween>
            )}
          </StyledBottomGrouping>
          <List />
        </Wrapper>
      </PolyBody>
    </>
  )
}
