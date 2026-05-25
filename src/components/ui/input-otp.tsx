import * as React from 'react'
import {
  OTPInput,
  OTPInputContext,
} from 'input-otp'
import type { OTPInputProps } from 'input-otp'
import { cn } from '@/lib/utils'

function InputOTP({ className, containerClassName, ...props }: OTPInputProps) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        'has-disabled:opacity-50',
        containerClassName,
      )}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}

function InputOTPGroup({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        'bg-input/30 border-input flex w-fit overflow-hidden rounded-4xl border',
        className,
      )}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number
}) {
  const inputOtpContext = React.use(OTPInputContext)
  const slot = inputOtpContext.slots[index]

  return (
    <div
      data-slot="input-otp-slot"
      className={cn(
        'text-foreground relative flex size-11 items-center justify-center border-r text-sm uppercase transition-colors last:border-r-0',
        slot?.isActive && 'z-10 ring-ring/50 ring-inset ring-[3px]',
        className,
      )}
      {...props}
    >
      <span>{slot?.char}</span>
      {slot?.hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="bg-foreground h-4 w-px animate-pulse" />
        </div>
      )}
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot }
