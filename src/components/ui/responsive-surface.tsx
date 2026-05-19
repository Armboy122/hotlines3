"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

interface ResponsiveSurfaceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function ResponsiveSurface({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ResponsiveSurfaceProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn("max-h-[92vh] overflow-y-auto lg:max-w-3xl", className)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={cn("max-h-[88dvh] overflow-hidden rounded-t-2xl", className)}>
        <DrawerHeader className="pr-16 text-left">
          <DrawerTitle>{title}</DrawerTitle>
          {description ? <DrawerDescription>{description}</DrawerDescription> : null}
        </DrawerHeader>
        <DrawerClose asChild>
          <Button
            aria-label="ปิด"
            className="absolute right-3 top-3"
            size="icon"
            type="button"
            variant="ghost"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </DrawerClose>
        <div className="overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
