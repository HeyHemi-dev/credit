import React from 'react'

import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

type ActionDrawerProps = {
  content: { title: string; description?: string }
  state: { isOpen: boolean; setIsOpen: (open: boolean) => void }
  children?: React.ReactNode
  setContainerRef?: React.RefObject<HTMLDivElement | null>
}

export function ActionDrawer({
  content,
  state,
  children,
  setContainerRef,
}: ActionDrawerProps) {
  return (
    <Drawer open={state.isOpen} onOpenChange={state.setIsOpen} modal={true}>
      <DrawerContent ref={setContainerRef}>
        <div className="flex justify-center">
          <div className="max-w-md grow">
            <DrawerHeader className="grid gap-0.5">
              <div className="flex flex-row items-center justify-between">
                <DrawerTitle>{content.title}</DrawerTitle>
                <DrawerClose asChild>
                  <Button size={'icon-sm'} variant={'ghost'}>
                    <HugeiconsIcon icon={Cancel01Icon} />
                  </Button>
                </DrawerClose>
              </div>
              {content.description && (
                <DrawerDescription className="text-left text-sm text-muted-foreground">
                  {content.description}
                </DrawerDescription>
              )}
            </DrawerHeader>

            <DrawerFooter>{children}</DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
