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
        'flex items-center gap-2 has-disabled:opacity-50',
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
      className={cn('flex items-center gap-2', className)}
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
        'bg-input/30 border-input text-foreground relative flex size-11 items-center justify-center rounded-3xl border text-sm uppercase transition-colors',
        slot?.isActive && 'border-ring ring-ring/50 ring-[3px]',
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
