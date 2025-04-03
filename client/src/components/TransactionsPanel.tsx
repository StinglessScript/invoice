import React, { useState, useEffect } from 'react'
import { useResultStore } from '@/stores/resultStore'
import { useToast } from '@/hooks/use-toast'
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog'

interface TransactionsPanelProps {
  active: boolean;
}

// Define Transaction interface to match expected server data
interface Transaction {
  id: number;
  fromMemberId: number;
  toMemberId: number;
  amount: number;
  completed: boolean;
  createdAt?: string;
  fromMember?: {
    id: number;
    name: string;
    phone: string;
    qrCode?: string;
  };
  toMember?: {
    id: number;
    name: string;
    phone: string;
    qrCode?: string;
  };
}

export default function TransactionsPanel({ active }: TransactionsPanelProps) {
  const { transactions, fetchTransactions, updateTransactionStatus } = useResultStore()
  const [loading, setLoading] = useState(true)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null)
  const [selectedMemberName, setSelectedMemberName] = useState<string>("")
  const { toast } = useToast()
  
  const fetchData = async () => {
    if (active) {
      setLoading(true)
      try {
        await fetchTransactions()
      } finally {
        setLoading(false)
      }
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [active, fetchTransactions])
  
  const handleViewQrCode = (qrCode: string, memberName: string) => {
    setSelectedQrCode(qrCode)
    setSelectedMemberName(memberName)
    setQrModalOpen(true)
    
    toast({
      title: "Đã mở mã QR",
      description: `Đang hiển thị mã QR của ${memberName}`,
      variant: "default",
      duration: 2000
    })
  }
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ'
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  const hasTransactions = transactions && transactions.length > 0
  
  const getStatusText = (completed: boolean) => {
    return completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'
  }
  
  const getStatusClass = (completed: boolean) => {
    return completed 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800'
  }
  
  const toggleTransactionStatus = async (transaction: Transaction) => {
    await updateTransactionStatus(
      transaction.id, 
      !transaction.completed
    )
  }
  
  return (
    <div className={`p-6 ${active ? '' : 'hidden'}`}>
      {/* QR code dialog */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">Mã QR của {selectedMemberName}</DialogTitle>
            <DialogDescription>
              Quét mã QR này để chuyển tiền hoặc thêm thông tin liên hệ
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4 bg-white rounded-lg shadow-inner border border-gray-100">
            {selectedQrCode ? (
              <img 
                src={selectedQrCode} 
                alt={`QR của ${selectedMemberName}`} 
                className="max-w-[280px] max-h-[280px] object-contain rounded-md transition-all duration-300 hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center w-[280px] h-[280px] bg-gray-100 rounded-md">
                <p className="text-gray-500">Đang tải mã QR...</p>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setQrModalOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800">Bước 4: Theo dõi giao dịch</h3>
        <p className="text-gray-600 mt-1">Quản lý và theo dõi trạng thái các giao dịch chuyển tiền</p>
      </div>
      
      {loading ? (
        <div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
          <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-gray-600 font-medium">Đang tải dữ liệu giao dịch...</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h4 className="text-md font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Danh sách giao dịch đã lưu
            </h4>
          </div>
          
          {hasTransactions ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người trả tiền</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người nhận</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction: Transaction, index: number) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-sm text-red-700">{transaction.fromMember?.name.charAt(0).toUpperCase() || '?'}</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.fromMember?.name || `ID: ${transaction.fromMemberId}`}
                            </div>
                            {transaction.fromMember?.phone && (
                              <div className="text-xs text-gray-500">{transaction.fromMember.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm text-green-700">{transaction.toMember?.name.charAt(0).toUpperCase() || '?'}</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.toMember?.name || `ID: ${transaction.toMemberId}`}
                            </div>
                            {transaction.toMember?.phone && (
                              <div className="text-xs text-gray-500">{transaction.toMember.phone}</div>
                            )}
                          </div>
                          {transaction.toMember?.qrCode && (
                            <button 
                              className="inline-flex items-center ml-2 p-1.5 text-blue-500 hover:text-blue-700 transition-colors"
                              onClick={() => handleViewQrCode(transaction.toMember!.qrCode!, transaction.toMember!.name)}
                              title="Xem QR người nhận"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <rect x="7" y="7" width="3" height="3"></rect>
                                <rect x="14" y="7" width="3" height="3"></rect>
                                <rect x="7" y="14" width="3" height="3"></rect>
                                <rect x="14" y="14" width="3" height="3"></rect>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                        {formatAmount(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(transaction.completed)}`}>
                          {getStatusText(transaction.completed)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => toggleTransactionStatus(transaction)}
                          >
                            {transaction.completed ? (
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Chưa hoàn thành
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Đã hoàn thành
                              </span>
                            )}
                          </button>
                          
                          {transaction.fromMember?.qrCode && (
                            <button 
                              className="p-1.5 text-primary border border-primary/20 bg-primary/5 rounded-md hover:bg-primary/10 transition-colors"
                              onClick={() => handleViewQrCode(transaction.fromMember!.qrCode!, transaction.fromMember!.name)}
                              title="Xem QR người gửi tiền"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <rect x="7" y="7" width="3" height="3"></rect>
                                <rect x="14" y="7" width="3" height="3"></rect>
                                <rect x="7" y="14" width="3" height="3"></rect>
                                <rect x="14" y="14" width="3" height="3"></rect>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có giao dịch nào được lưu</h3>
              <p className="mt-1 text-sm text-gray-500">Hãy lưu giao dịch từ tab "Kết quả chia tiền" trước.</p>
              <div className="mt-5">
                <button
                  onClick={() => fetchData()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Làm mới dữ liệu
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
