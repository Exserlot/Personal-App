/**
 * QR Code Parser for Thai PromptPay
 * Supports EMVCo QR Code format used in Thai banking
 */

interface ParsedQRData {
  amount?: number;
  recipient?: string;
  reference?: string;
  rawData: string;
}

/**
 * Parse EMVCo format QR code (Thai PromptPay)
 * Format: Tag-Length-Value (TLV)
 */
export function parsePromptPayQR(rawData: string): ParsedQRData {
  const result: ParsedQRData = {
    rawData,
  };

  try {
    // EMVCo QR format uses TLV encoding
    let pos = 0;
    const data = rawData;

    while (pos < data.length - 4) { // Ensure at least Tag(2) + Length(2) remains
      const tag = data.substring(pos, pos + 2);
      const lengthStr = data.substring(pos + 2, pos + 4);
      const length = parseInt(lengthStr, 10);
      
      if (isNaN(length)) break;
      
      const value = data.substring(pos + 4, pos + 4 + length);
      pos += 4 + length;

      // Parse specific tags
      switch (tag) {
        case '00': // Payload Format Indicator OR Mini-QR Wrapper
          // Check if this value itself looks like a TLV structure (Mini QR)
          // Heuristic: Starts with '00' or '01' and has reasonable length
          if (length > 10 && (value.startsWith('00') || value.startsWith('01'))) {
             // Recursive parse!
             const subData = parsePromptPayQR(value);
             if (subData.amount) result.amount = subData.amount;
             if (subData.recipient) result.recipient = subData.recipient;
             if (subData.reference) result.reference = subData.reference;
          }
          break;
        case '01': // Mini-QR: Receiving/Sending Bank ID
           // In Mini-QR, Tag 01 inside Tag 00 is Bank ID
           // We might store it in reference or separate field if needed
           break;
        case '02': // Mini-QR: Transaction Reference
           result.reference = value;
           break;
        case '54': // Transaction Amount
          result.amount = parseFloat(value);
          break;
        case '59': // Merchant Name (Recipient)
          result.recipient = value;
          break;
        case '62': // Additional Data
          // Parse nested TLV for reference
          const refMatch = value.match(/05(\d{2})(.+)/);
          if (refMatch && refMatch[2]) {
            result.reference = refMatch[2].substring(0, parseInt(refMatch[1]));
          }
          break;
        case '30': // PromptPay ID
        case '29': // PromptPay ID (alternative)
          // This contains the recipient's ID/phone number
          const idMatch = value.match(/01(\d{2})(.+)/);
          if (idMatch && idMatch[2] && !result.recipient) {
            const recipientId = idMatch[2].substring(0, parseInt(idMatch[1]));
            result.recipient = recipientId;
          }
          break;
      }
    }
  } catch (error) {
    console.error('Error parsing PromptPay QR:', error);
  }

  return result;
}

/**
 * Extract QR data from various formats
 * Attempts to parse as PromptPay first, then falls back to raw data
 */
export function extractQRData(rawData: string): ParsedQRData {
  // Check if it looks like EMVCo format (starts with version tag)
  // Check if it looks like EMVCo format (starts with version tag)
  if (rawData.startsWith('00')) {
    return parsePromptPayQR(rawData);
  }

  // Fallback: return raw data
  return {
    rawData,
  };
}
