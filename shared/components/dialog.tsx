// components/ui/dialog.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center bg-black/50">
          <div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-100"
            onClick={() => onOpenChange(false)}
          />
          {children}
        </div>
      )}
    </>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({ children, className = "" }: DialogContentProps) {
  return (
    <div className={`fixed z-50 grid w-full gap-4 rounded-b-lg border bg-white p-6 shadow-lg animate-in fade-in-90 slide-in-from-bottom-10 sm:rounded-lg sm:zoom-in-90 sm:slide-in-from-bottom-0 ${className}`}>
      {children}
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col space-y-1.5 text-center sm:text-left">
      {children}
    </div>
  );
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold leading-none tracking-tight">
      {children}
    </h2>
  );
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
      {children}
    </div>
  );
}