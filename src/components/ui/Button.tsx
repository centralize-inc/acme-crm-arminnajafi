import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const STYLES: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export function Button({ variant = 'primary', children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={`px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50 ${STYLES[variant]} ${className ?? ''}`}
    >
      {children}
    </button>
  );
}
