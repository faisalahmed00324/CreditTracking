import { RadioGroup as ChakraRadioGroup } from "@chakra-ui/react"
import { forwardRef } from "react"

export const RadioGroup = forwardRef(
  function RadioGroup(props, ref) {
    const { children, ...rest } = props
    return (
      <ChakraRadioGroup.Root ref={ref} {...rest}>
        {children}
      </ChakraRadioGroup.Root>
    )
  }
)

export const Radio = forwardRef(function Radio(props, ref) {
  const { children, ...rest } = props
  return (
    <ChakraRadioGroup.Item ref={ref} {...rest}>
      <ChakraRadioGroup.ItemHiddenInput />
      <ChakraRadioGroup.ItemControl />
      <ChakraRadioGroup.ItemText>{children}</ChakraRadioGroup.ItemText>
    </ChakraRadioGroup.Item>
  )
})
