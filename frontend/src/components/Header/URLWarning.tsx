import React from 'react'
import styled from 'styled-components'

import { AlertTriangle, X } from 'react-feather'
import { useURLWarningToggle, useURLWarningVisible } from '../../state/user/hooks'
import { isMobile } from 'react-device-detect'

const PhishAlert = styled.div<{ isActive: any }>`
  width: 100%;
  padding: 6px 6px;
  background-color: #f19e9c;
  color: #ffffff;
  font-size: 11px;
  justify-content: space-between;
  align-items: center;
  display: ${({ isActive }) => (isActive ? 'flex' : 'none')};
  z-index: 999;
`

export const StyledClose = styled(X)`
  :hover {
    cursor: pointer;
  }
`

export default function URLWarning() {
  const toggleURLWarning = useURLWarningToggle()
  const showURLWarning = useURLWarningVisible()

  return isMobile ? (
    <PhishAlert isActive={showURLWarning}>
      <div style={{ display: 'flex' }}>
        <AlertTriangle style={{ marginRight: 6 }} size={12} /> Make sure the URL is
        <code style={{ padding: '0 4px', display: 'inline', fontWeight: 'bold' }}>latt.vercel.app</code>
      </div>
      <StyledClose size={12} onClick={toggleURLWarning} />
    </PhishAlert>
  ) : window.location.hostname === 'latt.vercel.app' ? (
    <PhishAlert isActive={showURLWarning}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <AlertTriangle style={{ marginRight: 6 }} size={12} /> Always make sure the URL is
        <code style={{ padding: '0 4px', display: 'inline', fontWeight: 'bold' }}>latt.vercel.app</code> - bookmark it
        to be safe.
      </div>
      <StyledClose size={12} onClick={toggleURLWarning} />
    </PhishAlert>
  ) : null
}
