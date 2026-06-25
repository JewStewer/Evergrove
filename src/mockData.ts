import { Transaction, Bill, Account, PayCycle } from './types';

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc-1', name: 'Up Bank Checking', type: 'checking', balance: 1558.03 },
  { id: 'acc-2', name: 'Emergency Fund', type: 'savings', balance: 955.00 },
  { id: 'acc-3', name: 'Credit Card Debt', type: 'credit', balance: -43348.88 }
];

export const INITIAL_BILLS: Bill[] = [
  {
    id: 'bill-1',
    name: 'Disney+',
    amount: 17.99,
    category: 'Subscriptions',
    frequency: 'monthly',
    dueDate: '2026-06-28',
    isPaid: false,
    isCovered: true,
    isAuto: true,
    isReady: true
  },
  {
    id: 'bill-2',
    name: 'Swoosh',
    amount: 66.53,
    category: 'Bills',
    frequency: 'weekly',
    dueDate: '2026-06-30',
    isPaid: false,
    isCovered: true,
    isAuto: true,
    isReady: true
  },
  {
    id: 'bill-3',
    name: 'ACCM',
    amount: 78.00,
    category: 'Bills',
    frequency: 'weekly',
    dueDate: '2026-06-30',
    isPaid: false,
    isCovered: true,
    isAuto: false,
    isReady: true
  },
  {
    id: 'bill-4',
    name: 'SPER',
    amount: 36.05,
    category: 'Bills',
    frequency: 'weekly',
    dueDate: '2026-06-30',
    isPaid: false,
    isCovered: true,
    isAuto: false,
    isReady: true
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'txn-1', merchant: 'Weekly Paycheck', amount: 3060.12, category: 'Income', date: '2026-06-23', type: 'income' },
  { id: 'txn-2', merchant: 'Woolworths Supermarket', amount: -112.50, category: 'Groceries', date: '2026-06-24', type: 'spend' },
  { id: 'txn-3', merchant: 'Gas Station Fuel', amount: -65.20, category: 'Transport', date: '2026-06-24', type: 'spend' },
  { id: 'txn-4', merchant: 'Coffee Shop', amount: -8.50, category: 'Food & Drinks', date: '2026-06-25', type: 'spend' },
  { id: 'txn-5', merchant: 'Uber Ride', amount: -26.80, category: 'Transport', date: '2026-06-25', type: 'spend' },
  { id: 'txn-6', merchant: 'Gym Membership', amount: -50.00, category: 'Health', date: '2026-06-25', type: 'spend' }
];

export const INITIAL_PAY_CYCLE: PayCycle = {
  startDate: '2026-06-23',
  endDate: '2026-06-29',
  paydayDate: '2026-06-30',
  incomeAmount: 3060.12
};
