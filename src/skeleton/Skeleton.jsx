/**
 * Base Skeleton primitive component for Addis Eats.
 * Renders an accessible, animated placeholder with customizable geometry and variants.
 */
function Skeleton({
  variant = 'text',
  width,
  height,
  borderRadius,
  className = '',
  style = {},
  animation = 'shimmer',
  ariaLabel = 'Loading content...',
  as: Component = variant === 'text' ? 'span' : 'div',
  ...props
}) {
  const customStyles = {
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
    ...(borderRadius !== undefined ? { borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius } : {}),
    ...style,
  }

  const classes = [
    'skeleton',
    `skeleton-${variant}`,
    animation === 'pulse' ? 'skeleton-pulse' : '',
    animation === 'none' ? 'skeleton-none' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Component
      className={classes}
      style={customStyles}
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
      {...props}
    />
  )
}

export default Skeleton
