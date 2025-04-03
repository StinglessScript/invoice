import React, { useState } from 'react'
import { useMemberStore } from '@/stores/memberStore'
import { useToast } from '@/hooks/use-toast'

interface AddMemberModalProps {
  show: boolean;
  onClose: () => void;
}

export default function AddMemberModal({ show, onClose }: AddMemberModalProps) {
  const { addMember } = useMemberStore()
  const [memberName, setMemberName] = useState('')
  const [memberQR, setMemberQR] = useState<string | null>(null)
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null)
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    if (input.files && input.files[0]) {
      const file = input.files[0]
      const reader = new FileReader()
      
      reader.onload = (e) => {
        if (e.target) {
          setQrPreviewUrl(e.target.result as string)
          setMemberQR(e.target.result as string)
        }
      }
      
      reader.readAsDataURL(file)
    }
  }
  
  const resetForm = () => {
    setMemberName('')
    setMemberQR(null)
    setQrPreviewUrl(null)
  }
  
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!memberName.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền tên thành viên.",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    // Kiểm tra kích thước của QR code, thu nhỏ nếu cần
    let optimizedQrCode = memberQR
    if (memberQR && memberQR.length > 500000) { // 500KB
      try {
        // Tạo một canvas để nén ảnh
        const img = new Image()
        img.src = memberQR
        await new Promise((resolve) => { img.onload = resolve })
        
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Đặt kích thước canvas là 300x300px
        canvas.width = 300
        canvas.height = 300
        
        // Vẽ ảnh lên canvas (làm nó thu nhỏ)
        ctx?.drawImage(img, 0, 0, 300, 300)
        
        // Chuyển canvas thành base64 với chất lượng ảnh giảm
        optimizedQrCode = canvas.toDataURL('image/jpeg', 0.7)
        
        console.log('QR code đã được tối ưu hóa:', {
          originalSize: memberQR.length,
          optimizedSize: optimizedQrCode.length
        })
      } catch (err) {
        console.warn('Không thể tối ưu hóa QR code:', err)
        // Nếu tối ưu thất bại, vẫn tiếp tục với ảnh gốc
      }
    }
    
    try {
      // Chỉ gửi tên và qrCode, không cần phone
      const newMember = await addMember({
        name: memberName,
        phone: "", // Gửi chuỗi rỗng cho trường phone
        qrCode: optimizedQrCode || undefined
      })
      
      toast({
        title: "Thành công",
        description: `Đã thêm thành viên "${newMember.name}" vào danh sách`,
        variant: "default"
      })
      
      resetForm()
      onClose()
    } catch (error: any) {
      console.error('Failed to add member:', error)
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = 'Có lỗi xảy ra khi thêm thành viên.'
      
      if (error.message && error.message.includes('Yêu cầu quá thời gian')) {
        errorMessage = 'Ảnh QR code có thể quá lớn. Vui lòng chọn ảnh nhỏ hơn hoặc bỏ qua phần này.'
      } else if (error.message && error.message.includes('request entity too large')) {
        errorMessage = 'Ảnh QR code quá lớn. Vui lòng chọn ảnh nhỏ hơn hoặc bỏ qua phần này.'
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage + ' Vui lòng thử lại sau.',
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const clearQrImage = () => {
    setQrPreviewUrl(null)
    setMemberQR(null)
  }
  
  return (
    <div id="add-member-modal" className={`fixed inset-0 overflow-y-auto ${show ? '' : 'hidden'}`} role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Thêm thành viên
                </h3>
                <div className="mt-4">
                  <form id="add-member-form">
                    <div className="mb-4">
                      <label htmlFor="member-name" className="block text-sm font-medium text-gray-700 mb-1">Tên thành viên</label>
                      <input 
                        type="text" 
                        id="member-name" 
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                        placeholder="Nhập tên thành viên"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mã QR (tùy chọn)</label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {!qrPreviewUrl ? (
                            <>
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <label htmlFor="qr-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                  <span>Tải lên ảnh mã QR</span>
                                  <input 
                                    id="qr-upload" 
                                    name="qr-upload" 
                                    type="file" 
                                    className="sr-only" 
                                    accept="image/jpeg,image/png"
                                    onChange={handleFileChange}
                                  />
                                </label>
                                <p className="pl-1">hoặc kéo thả</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                Hỗ trợ định dạng: JPG, PNG
                              </p>
                            </>
                          ) : (
                            <div className="mt-3">
                              <img src={qrPreviewUrl} alt="QR Preview" className="mx-auto h-24 w-24 object-cover" />
                              <button 
                                type="button" 
                                className="mt-2 text-sm text-red-600 hover:text-red-900"
                                onClick={clearQrImage}
                              >
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                "Thêm thành viên"
              )}
            </button>
            <button 
              type="button" 
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
