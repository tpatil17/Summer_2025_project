export interface ParsedLineItem {
  name: string;
  price: number;
}

export interface ParsedReceipt {
  store: string;
  total: number | null;
  date: string | null;
  items: ParsedLineItem[];
}
  
export const parseReceiptText = (text: string): ParsedReceipt => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 🔍 Store name: first uppercase line near the top
  const possibleStore = lines.find(
    line =>
      /^[A-Z\s]{3,}$/.test(line) &&
      line.length > 3 &&
      !line.toLowerCase().includes('total')
  );
  const store = possibleStore || lines[0] || 'Unknown';

  // 💰 Total amount
  const amountMatch =
    text.match(/total\s*[:\-]?\s*\$?\s?(\d+[.,]?\d{0,2})/i) ||
    text.match(/amount\s*[:\-]?\s*\$?\s?(\d+[.,]?\d{0,2})/i) ||
    text.match(/\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s+TOTAL/i);

  const total = amountMatch
    ? parseFloat(amountMatch[1].replace(/,/g, ''))
    : null;

  // 📆 Date detection (multiple formats)
  const rawDateMatch =
    text.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/) ||
    text.match(/\b(20\d{2}[-\.\/]\d{2}[-\.\/]\d{2})\b/);

  const formattedDate = rawDateMatch ? formatDate(rawDateMatch[1]) : null;

  // 🧾 Item extraction
  const itemRegex = /^(.+?)\s+(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)$/;
  const itemLines: ParsedLineItem[] = [];

  for (const line of lines) {
    const match = line.match(itemRegex);
    if (match) {
      const name = match[1].trim();
      const priceStr = match[2].replace(/[^0-9.]/g, '');
      const price = parseFloat(priceStr);
      if (!isNaN(price)) {
        itemLines.push({ name, price });
      }
    }
  }

  return {
    store,
    total,
    date: formattedDate,
    items: itemLines,
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
  