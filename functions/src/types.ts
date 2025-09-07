export interface EnrichedLineItem {
    name: string;
    price: number;
    quantity: number;
    category: string;
  }
  
  export interface EnrichedReceipt {
    store: string;
    date: string;
    total: number;
    items: EnrichedLineItem[];
  }
  