export type Expense = {
    amount: number;
    category: string;
    date?: string;
    note?: string;
    [key: string]: any;
  };