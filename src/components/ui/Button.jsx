import React from 'react';

export default function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`ui-btn ui-btn-${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

