export const FIXED_CATEGORIES = [
    "Food & Dining",
    "Housing & Utilities",
    "Transportation",
    "Health & Wellness",
    "Entertainment & Leisure",
    "Shopping & Retail",
    "Travel & Vacations",
    "Education & Learning",
    "Finance & Insurance",
    "Other",
  ] as const;
  
  export type ExpenseCategory = typeof FIXED_CATEGORIES[number];
  