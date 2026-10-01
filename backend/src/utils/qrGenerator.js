import QRCode from 'qrcode';

/**
 * Generates a QR Code Data URL (base64 PNG) for a given token or payload
 * @param {string} text - Token/String to encode
 * @returns {Promise<string>} Base64 data URL
 */
export const generateQrDataUrl = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 280,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('QR Generation failed:', err);
    // Fallback simple svg data url if qrcode library has issues
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="white"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="black">${encodeURIComponent(text)}</text></svg>`;
  }
};
