interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = ''
}: ButtonProps) => {
  const baseStyles = "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center border-0 cursor-pointer";

  const variants = {
    // "Primary" matches styling of Rhea's currently-styled buttons
    primary:   "bg-steel-blue   text-white hover:opacity-90 focus:ring-steel-blue",
    secondary: "bg-light-blue   text-white hover:opacity-90 focus:ring-light-blue",
    // "Danger" used for "destructive" actions e.g. delete booking slot
    danger:    "bg-dark-red     text-white hover:opacity-90 focus:ring-dark-red",
    // "Ghost" is a minimal "transparent" button that turns grey on hover
    ghost:     "bg-transparent  text-dark-grey hover:bg-light-grey focus:ring-dark-grey",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
