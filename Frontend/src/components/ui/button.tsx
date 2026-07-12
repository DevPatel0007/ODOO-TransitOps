import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'xs' | 'lg' | 'icon';
  nativeButton?: boolean;
  render?: React.ReactElement;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "button", variant = 'default', size = 'default', nativeButton = true, render, children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-border bg-card text-foreground hover:bg-muted hover:text-foreground',
      ghost: 'bg-transparent text-foreground hover:bg-muted',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    }[variant]

    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      xs: 'h-8 rounded-md px-2.5 text-xs',
      lg: 'h-11 rounded-xl px-6',
      icon: 'h-10 w-10',
    }[size]

    const sharedClasses = cn(
      'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer',
      variantClasses,
      sizeClasses,
      className
    )

    if (!nativeButton && render && React.isValidElement(render)) {
      const renderElement = render as React.ReactElement<any>
      const renderProps = renderElement.props as { className?: string; children?: React.ReactNode }
      return React.cloneElement(renderElement, {
        className: cn(sharedClasses, renderProps.className),
        children,
        ...props,
      })
    }

    return (
      <button
        type={type}
        className={sharedClasses}
        ref={ref}
        children={children}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
