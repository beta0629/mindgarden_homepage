import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-transparent font-semibold whitespace-nowrap transition-colors duration-200 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-fill text-surface hover:bg-fill-strong",
        outline: "border-line bg-surface text-ink hover:bg-sand",
        ghost: "bg-transparent text-ink hover:text-brand",
        onDark: "bg-surface text-deep hover:bg-sand",
        onDarkGhost: "bg-transparent text-on-deep hover:text-surface",
        default: "bg-fill text-surface hover:bg-fill-strong",
      },
      size: {
        sm: "h-10 gap-2 px-4 type-sm",
        md: "h-12 gap-2 px-6 type-sm",
        lg: "h-control gap-2 px-8 type-sm",
        default: "h-12 gap-2 px-6 type-sm",
        icon: "size-10",
        "icon-sm": "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
