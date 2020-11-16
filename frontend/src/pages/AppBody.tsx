import React from 'react'

import styles from './App.module.scss'

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return <div className={styles.bodyWrapper}>{children}</div>
}
