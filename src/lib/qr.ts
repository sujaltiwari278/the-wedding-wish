import QRCode from "qrcode";

/**
 * Generates a QR Code as a Data URL (base64 PNG) pointing to the target URL
 * Styled with retro wedding palette colors (#75404F deep rose on #FFF7F2 warm cream)
 */
export async function generateQrDataUrl(url: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 8,
      color: {
        dark: "#75404F", // Deep Rose
        light: "#FFF7F2", // Warm Cream
      },
    });
    return dataUrl;
  } catch (error) {
    console.error("QR Code Generation Error:", error);
    throw error;
  }
}
