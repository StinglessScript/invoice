import React, { useState, useEffect } from 'react'
import { useMemberStore } from '@/stores/memberStore'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

interface SelectFromDBModalProps {
  show: boolean;
  onClose: () => void;
}

export default function SelectFromDBModal({ show, onClose }: SelectFromDBModalProps) {
  const { members, searchMembers, addMember } = useMemberStore()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedMembers, setSelectedMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  
  // Effect to search when query changes
  useEffect(() => {
    const searchWithDelay = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setLoading(true)
        try {
          const results = await searchMembers(searchQuery)
          setSearchResults(results)
        } finally {
          setLoading(false)
        }
      } else {
        setSearchResults([])
      }
    }, 300) // Debounce for 300ms
    
    return () => clearTimeout(searchWithDelay)
  }, [searchQuery, searchMembers])
  
  const selectMember = (member: any) => {
    if (!selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member])
    }
  }
  
  const removeMember = (id: number) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== id))
  }
  
  const addSelectedMembers = async () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "Chưa có thành viên nào được chọn",
        description: "Vui lòng chọn ít nhất một thành viên để tiếp tục",
        variant: "destructive",
        duration: 3000
      })
      return
    }
    
    setIsAdding(true)
    
    try {
      let addedCount = 0
      let skipCount = 0
      
      for (const member of selectedMembers) {
        // Check if the member is already in the group
        if (!members.some(m => m.id === member.id && 
                            m.name === member.name)) {
          // Đảm bảo chỉ gửi dữ liệu phù hợp với schema
          await addMember({
            name: member.name,
            phone: "", // Truyền chuỗi rỗng
            qrCode: member.qrCode || null
          })
          addedCount++
        } else {
          skipCount++
        }
      }
      
      // Thông báo thành công
      toast({
        title: "Đã thêm thành viên",
        description: `Đã thêm ${addedCount} thành viên mới${skipCount > 0 ? `, bỏ qua ${skipCount} thành viên đã tồn tại` : ''}`,
        variant: "default",
        duration: 3000
      })
      
      onClose()
      setSelectedMembers([])
      setSearchQuery('')
      setSearchResults([])
    } catch (error) {
      console.error('Error adding member:', error)
      toast({
        title: "Lỗi thêm thành viên",
        description: "Có lỗi xảy ra khi thêm thành viên. Vui lòng thử lại sau.",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setIsAdding(false)
    }
  }
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Chọn thành viên từ cơ sở dữ liệu</DialogTitle>
          <DialogDescription>
            Tìm kiếm thành viên theo tên và thêm vào nhóm của bạn
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2 space-y-4">
          <div className="relative">
            <div className="relative rounded-md shadow-sm">
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="Nhập tên thành viên"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto bg-gray-50">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-3 text-sm text-gray-600 font-medium">Đang tìm kiếm thành viên...</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <li key={result.id} className="p-3 hover:bg-gray-100 transition-colors duration-150 cursor-pointer flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{result.name}</p>
                        {result.active === false && (
                          <p className="text-xs text-amber-600">Thành viên đã bị ẩn trước đó</p>
                        )}
                      </div>
                      <button 
                        className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
                        onClick={() => selectMember(result)}
                        disabled={selectedMembers.some(m => m.id === result.id)}
                      >
                        {selectedMembers.some(m => m.id === result.id) ? 'Đã chọn' : 'Chọn'}
                      </button>
                    </li>
                  ))
                ) : (
                  searchQuery ? (
                    <li className="p-6 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">Không tìm thấy kết quả phù hợp</p>
                    </li>
                  ) : (
                    <li className="p-6 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">Nhập từ khóa để tìm kiếm thành viên</p>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Thành viên đã chọn</h4>
            <div className="flex flex-wrap gap-2">
              {selectedMembers.length > 0 ? (
                selectedMembers.map(member => (
                  <span key={member.id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                    {member.name}
                    <button type="button" 
                      className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-500 hover:bg-blue-200 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => removeMember(member.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500 italic">Chưa có thành viên nào được chọn</span>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <button 
            type="button" 
            className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            Hủy
          </button>
          <button 
            type="button" 
            className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary/90 transition-colors flex items-center"
            onClick={addSelectedMembers}
            disabled={isAdding || selectedMembers.length === 0}
          >
            {isAdding ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang thêm...
              </>
            ) : (
              <>Thêm vào nhóm</>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
