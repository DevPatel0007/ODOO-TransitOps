import * as React from 'react';
import { cn } from '@/lib/utils';

type SheetContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error('Sheet components must be used inside <Sheet />');
  }
  return context;
}

export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return <SheetContext.Provider value={{ open, onOpenChange }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({
  children,
  render,
}: {
  children?: React.ReactNode;
  render?: React.ReactNode;
}) {
  const { onOpenChange, open } = useSheetContext();

  const content = render ?? children;
  if (!React.isValidElement(content)) {
    return null;
  }

  return React.cloneElement(content as React.ReactElement<any>, {
    onClick: (event: React.MouseEvent) => {
      content.props?.onClick?.(event);
      onOpenChange(!open);
    },
  });
}

export function SheetContent({
  children,
  side = 'right',
  className,
}: {
  children: React.ReactNode;
  side?: 'left' | 'right';
  className?: string;
}) {
  const { open, onOpenChange } = useSheetContext();

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [onOpenChange, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close sheet"
        className="absolute inset-0 bg-slate-950/40"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          'absolute top-0 h-full w-[320px] max-w-[85vw] bg-white shadow-2xl',
          side === 'left' ? 'left-0' : 'right-0',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
