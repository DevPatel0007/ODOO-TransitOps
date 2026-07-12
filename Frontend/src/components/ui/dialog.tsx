import * as React from "react"
import { cn } from "@/lib/utils"

const DialogContext = React.createContext<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>({});

export function Dialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogTrigger({ children, render, asChild, ...props }: any) {
  const { onOpenChange } = React.useContext(DialogContext);

  const triggerElement = (render ?? children) as React.ReactElement<any> | undefined;

  if (triggerElement && React.isValidElement(triggerElement)) {
    const triggerProps = triggerElement.props as { onClick?: (event: any) => void }
    return React.cloneElement(triggerElement, {
      onClick: (e: any) => {
        triggerProps.onClick?.(e);
        onOpenChange?.(true);
      },
      ...props,
    });
  }
  
  if (asChild) {
    return React.cloneElement(children, {
      onClick: (e: any) => {
        if (children.props.onClick) children.props.onClick(e);
        if (onOpenChange) onOpenChange(true);
      },
      ...props
    });
  }

  return (
    <div
      onClick={(e) => {
        if (onOpenChange) onOpenChange(true);
      }}
      className="inline-block"
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogContent({ className, children, ...props }: any) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        onClick={() => onOpenChange?.(false)}
      />
      <div
        className={cn(
          'fixed z-50 grid w-full max-w-lg gap-4 border border-border bg-card p-6 shadow-2xl duration-200 rounded-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 backdrop-blur-sm',
          className
        )}
        {...props}
      >
        {children}
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute right-4 top-4 rounded-full h-8 w-8 flex items-center justify-center bg-muted/80 opacity-80 ring-offset-background transition-all hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer"
        >
          ✕
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

export function DialogHeader({ className, ...props }: any) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

export function DialogFooter({ className, ...props }: any) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0",
        className
      )}
      {...props}
    />
  )
}

export function DialogTitle({ className, ...props }: any) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-zinc-950 dark:text-zinc-50",
        className
      )}
      {...props}
    />
  )
}

export function DialogDescription({ className, ...props }: any) {
  return (
    <p
      className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)}
      {...props}
    />
  )
}
