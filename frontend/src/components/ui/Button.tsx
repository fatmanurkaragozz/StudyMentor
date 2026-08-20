import type { ButtonHTMLAttributes, FC } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-brand-pink-light to-brand-pink-dark hover:opacity-90 text-white shadow-md',
  secondary: 'bg-gradient-to-r from-brand-mint to-brand-mint-dark hover:opacity-90 text-white shadow-md',
  ghost: 'bg-transparent text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-3 text-sm',
};

export const Button: FC<ButtonProps> = ({ variant = 'primary', size = 'md', className = '', children, ...rest }) => (
  <button
    className={`rounded-xl font-bold inline-flex items-center justify-center gap-2 transition-all ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);
