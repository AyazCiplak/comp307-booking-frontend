interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) => {
  const baseStyles =
    "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center border-0 cursor-pointer";

  const variants = {
    // Main action — steel blue (#507DA7), matches existing site buttons
    primary:   "bg-steel-blue   text-white hover:opacity-90 focus:ring-steel-blue",
    // Secondary action — light blue (#629DFC)
    secondary: "bg-light-blue   text-white hover:opacity-90 focus:ring-light-blue",
    // Destructive action — dark red (#BD271D)
    danger:    "bg-dark-red     text-white hover:opacity-90 focus:ring-dark-red",
    // Minimal / tertiary — no background, dark grey text, light grey hover
    ghost:     "bg-transparent  text-dark-grey hover:bg-light-grey focus:ring-dark-grey",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
