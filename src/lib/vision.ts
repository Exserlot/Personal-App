import vision from '@google-cloud/vision';

export const visionClient = new vision.ImageAnnotatorClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export interface OCRResult {
  amount: number | null;
  suggestedCategory: string | null;
  rawText?: string;
}

// Simple heuristic "AI" for category suggestion based on common Thai receipt/slip keywords
export function suggestCategoryFromText(text: string): string | null {
  const t = text.toLowerCase();
  
  if (t.includes('7-eleven') || t.includes('cpall') || t.includes('lotus') || t.includes('big c') || t.includes('makro') || t.includes('tops') || t.includes('supermarket')) {
    return 'shopping'; // Or 'food' / 'groceries'
  }
  if (t.includes('shopee') || t.includes('lazada') || t.includes('tiktok shop')) {
    return 'shopping';
  }
  if (t.includes('grab') || t.includes('foodpanda') || t.includes('lineman') || t.includes('robinhood') || t.includes('starbucks') || t.includes('cafe') || t.includes('restaurant')) {
    return 'food';
  }
  if (t.includes('bts') || t.includes('mrt') || t.includes('pt') || t.includes('ptt') || t.includes('shell') || t.includes('caltex') || t.includes('bangchak') || t.includes('bolt') || t.includes('uber')) {
    return 'travel';
  }
  if (t.includes('hospital') || t.includes('clinic') || t.includes('pharmacy') || t.includes('watsons') || t.includes('boots')) {
    return 'health';
  }
  if (t.includes('mea') || t.includes('pea') || t.includes('mwa') || t.includes('pwa') || t.includes('true') || t.includes('ais') || t.includes('dtac') || t.includes('3bb')) {
    return 'bills';
  }
  if (t.includes('netflix') || t.includes('spotify') || t.includes('youtube') || t.includes('cinema') || t.includes('major') || t.includes('sf')) {
    return 'entertainment';
  }

  return null;
}

export async function extractDataFromImage(buffer: Buffer): Promise<OCRResult> {
  const resultObj: OCRResult = { amount: null, suggestedCategory: null };
  try {
    const [result] = await visionClient.textDetection(buffer);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
        return resultObj;
    }

    const rawText = detections[0].description || "";
    resultObj.rawText = rawText;
    
    // 1. Suggest Category
    resultObj.suggestedCategory = suggestCategoryFromText(rawText);

    // 2. Extract Amount
    // Common pattern for Thai bank slips: numbers with commas and exactly 2 decimal places.
    // e.g., 1,500.00
    const moneyRegex = /\b\d{1,3}(?:,\d{3})*\.\d{2}\b/g;
    const matches = rawText.match(moneyRegex);

    if (!matches) {
        return resultObj;
    }

    // Convert strings to number and filter out 0.00 (usually used for fees)
    const amounts = matches
      .map(m => parseFloat(m.replace(/,/g, '')))
      .filter(val => val > 0); 
    
    if (amounts.length > 0) {
      // Heuristic: the transfer amount is usually the largest positive money value on standard e-slips.
      resultObj.amount = Math.max(...amounts);
    }

    return resultObj;

  } catch (error) {
    console.error("Vision OCR Error:", error);
    return resultObj;
  }
}
