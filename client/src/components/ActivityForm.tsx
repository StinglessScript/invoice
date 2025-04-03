import React, { useState, useMemo } from 'react'
import { useMemberStore } from '@/stores/memberStore'
import { useActivityStore } from '@/stores/activityStore'

// Define Member interface to match expected server data
interface Member {
  id: number;
  name: string;
  phone: string;
  qrCode?: string;
}

export default function ActivityForm() {
  const { members } = useMemberStore()
  const { addActivity } = useActivityStore()
  
  const [activityName, setActivityName] = useState('')
  const [activityAmount, setActivityAmount] = useState('')
  const [payerId, setPayerId] = useState('')
  const [participants, setParticipants] = useState<number[]>([])
  
  const resetForm = () => {
    setActivityName('')
    setActivityAmount('')
    setPayerId('')
    setParticipants([])
  }
  
  const isValid = useMemo(() => {
    return (
      activityName.trim() !== '' && 
      activityAmount !== '' && 
      payerId !== '' &&
      participants.length > 0 &&
      !isNaN(Number(activityAmount)) &&
      Number(activityAmount) > 0
    )
  }, [activityName, activityAmount, payerId, participants])
  
  const handleAddActivity = async () => {
    if (!isValid) {
      alert('Vui lòng điền đầy đủ thông tin hoạt động và chọn ít nhất một người tham gia.')
      return
    }
    
    try {
      await addActivity({
        name: activityName,
        amount: Number(activityAmount),
        payerId: Number(payerId),
        participants: participants
      })
      
      resetForm()
    } catch (error) {
      console.error('Failed to add activity:', error)
      alert('Có lỗi xảy ra khi thêm hoạt động. Vui lòng thử lại sau.')
    }
  }
  
  const toggleParticipant = (id: number) => {
    const index = participants.indexOf(id)
    if (index === -1) {
      setParticipants([...participants, id])
    } else {
      setParticipants(participants.filter(participantId => participantId !== id))
    }
  }
  
  const isParticipant = (id: number) => {
    return participants.includes(id)
  }
  
  return (
    <div className="lg:w-1/2">
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Thêm hoạt động</h3>
        <form>
          <div className="mb-4">
            <label htmlFor="activity-name" className="block text-sm font-medium text-gray-700 mb-1">Tên hoạt động</label>
            <input 
              type="text" 
              id="activity-name" 
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
              placeholder="Ví dụ: Cà phê, Nhậu, Karaoke..."
            />
          </div>

          <div className="mb-4">
            <label htmlFor="activity-amount" className="block text-sm font-medium text-gray-700 mb-1">Tổng số tiền</label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input 
                type="number" 
                id="activity-amount" 
                value={activityAmount}
                onChange={(e) => setActivityAmount(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 pr-12 border"
                placeholder="0"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 sm:text-sm">VNĐ</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="payer" className="block text-sm font-medium text-gray-700 mb-1">Người trả tiền</label>
            <div className="relative">
              <select 
                id="payer"
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border pr-8 appearance-none"
              >
                <option value="">Chọn người trả</option>
                {members && members.map((member: Member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <span className="block text-sm font-medium text-gray-700 mb-2">Người tham gia</span>
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
              {members && members.map((member: Member) => (
                <div className="flex items-center" key={member.id}>
                  <input
                    type="checkbox"
                    id={`participant-${member.id}`}
                    value={member.id}
                    checked={isParticipant(member.id)}
                    onChange={() => toggleParticipant(member.id)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor={`participant-${member.id}`} className="ml-2 block text-sm text-gray-900">
                    {member.name}
                  </label>
                </div>
              ))}
              
              {(!members || members.length === 0) && (
                <div className="text-center py-2 text-sm text-gray-500">
                  Chưa có thành viên nào. Vui lòng thêm thành viên trước.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddActivity}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary ${isValid ? 'hover:bg-primary/90' : 'opacity-50 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
              disabled={!isValid}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Thêm hoạt động
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
