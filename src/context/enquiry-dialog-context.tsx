"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { trackWhatsAppConversion } from "@/lib/analytics";
import {
  getWhatsAppLeadHref,
  persistWhatsAppPopupClick,
} from "@/lib/whatsapp-popup";

interface EnquiryDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openDialog: (packageId?: string) => void;
  selectedPackageId: string | undefined;
  whatsAppOpen: boolean;
  onWhatsAppOpenChange: (open: boolean) => void;
  onWhatsAppChat: () => void;
  onWhatsAppLater: () => void;
}

const EnquiryDialogContext = createContext<EnquiryDialogContextValue | null>(
  null
);

const WHATSAPP_POPUP_DELAY_MS = 2_000;
const SCROLL_TRIGGER_RATIO = 0.4;
const ENQUIRY_AFTER_DISMISS_MS = 500;

interface EnquiryDialogProviderProps {
  children: ReactNode;
  destinationLabel: string;
}

export function EnquiryDialogProvider({
  children,
  destinationLabel,
}: EnquiryDialogProviderProps) {
  const [open, setOpen] = useState(false);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>();
  const leadPromptConsumed = useRef(false);
  const skipEnquiryOnWhatsAppClose = useRef(false);
  const enquiryOpenRef = useRef(false);
  const enquiryTimer = useRef<number | null>(null);

  const clearEnquiryTimer = useCallback(() => {
    if (enquiryTimer.current !== null) {
      window.clearTimeout(enquiryTimer.current);
      enquiryTimer.current = null;
    }
  }, []);

  const openDialog = useCallback(
    (packageId?: string) => {
      leadPromptConsumed.current = true;
      skipEnquiryOnWhatsAppClose.current = true;
      clearEnquiryTimer();
      setWhatsAppOpen(false);
      if (packageId) setSelectedPackageId(packageId);
      setOpen(true);
    },
    [clearEnquiryTimer]
  );

  const openEnquiryAfterDismiss = useCallback(() => {
    clearEnquiryTimer();
    enquiryTimer.current = window.setTimeout(() => {
      setOpen(true);
    }, ENQUIRY_AFTER_DISMISS_MS);
  }, [clearEnquiryTimer]);

  const onWhatsAppOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setWhatsAppOpen(true);
        return;
      }
      setWhatsAppOpen(false);
      if (skipEnquiryOnWhatsAppClose.current) {
        skipEnquiryOnWhatsAppClose.current = false;
        return;
      }
      openEnquiryAfterDismiss();
    },
    [openEnquiryAfterDismiss]
  );

  const onWhatsAppLater = useCallback(() => {
    onWhatsAppOpenChange(false);
  }, [onWhatsAppOpenChange]);

  const onWhatsAppChat = useCallback(() => {
    skipEnquiryOnWhatsAppClose.current = true;
    trackWhatsAppConversion();
    persistWhatsAppPopupClick();
    window.open(
      getWhatsAppLeadHref(destinationLabel),
      "_blank",
      "noopener,noreferrer"
    );
    setWhatsAppOpen(false);
  }, [destinationLabel]);

  useEffect(() => {
    enquiryOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (leadPromptConsumed.current) return;

    const showWhatsAppPopup = () => {
      if (leadPromptConsumed.current) return;
      if (enquiryOpenRef.current) {
        leadPromptConsumed.current = true;
        return;
      }
      leadPromptConsumed.current = true;
      setWhatsAppOpen(true);
    };

    const onScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll <= 0 ? 1 : window.scrollY / maxScroll;
      if (ratio >= SCROLL_TRIGGER_RATIO) {
        showWhatsAppPopup();
      }
    };

    const timer = window.setTimeout(showWhatsAppPopup, WHATSAPP_POPUP_DELAY_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    return () => clearEnquiryTimer();
  }, [clearEnquiryTimer]);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      openDialog,
      selectedPackageId,
      whatsAppOpen,
      onWhatsAppOpenChange,
      onWhatsAppChat,
      onWhatsAppLater,
    }),
    [
      open,
      openDialog,
      selectedPackageId,
      whatsAppOpen,
      onWhatsAppOpenChange,
      onWhatsAppChat,
      onWhatsAppLater,
    ]
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
