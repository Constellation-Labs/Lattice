import React, { useRef } from 'react'
import styled from 'styled-components'

interface SwitchProps {
  checked: boolean
  onChange?: (e: React.ChangeEvent) => void
  checkedColor?: string
}

const SwitchWrapper = styled.div`
  display: inline-flex;
  vertical-align: top;
`

const SwitchInput = styled.input`
  height: 0;
  width: 0;
  display: none;
`

const SwitchLabel = styled.label`
  position: relative;
  width: 100px;
  height: 50px;
  background-color: gray;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
  &:active {
    span {
      width: 60px;
    }
  }
`

const SwitchButton = styled.span`
  position: absolute;
  height: 46px;
  width: 46px;
  top: 50%;
  left: 2px;
  // 这里不能使用border-radius: 50%;会导致在button变宽的时候样式变丑
  border-radius: 46px;
  transform: translateY(-50%);
  background-color: #fff;
  transition: all 0.2s;
  box-shadow: 0 0 2px 0 rgba(10, 10, 10, 0.29);
`

const Switch = ({ checked, onChange, checkedColor }: SwitchProps) => {
  // useRef返回一个可变的ref对象，其.current属性被初始化为传入的参数(initialValue)
  // 返回的ref对象在组件的整个生命周期内保持不变
  const idRef = useRef<string>()
  return (
    <SwitchWrapper>
      <SwitchInput checked={checked} onChange={onChange} id={idRef.current} type="checkbox" />
      <SwitchLabel style={{ backgroundColor: checked ? checkedColor : undefined }} htmlFor={idRef.current}>
        <SwitchButton />
      </SwitchLabel>
    </SwitchWrapper>
  )
}
Switch.defaultProps = {
  checkedColor: '#06D6A0'
}

export default Switch
