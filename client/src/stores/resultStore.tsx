import { create } from 'zustand'
import { apiRequest } from '@/lib/queryClient'

type MemberBalance = {
  memberId: number;
  name: string;
  phone: string;
  paid: number;
  shouldPay: number;
  balance: number;
}

type Transaction = {
  id: number;
  fromMemberId: number;
  toMemberId: number;
  amount: number;
  completed: boolean;
  createdAt?: string;
  fromMember?: any;
  toMember?: any;
}

type ResultStore = {
  results: MemberBalance[] | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchResults: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  saveTransaction: (transaction: { fromMember: any; toMember: any; amount: number }) => Promise<Transaction>;
  updateTransactionStatus: (id: number, completed: boolean) => Promise<Transaction>;
  markAllTransactionsCompleted: () => Promise<boolean>;
  reset: () => void;
}

const store = create<ResultStore>((set, get) => ({
  results: null,
  transactions: [],
  isLoading: false,
  error: null,
  
  fetchResults: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const res = await fetch('/api/results', {
        credentials: 'include'
      })
      
      if (!res.ok) {
        throw new Error(`Failed to fetch results: ${res.status}`)
      }
      
      const data = await res.json()
      set({ results: data })
    } catch (err: any) {
      console.error('Error fetching results:', err)
      set({ error: err.message || 'Failed to fetch results' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  fetchTransactions: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const res = await fetch('/api/transactions', {
        credentials: 'include'
      })
      
      if (!res.ok) {
        throw new Error(`Failed to fetch transactions: ${res.status}`)
      }
      
      const data = await res.json()
      set({ transactions: data })
    } catch (err: any) {
      console.error('Error fetching transactions:', err)
      set({ error: err.message || 'Failed to fetch transactions' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  saveTransaction: async (transaction) => {
    set({ isLoading: true, error: null })
    
    try {
      // Create new transaction
      const data = {
        fromMemberId: transaction.fromMember.id,
        toMemberId: transaction.toMember.id,
        amount: transaction.amount,
        completed: true
      }
      
      const res = await apiRequest('POST', '/api/transactions', data)
      
      if (!res.ok) {
        throw new Error(`Failed to save transaction: ${res.status}`)
      }
      
      // Refresh transactions
      await get().fetchTransactions()
      
      return await res.json()
    } catch (err: any) {
      console.error('Error saving transaction:', err)
      set({ error: err.message || 'Failed to save transaction' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  updateTransactionStatus: async (id: number, completed: boolean) => {
    set({ isLoading: true, error: null })
    
    try {
      const res = await apiRequest('PATCH', `/api/transactions/${id}`, { completed })
      
      if (!res.ok) {
        throw new Error(`Failed to update transaction: ${res.status}`)
      }
      
      // Update in local state
      const updatedTransaction = await res.json()
      const { transactions } = get()
      set({ 
        transactions: transactions.map(t => 
          t.id === id ? updatedTransaction : t
        ) 
      })
      
      return updatedTransaction
    } catch (err: any) {
      console.error('Error updating transaction:', err)
      set({ error: err.message || 'Failed to update transaction' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  markAllTransactionsCompleted: async () => {
    set({ isLoading: true, error: null })
    
    try {
      // Lấy về giao dịch từ API một lần nữa để đảm bảo dữ liệu mới nhất
      await get().fetchTransactions()
      const { transactions } = get()
      
      if (!transactions || transactions.length === 0) {
        return true
      }
      
      // Đánh dấu tất cả giao dịch là đã hoàn thành
      let success = true
      
      // Cập nhật trạng thái của tất cả giao dịch chưa hoàn thành
      for (const transaction of transactions) {
        if (!transaction.completed) {
          try {
            await get().updateTransactionStatus(transaction.id, true)
          } catch (err) {
            console.error(`Error completing transaction ${transaction.id}:`, err)
            success = false
          }
        }
      }
      
      // Tải lại dữ liệu để đồng bộ với server
      await get().fetchTransactions()
      
      return success
    } catch (err: any) {
      console.error('Error marking all transactions as completed:', err)
      set({ error: err.message || 'Failed to complete all transactions' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
  
  reset: () => {
    set({
      results: null,
      transactions: [],
      error: null
    })
  }
}))

// Use this hook to access the store
export const useResultStore = () => ({
  results: store((state) => state.results),
  transactions: store((state) => state.transactions),
  isLoading: store((state) => state.isLoading),
  error: store((state) => state.error),
  fetchResults: store((state) => state.fetchResults),
  fetchTransactions: store((state) => state.fetchTransactions),
  saveTransaction: store((state) => state.saveTransaction),
  updateTransactionStatus: store((state) => state.updateTransactionStatus),
  markAllTransactionsCompleted: store((state) => state.markAllTransactionsCompleted),
  reset: store((state) => state.reset)
})
