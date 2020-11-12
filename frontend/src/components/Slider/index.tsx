import React, { useCallback } from 'react'
import styled from 'styled-components'
import { lighten } from 'polished'

const StyledRangeInput = styled.input<{ size: number }>`
  -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
  width: 100%; /* Specific width is required for Firefox. */
  background: transparent; /* Otherwise white in Chrome */
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &::-moz-focus-outer {
    border: 0;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: ${({ size }) => size}px;
    width: ${({ size }) => size}px;
    background-color: #565a69;
    border-radius: 100%;
    border: none;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.swapBg};

    &:hover,
    &:focus {
      box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.08), 0px 16px 24px rgba(0, 0, 0, 0.06),
        0px 24px 32px rgba(0, 0, 0, 0.04);
    }
  }

  &::-moz-range-thumb {
    height: ${({ size }) => size}px;
    width: ${({ size }) => size}px;
    background-color: #565a69;
    border-radius: 100%;
    border: none;
    color: ${({ theme }) => theme.swapBg};

    &:hover,
    &:focus {
      box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.08), 0px 16px 24px rgba(0, 0, 0, 0.06),
        0px 24px 32px rgba(0, 0, 0, 0.04);
    }
  }

  &::-ms-thumb {
    height: ${({ size }) => size}px;
    width: ${({ size }) => size}px;
    background-color: #565a69;
    border-radius: 100%;
    color: ${({ theme }) => theme.swapBg};

    &:hover,
    &:focus {
      box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.08), 0px 16px 24px rgba(0, 0, 0, 0.06),
        0px 24px 32px rgba(0, 0, 0, 0.04);
    }
  }

  &::-webkit-slider-runnable-track {
    background: linear-gradient(
      90deg,
      ${({ theme }) => lighten(0.1, theme.swapBg)},
      ${({ theme }) => lighten(0.1, theme.swapBg)}
    );
    height: 2px;
  }

  &::-moz-range-track {
    background: linear-gradient(
      90deg,
      ${({ theme }) => lighten(0.1, theme.swapBg)},
      ${({ theme }) => lighten(0.1, theme.swapBg)}
    );
    height: 2px;
  }

  &::-ms-track {
    width: 100%;
    border-color: transparent;
    color: transparent;

    background: ${({ theme }) => lighten(0.1, theme.swapBg)};
    height: 2px;
  }
  &::-ms-fill-lower {
    background: ${({ theme }) => lighten(0.1, theme.swapBg)};
  }
  &::-ms-fill-upper {
    background: ${({ theme }) => lighten(0.1, theme.swapBg)};
  }
`

interface InputSliderProps {
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  size?: number
}

export default function Slider({ value, onChange, min = 0, step = 1, max = 100, size = 28 }: InputSliderProps) {
  const changeCallback = useCallback(
    e => {
      onChange(parseInt(e.target.value))
    },
    [onChange]
  )

  return (
    <StyledRangeInput
      size={size}
      type="range"
      value={value}
      style={{ width: '90%', marginLeft: 15, marginRight: 15, padding: '15px 0' }}
      onChange={changeCallback}
      aria-labelledby="input slider"
      step={step}
      min={min}
      max={max}
    />
  )
}
