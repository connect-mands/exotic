"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface EnquiryDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openDialog: (packageId?: string) => void;
  selectedPackageId: string | undefined;
}

const EnquiryDialogContext = createContext<EnquiryDialogContextValue | null>(
  null
);

const AUTO_OPEN_DELAY_MS = 800;

export function EnquiryDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>();

  const openDialog = useCallback((packageId?: string) => {
    if (packageId) setSelectedPackageId(packageId);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (hasAutoOpened) return;
    const timer = window.setTimeout(() => {
      setOpen(true);
      setHasAutoOpened(true);
    }, AUTO_OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hasAutoOpened]);

  const value = useMemo(
    () => ({ open, setOpen, openDialog, selectedPackageId }),
    [open, openDialog, selectedPackageId]
  );

  return (
    <EnquiryDialogContext.Provider value={value}>
      {children}
    </EnquiryDialogContext.Provider>
  );
}

export function useEnquiryDialog(): EnquiryDialogContextValue {
  const ctx = useContext(EnquiryDialogContext);
  if (!ctx) {
    throw new Error("useEnquiryDialog must be used within EnquiryDialogProvider");
  }
  return ctx;
}
