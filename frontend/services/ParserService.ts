import { ShareIntent } from 'expo-share-intent';

export interface ParsedTransaction {
  amount?: number;
  merchant?: string;
  date?: Date;
  method?: 'GPay' | 'Paytm' | 'PhonePe' | 'Other';
  originalText?: string;
}

export const ParserService = {
  parseText: (text: string): ParsedTransaction => {
    let amount: number | undefined;
    let merchant: string | undefined;
    let method: 'GPay' | 'Paytm' | 'PhonePe' | 'Other' = 'Other';

    // Normalize text
    const cleanText = text.trim();

    // Regex Patterns (Simplified for demo, refine with real data)
    
    // Google Pay: "Paid ₹500 to Merchant Name"
    const gpayRegex = /Paid\s+₹?([0-9,.]+)\s+to\s+(.+?)(?:\n|$)/i;
    // Paytm: "Paid Rs. 500 to Merchant Name"
    const paytmRegex = /Paid\s+Rs\.?\s*([0-9,.]+)\s+to\s+(.+?)(?:\s+at|$)/i;
    // PhonePe: "Paid ₹500 to Merchant Name"
    const phonepeRegex = /Paid\s+₹?([0-9,.]+)\s+to\s+(.+?)(?:\n|$)/i;

    let match = cleanText.match(gpayRegex);
    if (match) {
      method = 'GPay';
      amount = parseFloat(match[1].replace(/,/g, ''));
      merchant = match[2].trim();
    } else if ((match = cleanText.match(paytmRegex))) {
      method = 'Paytm';
      amount = parseFloat(match[1].replace(/,/g, ''));
      merchant = match[2].trim();
    } else {
        // Fallback or generic parser if needed
    }

    // Attempt to find any currency-like number if no specific match
    if (!amount) {
        const currencyRegex = /(?:₹|Rs\.?)\s*([0-9,.]+)/i;
        const currencyMatch = cleanText.match(currencyRegex);
        if (currencyMatch) {
            amount = parseFloat(currencyMatch[1].replace(/,/g, ''));
        }
    }

    return {
      amount,
      merchant: merchant || "Unknown Merchant",
      date: new Date(), // Default to now
      method,
      originalText: cleanText,
    };
  },

  processShareIntent: async (shareIntent: ShareIntent): Promise<ParsedTransaction | null> => {
     if (shareIntent.type === 'text' || shareIntent.type === 'text/plain') {
         if (shareIntent.value) {
             return ParserService.parseText(shareIntent.value);
         }
     }
     
     // For images/files, we would integrate OCR here. 
     // Returning null for now to indicate "needs more processing" or "not supported yet"
     // dependent on how we handle the flow.
     if (shareIntent.type.startsWith('image')) {
         // TODO: Invoke OCR 
         return null; 
     }

     return null;
  }
};
