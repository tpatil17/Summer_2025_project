// functions/src/types/firestore.ts

export interface Expense {
    userId: string;
    amount: number;
    category?: string;            // user-defined or enriched
    aiCategory?: string;          // predicted by GPT or ML model
    categoryConfidence?: number;  // confidence score from AI
    itemName?: string;
    merchant?: string;
    parsedBy?: string;
    quantity?: number;
    receiptId?: string;           // link to receipts collection
    createdAt?: FirebaseFirestore.Timestamp | string | Date;
    date?: string;
    source?: string;              // e.g. 'manual', 'receipt', 'ai'
    // Future ML fields
    risk?: {
      score?: number;
      flagged?: boolean;
      version?: string;
    };
  }
  
  export interface Receipt {
    receiptId?: string;           // usually Firestore doc.id
    userId?: string;
    total?: number;
    merchant?: string;
    numItems?: number;
    parsedBy?: string;            // OCR or AI module used
    source?: string;              // e.g. 'upload', 'camera', etc.
    receiptDate?: string;
    createdAt?: FirebaseFirestore.Timestamp | string | Date;
    updatedAt?: FirebaseFirestore.Timestamp | string | Date;
    timestamp?: FirebaseFirestore.Timestamp | string | Date;
    date?: string;                // human-readable date string
    store?: string;               // store name / location
    items?: Array<{
      name: string;
      price: number;
      quantity?: number;
      category?: string;
    }>;
  }
  
  export interface ExportRow {
    expenseId: string;
    amount: number;
    category: string;
    aiCategory: string;
    categoryConfidence: number | string;
    itemName: string;
    merchant: string;
    parsedBy: string;
    quantity: number | string;
    createdAt: string;
    date: string;
    receiptId: string;
    receiptTotal: number | string;
    numItems: number | string;
    store: string;
    source: string;
    riskScore?: number | string;
    riskFlagged?: boolean;
    riskVersion?: string;
  }
  