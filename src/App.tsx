import React, { useState, useEffect } from 'react';
import PhoneContainer from './components/PhoneContainer';
import HomeTab from './components/HomeTab';
import TxnsTab from './components/TxnsTab';
import BillsTab from './components/BillsTab';
import BudgetTab from './components/BudgetTab';
import AccountsTab from './components/AccountsTab';
import MoreTab from './components/MoreTab';

// Modals
import AddTransactionModal from './components/AddTransactionModal';
import AddBillModal from './components/AddBillModal';
import SmartAssistantModal from './components/SmartAssistantModal';

// Mock values
import { INITIAL_ACCOUNTS, INITIAL_BILLS, INITIAL_TRANSACTIONS, INITIAL_PAY_CYCLE } from './mockData';
import { Account, Bill, Transaction, PayCycle } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Load from localStorage or defaults
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('evergrove_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('evergrove_bills');
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('evergrove_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [payCycle, setPayCycle] = useState<PayCycle>(INITIAL_PAY_CYCLE);
  const [noSpendMode, setNoSpendMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('evergrove_nospend');
    return saved ? JSON.parse(saved) : false;
  });

  // GitHub Application state integration
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('evergrove_github_token') || '');
  const [githubUsername, setGithubUsername] = useState(() => localStorage.getItem('evergrove_github_username') || '');
  const [githubRepo, setGithubRepo] = useState(() => localStorage.getItem('evergrove_github_repo') || '');
  const [githubRewardPerCommit, setGithubRewardPerCommit] = useState<number>(() => {
    const saved = localStorage.getItem('evergrove_github_reward');
    return saved ? parseFloat(saved) : 5.00;
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [isAddSpendOpen, setIsAddSpendOpen] = useState(false);
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isSmartAssistantOpen, setIsSmartAssistantOpen] = useState(false);

  // Sync state to localStorage on update
  useEffect(() => {
    localStorage.setItem('evergrove_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('evergrove_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('evergrove_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('evergrove_nospend', JSON.stringify(noSpendMode));
  }, [noSpendMode]);

  useEffect(() => {
    localStorage.setItem('evergrove_github_token', githubToken);
  }, [githubToken]);

  useEffect(() => {
    localStorage.setItem('evergrove_github_username', githubUsername);
  }, [githubUsername]);

  useEffect(() => {
    localStorage.setItem('evergrove_github_repo', githubRepo);
  }, [githubRepo]);

  useEffect(() => {
    localStorage.setItem('evergrove_github_reward', githubRewardPerCommit.toString());
  }, [githubRewardPerCommit]);

  // Sync simulator
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1500);
  };

  // Transaction Actions
  const handleAddTransaction = (newTxn: Omit<Transaction, 'id'>) => {
    const id = `txn-${Date.now()}`;
    const fullTxn: Transaction = { id, ...newTxn };
    setTransactions(prev => [fullTxn, ...prev]);

    // Update checking account balance dynamically
    setAccounts(prev => prev.map(acc => {
      if (acc.type === 'checking') {
        return { ...acc, balance: acc.balance + newTxn.amount };
      }
      return acc;
    }));
  };

  const handleDeleteTransaction = (id: string) => {
    const txn = transactions.find(t => t.id === id);
    if (!txn) return;
    
    setTransactions(prev => prev.filter(t => t.id !== id));
    // Revert transaction balance effect
    setAccounts(prev => prev.map(acc => {
      if (acc.type === 'checking') {
        return { ...acc, balance: acc.balance - txn.amount };
      }
      return acc;
    }));
  };

  // Bill Actions
  const handleAddBill = (newBill: Omit<Bill, 'id'>) => {
    const id = `bill-${Date.now()}`;
    const fullBill: Bill = { id, ...newBill };
    setBills(prev => [fullBill, ...prev]);
  };

  const handleToggleBillPaid = (id: string) => {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;

    setBills(prev => prev.map(b => b.id === id ? { ...b, isPaid: !b.isPaid } : b));

    // If marked paid, subtract amount from checking account, if unchecked, add it back
    const amountEffect = bill.isPaid ? bill.amount : -bill.amount;
    setAccounts(prev => prev.map(acc => {
      if (acc.type === 'checking') {
        return { ...acc, balance: acc.balance + amountEffect };
      }
      return acc;
    }));
  };

  const handleDeleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const handleMarkAllDuePaid = () => {
    const unpaidDueBills = bills.filter(b => !b.isPaid);
    if (unpaidDueBills.length === 0) return;

    const totalDues = unpaidDueBills.reduce((sum, b) => sum + b.amount, 0);
    setBills(prev => prev.map(b => ({ ...b, isPaid: true })));

    setAccounts(prev => prev.map(acc => {
      if (acc.type === 'checking') {
        return { ...acc, balance: acc.balance - totalDues };
      }
      return acc;
    }));
  };

  // Account Actions
  const handleUpdateAccountBalance = (id: string, newBalance: number) => {
    setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, balance: newBalance } : acc));
  };

  const handleAddAccount = (newAcc: Omit<Account, 'id'>) => {
    const id = `acc-${Date.now()}`;
    const fullAcc: Account = { id, ...newAcc };
    setAccounts(prev => [...prev, fullAcc]);
  };

  // Clear cache action
  const handleClearCache = () => {
    localStorage.removeItem('evergrove_accounts');
    localStorage.removeItem('evergrove_bills');
    localStorage.removeItem('evergrove_transactions');
    localStorage.removeItem('evergrove_nospend');
    setAccounts(INITIAL_ACCOUNTS);
    setBills(INITIAL_BILLS);
    setTransactions(INITIAL_TRANSACTIONS);
    setNoSpendMode(false);
  };

  return (
    <div className="min-h-screen bg-[#080a10] flex items-center justify-center py-6 px-4">
      <PhoneContainer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSyncing={isSyncing}
      >
        {activeTab === 'home' && (
          <HomeTab
            accounts={accounts}
            bills={bills}
            transactions={transactions}
            payCycle={payCycle}
            noSpendMode={noSpendMode}
            setNoSpendMode={setNoSpendMode}
            setActiveTab={setActiveTab}
            onAddSpendOpen={() => setIsAddSpendOpen(true)}
            onAddBillOpen={() => setIsAddBillOpen(true)}
            onSmartAssistantOpen={() => setIsSmartAssistantOpen(true)}
            onSync={handleSync}
            isSyncing={isSyncing}
            githubToken={githubToken}
            githubUsername={githubUsername}
            githubRewardPerCommit={githubRewardPerCommit}
          />
        )}

        {activeTab === 'txns' && (
          <TxnsTab
            transactions={transactions}
            onAddSpendOpen={() => setIsAddSpendOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'bills' && (
          <BillsTab
            bills={bills}
            onAddBillOpen={() => setIsAddBillOpen(true)}
            onToggleBillPaid={handleToggleBillPaid}
            onDeleteBill={handleDeleteBill}
            onMarkAllDuePaid={handleMarkAllDuePaid}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetTab
            accounts={accounts}
            bills={bills}
            onAddBill={handleAddBill}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsTab
            accounts={accounts}
            onUpdateAccountBalance={handleUpdateAccountBalance}
            onAddAccount={handleAddAccount}
          />
        )}

        {activeTab === 'more' && (
          <MoreTab
            noSpendMode={noSpendMode}
            setNoSpendMode={setNoSpendMode}
            onClearCache={handleClearCache}
            onSync={handleSync}
            isSyncing={isSyncing}
            githubToken={githubToken}
            setGithubToken={setGithubToken}
            githubUsername={githubUsername}
            setGithubUsername={setGithubUsername}
            githubRepo={githubRepo}
            setGithubRepo={setGithubRepo}
            githubRewardPerCommit={githubRewardPerCommit}
            setGithubRewardPerCommit={setGithubRewardPerCommit}
            accounts={accounts}
            bills={bills}
            transactions={transactions}
          />
        )}
      </PhoneContainer>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddSpendOpen}
        onClose={() => setIsAddSpendOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      <AddBillModal
        isOpen={isAddBillOpen}
        onClose={() => setIsAddBillOpen(false)}
        onAddBill={handleAddBill}
      />

      <SmartAssistantModal
        isOpen={isSmartAssistantOpen}
        onClose={() => setIsSmartAssistantOpen(false)}
        accounts={accounts}
        bills={bills}
        transactions={transactions}
      />
    </div>
  );
}
