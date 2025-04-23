// shared/components/Avatar.tsx
"use client";

import * as React from "react";

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className = "", src, alt, fallback, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
        {...props}
      >
        {src && <img className="aspect-square h-full w-full" src={src} alt={alt} />}
        {fallback && (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            {fallback}
          </span>
        )}
      </span>
    );
  }
);

Avatar.displayName = "Avatar";

const AvatarImage = ({ className = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return <img className={`aspect-square h-full w-full ${className}`} {...props} />;
};

const AvatarFallback = ({ className = "", ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}
      {...props}
    />
  );
};

export { Avatar, AvatarImage, AvatarFallback };