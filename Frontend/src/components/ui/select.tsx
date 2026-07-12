import * as React from "react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}>({});

export function Select({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ children, className, ...props }: any) {
  const { open, setOpen } = React.useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => setOpen?.(!open)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300 dark:text-zinc-50 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
      <span className="ml-2 text-xs text-zinc-500">▼</span>
    </button>
  )
}

export function SelectValue({ placeholder }: any) {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>;
}

export function SelectContent({ children, className }: any) {
  const { open, setOpen } = React.useContext(SelectContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen?.(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-zinc-200 bg-white text-zinc-950 shadow-md animate-in fade-in-80 w-full mt-1 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50 max-h-60 overflow-y-auto",
        className
      )}
    >
      <div className="p-1">{children}</div>
    </div>
  )
}

export function SelectItem({ value, children, className, ...props }: any) {
  const { value: selectedValue, onValueChange, setOpen } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;
  
  return (
    <div
      onClick={() => {
        onValueChange?.(value);
        setOpen?.(false);
      }}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 focus:text-zinc-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer dark:hover:text-zinc-50 dark:focus:bg-zinc-800",
        isSelected && "bg-zinc-100 dark:bg-zinc-800 font-semibold",
        className
      )}
      {...props}
    >
      {isSelected && <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">✓</span>}
      {children}
    </div>
  )
}
