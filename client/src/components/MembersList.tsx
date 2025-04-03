import React, { useState, useEffect } from 'react'
import { useMemberStore } from '@/stores/memberStore'
import { useToast } from '@/hooks/use-toast'
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog'

interface MembersListProps {
  openAddMemberModal: () => void;
  openSelectFromDBModal: () => void;
}

// Define Member interface to match expected server data
interface Member {
  id: number;
  name: string;
  phone: string;
  qrCode?: string;
}

export default function MembersList({ 
  openAddMemberModal, 
  openSelectFromDBModal 
}: MembersListProps) {
  const { members, fetchMembers, removeMember } = useMemberStore()
  const [loading, setLoading] = useState(true)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null)
  const [selectedMemberName, setSelectedMemberName] = useState<string>("")
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchMembers()
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [fetchMembers])
  
  const hasMembers = members && members.length > 0
  const { toast } = useToast()
  
  const handleRemoveMember = async (id: number) => {
    if (confirm('Bạn có chắc muốn xóa thành viên này?')) {
      try {
        const result = await removeMember(id)
        
        if (result === true) {
          // Hiển thị thông báo thành công
          toast({
            title: "Đã xóa thành viên",
            description: "Thành viên đã được xóa khỏi danh sách",
            variant: "default",
            duration: 3000
          })
        } else {
          // Hiển thị thông báo lỗi khi không thể xóa do ràng buộc
          toast({
            title: "Không thể xóa thành viên",
            description: "Thành viên này đang tham gia hoạt động hoặc giao dịch. Hãy xóa các hoạt động và giao dịch liên quan trước.",
            variant: "destructive",
            duration: 5000
          })
        }
      } catch (error: any) {
        // Hiển thị thông báo lỗi
        const errorDetail = error.response?.data?.detail || "Không thể xóa thành viên. Vui lòng thử lại."
        
        toast({
          title: "Lỗi xóa thành viên",
          description: errorDetail,
          variant: "destructive",
          duration: 5000
        })
      }
    }
  }
  
  const handleViewQrCode = (qrCode: string, memberName: string) => {
    setSelectedQrCode(qrCode)
    setSelectedMemberName(memberName)
    setQrModalOpen(true)
    
    // Thông báo cho người dùng biết QR code đã được mở
    toast({
      title: "Đã mở mã QR",
      description: `Đang hiển thị mã QR của thành viên ${memberName}`,
      variant: "default",
      duration: 2000
    })
  }
  
  return (
    <div className="w-full mb-6 lg:mb-0">
      {/* QR code dialog */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">Mã QR của {selectedMemberName}</DialogTitle>
            <DialogDescription>
              Quét mã QR này để thêm thông tin liên hệ của thành viên
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Danh sách thành viên</h3>
        <div className="flex space-x-2">
          <button 
            onClick={openAddMemberModal}
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Thêm thành viên
          </button>
          
          <button 
            onClick={openSelectFromDBModal}
            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Chọn từ cơ sở dữ liệu
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center bg-white">
            <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {hasMembers ? (
              <div className="overflow-x-auto bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STT</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên thành viên</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Số điện thoại</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">QR</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member: Member, index: number) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.qrCode && (
                            <button 
                              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                              onClick={() => handleViewQrCode(member.qrCode!, member.name)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <rect x="7" y="7" width="3" height="3"></rect>
                                <rect x="14" y="7" width="3" height="3"></rect>
                                <rect x="7" y="14" width="3" height="3"></rect>
                                <rect x="14" y="14" width="3" height="3"></rect>
                              </svg>
                              Xem QR
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button 
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có thành viên</h3>
                <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm thành viên mới hoặc chọn từ cơ sở dữ liệu.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
