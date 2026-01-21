import * as React from 'react'

import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { CreateCreditForm } from '@/components/credit/create-credit-form'

export function CreateCreditDrawer({
  eventId,
  shareToken,
  open,
  setOpen,
}: {
  eventId: string
  shareToken: string
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  return (
    <Drawer open={open} onOpenChange={setOpen} modal={true}>
      <DrawerContent ref={containerRef} className="">
        <div className="flex justify-center">
          <div className="max-w-md grow">
            <DrawerHeader className="flex flex-row justify-between items-center">
              <DrawerTitle>Add credit</DrawerTitle>
              <DrawerClose asChild>
                <Button size={'icon-sm'} variant={'ghost'}>
                  <HugeiconsIcon icon={Cancel01Icon} />
                </Button>
              </DrawerClose>
            </DrawerHeader>

            <DrawerFooter>
              <CreateCreditForm
                eventId={eventId}
                shareToken={shareToken}
                handleSubmit={() => setOpen(false)}
                containerRef={containerRef}
              />
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
