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
        'flex h-11 w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-2 text-sm text-slate-900 shadow-sm ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
      <span className="ml-2 text-xs text-slate-500">▼</span>
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
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-card text-slate-900 shadow-xl animate-in fade-in-80 w-full mt-2 max-h-60 overflow-y-auto backdrop-blur-sm',
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
        'relative flex w-full cursor-default select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-slate-700 outline-none hover:bg-blue-50 focus:bg-blue-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer',
        isSelected && 'bg-muted font-semibold',
        className
      )}
      {...props}
    >
      {isSelected && <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">✓</span>}
      {children}
    </div>
  )
}
