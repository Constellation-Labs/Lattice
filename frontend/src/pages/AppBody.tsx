import React from 'react'
import styled from 'styled-components'

export const BodyWrapper = styled.div`
  position: relative;
  max-width: 400px;
  width: 100%;
  background: linear-gradient(180deg, rgba(55, 97, 111, 0.9) 0%, rgba(55, 97, 111, 0.9) 100%);
  box-shadow: 0 0 10px 10px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  padding: 1rem;
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>
}
