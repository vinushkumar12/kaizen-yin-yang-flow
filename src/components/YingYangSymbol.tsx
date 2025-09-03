import { cn } from "@/lib/utils";

interface YingYangSymbolProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

export const YingYangSymbol = ({ 
  size = "md", 
  animate = false, 
  className 
}: YingYangSymbolProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  return (
    <div 
      className={cn(
        "relative rounded-full",
        sizeClasses[size],
        animate && "ying-yang-spin",
        className
      )}
    >
      {/* Main Circle */}
      <div className="w-full h-full rounded-full bg-gradient-to-r from-yang via-yang to-ying relative overflow-hidden">
        {/* Yang Half (Black) */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-yang rounded-t-full"></div>
        
        {/* Ying Half (White) */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-ying rounded-b-full"></div>
        
        {/* Small Yang Dot in Ying */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 bg-yang rounded-full border border-ying"></div>
        
        {/* Small Ying Dot in Yang */}
        <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1/4 h-1/4 bg-ying rounded-full border border-yang"></div>
        
        {/* Center Divider */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-yang via-balance to-ying opacity-30"></div>
      </div>
    </div>
  );
};