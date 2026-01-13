import * as React from 'react'

import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '../ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { CreateEventForm } from '@/components/events/create-event-form'

export function CreateEventDrawer({
  authUserId,
  open,
  onOpenChange,
}: {
  authUserId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal={true}>
      <DrawerContent ref={containerRef}>
        <div className="flex justify-center">
          <div className="max-w-md grow">
            <DrawerHeader className="flex flex-row justify-between items-center">
              <DrawerTitle>Create Event</DrawerTitle>
              <DrawerClose asChild>
                <Button size={'icon-sm'} variant={'ghost'}>
                  <HugeiconsIcon icon={Cancel01Icon} />
                </Button>
              </DrawerClose>
            </DrawerHeader>

            <DrawerFooter>
              <CreateEventForm
                authUserId={authUserId}
                containerRef={containerRef}
              />
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
