import React, { useState, useEffect } from 'react'
import { useActivityStore } from '@/stores/activityStore'
import ActivityForm from './ActivityForm'
import { useMemberStore } from '@/stores/memberStore'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'

interface ActivitiesPanelProps {
  active: boolean;
}

// Extended Activity type including participants and payer info
interface ExtendedActivity {
  id: number;
  name: string;
  amount: number;
  payerId: number;
  createdAt?: string;
  payer?: {
    id: number;
    name: string;
    phone: string;
  };
  participants?: Array<{
    id: number;
    name: string;
    phone: string;
  }>;
}

export default function ActivitiesPanel({ active }: ActivitiesPanelProps) {
  const { activities, fetchActivities, removeActivity, removeAllActivities, updateActivity } = useActivityStore()
  const { members, fetchMembers } = useMemberStore()
  const [loading, setLoading] = useState(true)
  const [editingActivity, setEditingActivity] = useState<ExtendedActivity | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchActivities(), fetchMembers()])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [fetchActivities, fetchMembers])
  
  const handleEditActivity = (activity: ExtendedActivity) => {
    setEditingActivity(activity)
    setIsEditModalOpen(true)
  }
  
  const handleEditSubmit = async (formData: { 
    name: string; 
    amount: number; 
    payerId: number; 
    participants: number[] 
  }) => {
    if (!editingActivity) return
    
    try {
      await updateActivity(editingActivity.id, formData)
      setIsEditModalOpen(false)
      setEditingActivity(null)
    } catch (error) {
      console.error('Error updating activity:', error)
      alert('Đã xảy ra lỗi khi cập nhật hoạt động. Vui lòng thử lại.')
    }
  }
  
  const hasActivities = activities && activities.length > 0
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ'
  }
  
  const handleRemoveActivity = async (id: number) => {
    if (confirm('Bạn có chắc muốn xóa hoạt động này?')) {
      await removeActivity(id)
    }
  }
  
  const handleRemoveAllActivities = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả hoạt động? Hành động này không thể hoàn tác.')) {
      try {
        await removeAllActivities()
        // Reload sau khi xóa
        fetchActivities()
      } catch (error) {
        console.error('Lỗi khi xóa tất cả hoạt động:', error)
        alert('Đã xảy ra lỗi khi xóa các hoạt động. Vui lòng thử lại.')
      }
    }
  }
  
  return (
    <div className={`p-6 ${active ? '' : 'hidden'}`}>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Bước 2: Thêm các hoạt động chi tiêu</h3>
          <p className="text-gray-600 mt-1">Nhập thông tin về các hoạt động chi tiêu của nhóm</p>
        </div>
        
        {hasActivities && (
          <button
            onClick={handleRemoveAllActivities}
            className="px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm font-medium hover:bg-red-100 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Xóa tất cả hoạt động
          </button>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row lg:space-x-6 mb-8">
        <ActivityForm />
        
        <div className="mt-6 lg:mt-0 lg:w-7/12">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="text-blue-800 font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Hướng dẫn
            </h4>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Nhập tên hoạt động và số tiền chi</li>
                <li>Chọn người đã trả tiền cho hoạt động</li>
                <li>Chọn những người tham gia hoạt động này</li>
                <li>Có thể thêm nhiều hoạt động khác nhau</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-4">Danh sách hoạt động</h3>
      
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
            {hasActivities ? (
              <div className="overflow-x-auto bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STT</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên hoạt động</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tổng số tiền</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Người trả tiền</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Người tham gia</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.map((activity: ExtendedActivity, index: number) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{formatAmount(activity.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {activity.payer?.name || `Người ID: ${activity.payerId}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-wrap gap-1.5">
                            {activity.participants && activity.participants.map((participant) => (
                              <span key={participant.id} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                                {participant.name}
                              </span>
                            ))}
                            {(!activity.participants || activity.participants.length === 0) && (
                              <span className="text-gray-400 italic text-xs">Không có người tham gia</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button 
                              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                              onClick={() => handleEditActivity(activity)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                              Sửa
                            </button>
                            
                            <button 
                              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                              onClick={() => handleRemoveActivity(activity.id)}
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center bg-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có hoạt động nào trong nhóm này</h3>
                <p className="mt-1 text-sm text-gray-500">Vui lòng thêm hoạt động bằng form phía trên.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal chỉnh sửa hoạt động */}
      <Dialog 
        open={isEditModalOpen} 
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setEditingActivity(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hoạt động</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho hoạt động chi tiêu này
            </DialogDescription>
          </DialogHeader>

          {editingActivity && (
            <div className="py-4">
              <EditActivityForm 
                activity={editingActivity} 
                members={members} 
                onSubmit={handleEditSubmit}
                onCancel={() => setIsEditModalOpen(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Component form chỉnh sửa hoạt động
function EditActivityForm({ 
  activity, 
  members, 
  onSubmit, 
  onCancel 
}: { 
  activity: ExtendedActivity; 
  members: any[]; 
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(activity.name);
  const [amount, setAmount] = useState(activity.amount.toString());
  const [payerId, setPayerId] = useState(activity.payerId);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    activity.participants?.map(p => p.id) || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!name.trim()) {
      alert('Vui lòng nhập tên hoạt động');
      return;
    }
    
    const parsedAmount = parseInt(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    
    if (!payerId) {
      alert('Vui lòng chọn người trả tiền');
      return;
    }
    
    if (selectedParticipants.length === 0) {
      alert('Vui lòng chọn ít nhất một người tham gia');
      return;
    }
    
    // Submit data
    onSubmit({
      name,
      amount: parsedAmount,
      payerId,
      participants: selectedParticipants
    });
  };

  const toggleParticipant = (id: number) => {
    if (selectedParticipants.includes(id)) {
      setSelectedParticipants(selectedParticipants.filter(p => p !== id));
    } else {
      setSelectedParticipants([...selectedParticipants, id]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="activity-name" className="block text-sm font-medium text-gray-700 mb-1">
          Tên hoạt động
        </label>
        <input
          id="activity-name"
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Tiền ăn trưa"
          required
        />
      </div>
      
      <div>
        <label htmlFor="activity-amount" className="block text-sm font-medium text-gray-700 mb-1">
          Số tiền (VNĐ)
        </label>
        <input
          id="activity-amount"
          type="number"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Ví dụ: 100000"
          min="1"
          step="1000"
          required
        />
      </div>
      
      <div>
        <label htmlFor="activity-payer" className="block text-sm font-medium text-gray-700 mb-1">
          Người trả tiền
        </label>
        <select
          id="activity-payer"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={payerId}
          onChange={(e) => setPayerId(Number(e.target.value))}
          required
        >
          <option value="">-- Chọn người trả --</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>
              {member.name} ({member.phone})
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Người tham gia
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
          {members.length > 0 ? (
            members.map(member => (
              <div key={member.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`member-${member.id}`}
                  checked={selectedParticipants.includes(member.id)}
                  onChange={() => toggleParticipant(member.id)}
                  className="h-4 w-4 text-primary rounded border-gray-300"
                />
                <label htmlFor={`member-${member.id}`} className="ml-2 block text-sm text-gray-700">
                  {member.name} ({member.phone})
                </label>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm italic p-2">Không có thành viên nào</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
}
