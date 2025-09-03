import { cn } from "@/lib/utils";

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}

export const FloatingElement = ({ 
  children, 
  className,
  delay = 0,
  style
}: FloatingElementProps) => {
  return (
    <div 
      className={cn(
        "flow-gentle opacity-70 hover:opacity-100 transition-opacity duration-500",
        className
      )}
      style={{ 
        animationDelay: `${delay}s`,
        ...style
      }}
    >
      {children}
    </div>
  );
};

interface FloatingDotsProps {
  count?: number;
  className?: string;
}

export const FloatingDots = ({ count = 5, className }: FloatingDotsProps) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <FloatingElement
          key={i}
          delay={i * 0.5}
          className={cn(
            "absolute w-2 h-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20",
            i % 2 === 0 ? "animate-pulse" : ""
          )}
          style={{
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
          }}
        >
          <div className="w-full h-full rounded-full bg-current" />
        </FloatingElement>
      ))}
    </div>
  );
};