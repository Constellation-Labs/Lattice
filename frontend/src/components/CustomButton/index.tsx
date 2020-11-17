import React, { FC, ReactNode, MouseEvent } from 'react'
import cls from 'classnames'
import styles from './index.module.scss'

interface IButton {
  children: ReactNode
  type?: 'button' | 'submit'
  theme?: 'primary' | 'secondary'
  variant?: string
  id?: string
  name?: string
  onClick?: (ev: MouseEvent<HTMLElement>) => void
}

const Button: FC<IButton> = ({ type = 'button', theme = 'primary', children, onClick, variant, id, name }) => {
  const classes = cls(styles.button, styles[theme], variant)

  return (
    <button className={classes} {...{ type, id, name, onClick }}>
      {children}
    </button>
  )
}

export default Button
