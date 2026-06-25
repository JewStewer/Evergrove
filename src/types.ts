export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  date: string; // ISO string YYYY-MM-DD
  type: 'spend' | 'income' | 'saving' | 'debt';
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'weekly' | 'fortnightly' | 'monthly';
  dueDate: string; // YYYY-MM-DD
  isPaid: boolean;
  isCovered: boolean;
  isAuto: boolean;
  isReady: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
}

export interface PayCycle {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  paydayDate: string; // YYYY-MM-DD
  incomeAmount: number;
}
