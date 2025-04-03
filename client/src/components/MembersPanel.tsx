import React from 'react'
import MembersList from './MembersList'

interface MembersPanelProps {
  active: boolean;
  openAddMemberModal: () => void;
  openSelectFromDBModal: () => void;
}

export default function MembersPanel({ 
  active, 
  openAddMemberModal, 
  openSelectFromDBModal 
}: MembersPanelProps) {
  return (
    <div className={`p-6 ${active ? '' : 'hidden'}`}>
      <div className="flex flex-col">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800">Bước 1: Quản lý thành viên</h3>
          <p className="text-gray-600 mt-1">Thêm các thành viên tham gia chia tiền</p>
        </div>
        
        <MembersList 
          openAddMemberModal={openAddMemberModal}
          openSelectFromDBModal={openSelectFromDBModal}
        />
      </div>
    </div>
  )
}
