"use client";

import React from "react";
import { PixelButton } from "@/components/ui/PixelButton";

export function ReceiptPrintButton() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <PixelButton
      size="sm"
      variant="ghost"
      onClick={handlePrint}
      title="Print or Save as PDF"
    >
      PRINT RECEIPT 🖨
    </PixelButton>
  );
}
