// Programmed by Ayaz Ciplak
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card = ({ children, className = '', onClick }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-light-grey overflow-hidden ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

Card.Header = ({ children, className = '' }: CardHeaderProps) => {
  return (
    <div className={`px-5 py-4 border-b border-light-grey ${className}`}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

Card.Content = ({ children, className = '' }: CardContentProps) => {
  return (
    <div className={`px-5 py-4 ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

Card.Footer = ({ children, className = '' }: CardFooterProps) => {
  return (
    // Subtle "light grey" colour used in colour palette
    <div className={`px-5 py-4 border-t border-light-grey bg-light-grey/20 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
