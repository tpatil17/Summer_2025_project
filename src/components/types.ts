export type Expense = {
    amount: number;
    category: string;
    date?: string;
    note?: string;
    [key: string]: any;
  };

  // functions/src/types.ts

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
