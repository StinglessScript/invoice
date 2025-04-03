import React, { useState, useEffect } from 'react'
import { useResultStore } from '@/stores/resultStore'
import { useActivityStore } from '@/stores/activityStore'

interface ResultsPanelProps {
  active: boolean;
}

// Define result data structures
interface ResultSummary {
  totalSpent: number;
  memberCount: number;
  activityCount: number;
  averagePerMember: number;
}

interface MemberBalance {
  memberId: number;
  name: string;
  phone: string;
  paid: number;
  shouldPay: number;
  balance: number;
}

interface ResultTransaction {
  id?: number;
  fromMember: {
    id: number;
    name: string;
    phone: string;
  };
  toMember: {
    id: number;
    name: string;
    phone: string;
  };
  amount: number;
  completed?: boolean;
  createdAt?: string;
}

interface ResultData {
  summary: ResultSummary;
  memberBalances: MemberBalance[];
  transactions: ResultTransaction[];
}

export default function ResultsPanel({ active }: ResultsPanelProps) {
  const { results, fetchResults, saveTransaction, markAllTransactionsCompleted, reset } = useResultStore()
  const { removeAllActivities } = useActivityStore()
  const [loading, setLoading] = useState(true)
  const [showCompletedMessage, setShowCompletedMessage] = useState(false)
  
  const fetchData = async () => {
    if (active) {
      setLoading(true)
      try {
        await fetchResults()
      } finally {
        setLoading(false)
      }
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [active, fetchResults])
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ'
  }
  
  // Cast results to ResultData to work with the expected structure
  const resultData = results as unknown as ResultData | null;
  
  const hasTransactions = resultData?.transactions && resultData.transactions.length > 0
  
  const markAsCompleted = async (transaction: ResultTransaction) => {
    await saveTransaction(transaction)
  }
  
  const handleFinishSession = async () => {
    if (confirm('Bạn có chắc chắn muốn kết thúc phiên chia tiền này? Tất cả giao dịch sẽ được đánh dấu hoàn thành và ứng dụng sẽ được làm mới.')) {
      setLoading(true)
      try {
        // Đánh dấu tất cả giao dịch là đã hoàn thành
        const result = await markAllTransactionsCompleted()
        
        if (result) {
          setShowCompletedMessage(true)
          
          // Xóa tất cả hoạt động sau 1 giây
          setTimeout(async () => {
            try {
              // Xóa tất cả hoạt động
              await removeAllActivities()
              
              // Đặt lại các store
              reset()
              
              // Chuyển về bước thứ nhất sau 2 giây để người dùng nhìn thấy thông báo
              setTimeout(() => {
                window.location.href = '/'
              }, 2000)
            } catch (error) {
              console.error('Error resetting app:', error)
            }
          }, 1000)
        } else {
          alert('Có lỗi xảy ra khi hoàn thành giao dịch. Vui lòng thử lại.')
          setLoading(false)
        }
      } catch (error) {
        console.error('Error completing transactions:', error)
        alert('Có lỗi xảy ra khi hoàn thành giao dịch. Vui lòng thử lại.')
        setLoading(false)
      }
    }
  }
  
  const exportToText = () => {
    if (!resultData) return
    
    let text = "THÔNG TIN CHIA TIỀN NHÓM\n"
    text += "===========================\n\n"
    text += `Tổng chi tiêu: ${formatAmount(resultData.summary.totalSpent)}\n`
    text += `Số thành viên: ${resultData.summary.memberCount}\n`
    text += `Số hoạt động: ${resultData.summary.activityCount}\n`
    text += `Trung bình mỗi người: ${formatAmount(resultData.summary.averagePerMember)}\n\n`
    
    text += "CHI TIẾT SỐ TIỀN:\n"
    text += "===========================\n"
    resultData.memberBalances.forEach(member => {
      text += `${member.name} (${member.phone}):\n`
      text += `  - Đã chi: ${formatAmount(member.paid)}\n`
      text += `  - Cần trả: ${formatAmount(member.shouldPay)}\n`
      text += `  - Số dư: ${member.balance > 0 ? '+' : ''}${formatAmount(member.balance)}\n\n`
    })
    
    text += "GIAO DỊCH CẦN THỰC HIỆN:\n"
    text += "===========================\n"
    if (hasTransactions) {
      resultData.transactions.forEach((transaction, index) => {
        text += `${index + 1}. ${transaction.fromMember.name} chuyển cho ${transaction.toMember.name}: ${formatAmount(transaction.amount)}\n`
      })
    } else {
      text += "Không có giao dịch cần thực hiện.\n"
    }
    
    // Tạo file và download
    const element = document.createElement("a")
    const file = new Blob([text], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = "chia-tien-nhom.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }
  
  const resetApp = async () => {
    if (confirm('Bạn có chắc chắn muốn làm mới ứng dụng? Tất cả các hoạt động sẽ bị xóa và bạn sẽ bắt đầu phiên chia tiền mới.')) {
      setLoading(true)
      try {
        // Xóa tất cả hoạt động
        const result = await removeAllActivities()
        
        if (result) {
          // Đặt lại các store
          reset()
          
          // Hiển thị thông báo thành công
          alert('Ứng dụng đã được làm mới. Bạn có thể bắt đầu phiên chia tiền mới.')
          
          // Chuyển về bước thứ nhất
          window.location.href = '/'
        } else {
          alert('Có lỗi xảy ra khi làm mới ứng dụng. Vui lòng thử lại.')
        }
      } catch (error) {
        console.error('Error resetting app:', error)
        alert('Có lỗi xảy ra khi làm mới ứng dụng. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }
  }
  
  return (
    <div className={`p-6 ${active ? '' : 'hidden'}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800">Bước 3: Kết quả chia tiền</h3>
        <p className="text-gray-600 mt-1">Tổng kết chi tiêu và danh sách các giao dịch cần thực hiện</p>
      </div>
      
      {loading ? (
        <div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
          <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-gray-600 font-medium">Đang tính toán kết quả...</p>
        </div>
      ) : (
        <>
          {resultData ? (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-sm font-medium">Tổng chi tiêu</p>
                    <div className="p-2 bg-blue-50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{formatAmount(resultData.summary.totalSpent)}</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-sm font-medium">Số thành viên</p>
                    <div className="p-2 bg-green-50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{resultData.summary.memberCount} người</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-sm font-medium">Số hoạt động</p>
                    <div className="p-2 bg-purple-50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{resultData.summary.activityCount} hoạt động</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-sm font-medium">Trung bình mỗi người</p>
                    <div className="p-2 bg-amber-50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{formatAmount(resultData.summary.averagePerMember)}</p>
                </div>
              </div>
              
              {/* Member balances */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h4 className="text-md font-semibold text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Chi tiết số tiền của từng thành viên
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành viên</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã chi</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cần trả</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số dư</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {resultData.memberBalances.map((member: MemberBalance) => (
                        <tr key={member.memberId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-lg font-medium text-gray-600">{member.name.charAt(0).toUpperCase()}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-500">{member.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatAmount(member.paid)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatAmount(member.shouldPay)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                                member.balance > 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : member.balance < 0 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {member.balance > 0 ? '+' : ''}{formatAmount(member.balance)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Transactions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h4 className="text-md font-semibold text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Các giao dịch cần thực hiện
                  </h4>
                </div>
                
                {hasTransactions ? (
                  <div className="divide-y divide-gray-200">
                    {resultData.transactions.map((transaction: ResultTransaction, index: number) => (
                      <div key={index} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50">
                        <div className="flex-1 mb-4 sm:mb-0">
                          <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                            <div className="flex items-center mb-2 sm:mb-0">
                              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 mr-2">
                                <span className="text-sm">{transaction.fromMember.name.charAt(0).toUpperCase()}</span>
                              </div>
                              <div className="font-medium text-gray-900">{transaction.fromMember.name}</div>
                            </div>
                            
                            <svg className="hidden sm:block mx-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            
                            <div className="sm:hidden my-1 border-t border-gray-200 w-full"></div>
                            
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 mr-2">
                                <span className="text-sm">{transaction.toMember.name.charAt(0).toUpperCase()}</span>
                              </div>
                              <div className="font-medium text-gray-900">{transaction.toMember.name}</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="mr-2 text-sm text-gray-500">Số tiền cần chuyển:</div>
                            <div className="text-sm font-medium text-primary">{formatAmount(transaction.amount)}</div>
                          </div>
                        </div>
                        <div>
                          <button
                            onClick={() => markAsCompleted(transaction)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Đánh dấu đã chuyển tiền
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Không có giao dịch nào cần thực hiện</h3>
                    <p className="mt-1 text-sm text-gray-500">Mọi người đều có số dư bằng 0 hoặc chưa có đủ dữ liệu.</p>
                  </div>
                )}
              </div>
              
              {/* Thêm nút Hoàn thành và Xuất báo cáo */}
              {resultData && resultData.summary.activityCount > 0 && (
                <>
                  {showCompletedMessage && (
                    <div className="mt-8 p-4 border border-green-300 bg-green-50 rounded-lg text-green-800 flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-medium">Đã hoàn thành phiên chia tiền!</h4>
                        <p className="text-sm mt-1">Tất cả thông tin đã được ghi nhận. Bạn có thể tiếp tục sử dụng ứng dụng hoặc bắt đầu phiên chia tiền mới.</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={handleFinishSession}
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Hoàn thành phiên chia tiền
                    </button>
                    
                    <button
                      onClick={exportToText}
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Xuất báo cáo
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="py-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có dữ liệu kết quả</h3>
              <p className="mt-1 text-sm text-gray-500">Hãy thêm thành viên và hoạt động trước.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
