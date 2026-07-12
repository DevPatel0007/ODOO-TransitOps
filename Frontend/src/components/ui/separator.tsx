import * as React from "react"
import { cn } from "@/lib/utils"

export function Separator({ className, orientation = "horizontal", ...props }: any) {
  return (
    <div
      className={cn(
        "shrink-0 bg-zinc-200 dark:bg-zinc-800",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
}
