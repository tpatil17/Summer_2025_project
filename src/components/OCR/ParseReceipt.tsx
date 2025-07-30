export interface ParsedReceipt {
    store: string;
    total: number | null;
    date: string | null;
  }
  
  export const parseReceiptText = (text: string): ParsedReceipt => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
    // 🔍 Smart store name detection (uppercase line near the top)
    const possibleStore = lines.find(
      line =>
        /^[A-Z\s]{3,}$/.test(line) && // mostly uppercase
        line.length > 3 &&
        !line.toLowerCase().includes('total')
    );
    const store = possibleStore || lines[0] || 'Unknown';
  
    // 💰 Improved amount detection
    const amountMatch =
      text.match(/total\s*[:\-]?\s*\$?\s?(\d+[.,]?\d{0,2})/i) ||
      text.match(/amount\s*[:\-]?\s*\$?\s?(\d+[.,]?\d{0,2})/i) ||
      text.match(/\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s+TOTAL/i);
  
    const total = amountMatch
      ? parseFloat(amountMatch[1].replace(/,/g, ''))
      : null;
  

      // 📆 Date matching (multiple formats)
    const rawDateMatch =
    text.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/) ||
    text.match(/\b(20\d{2}[-\.\/]\d{2}[-\.\/]\d{2})\b/);

    const formattedDate = rawDateMatch ? formatDate(rawDateMatch[1]) : null;

  
    return {
      store,
      total,
      date: formattedDate,
    };
  };

  // 🧠 Date formatter: returns MM/dd/yyyy string or null
const formatDate = (raw: string): string | null => {
    const cleaned = raw.replace(/[.\-]/g, '/'); // normalize separators
    const parts = cleaned.split('/');
  
    if (parts.length !== 3) return null;
  
    let month: number, day: number, year: number;
  
    if (parts[0].length === 4) {
      // Format: yyyy/MM/dd
      year = parseInt(parts[0]);
      month = parseInt(parts[1]);
      day = parseInt(parts[2]);
    } else {
      // Format: MM/dd/yyyy or dd/MM/yyyy (we assume MM/dd/yyyy for consistency)
      month = parseInt(parts[0]);
      day = parseInt(parts[1]);
      year = parseInt(parts[2].length === 2 ? '20' + parts[2] : parts[2]);
    }
  
    if (!month || !day || !year) return null;
  
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(month)}/${pad(day)}/${year}`;
  };
  