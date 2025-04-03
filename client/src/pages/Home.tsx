import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TabNavigation from '@/components/TabNavigation'
import MembersPanel from '@/components/MembersPanel'
import ActivitiesPanel from '@/components/ActivitiesPanel'
import ResultsPanel from '@/components/ResultsPanel'
import AddMemberModal from '@/components/AddMemberModal'
import SelectFromDBModal from '@/components/SelectFromDBModal'
import { useMemberStore } from '@/stores/memberStore'
import { useActivityStore } from '@/stores/activityStore'
import { useToast } from '@/hooks/use-toast'

export default function Home() {
  const [activeTab, setActiveTab] = useState('members')
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showSelectFromDBModal, setShowSelectFromDBModal] = useState(false)
  const { members, fetchMembers } = useMemberStore()
  const { activities, fetchActivities } = useActivityStore()
  const { toast } = useToast()
  
  useEffect(() => {
    // Tự động tải dữ liệu khi component được tạo
    fetchMembers()
    fetchActivities()
  }, [fetchMembers, fetchActivities])

  const handleTabChange = (tab: string) => {
    // Kiểm tra điều kiện để chuyển tab
    if (tab === 'activities' && (!members || members.length === 0)) {
      toast({
        title: "Chưa có thành viên nào",
        description: "Vui lòng thêm ít nhất một thành viên trước khi thêm hoạt động",
        variant: "destructive",
        duration: 3000
      })
      return
    }
    
    if (tab === 'results' && (!activities || activities.length === 0)) {
      toast({
        title: "Chưa có hoạt động nào",
        description: "Vui lòng thêm ít nhất một hoạt động trước khi xem kết quả",
        variant: "destructive",
        duration: 3000
      })
      return
    }
    
    setActiveTab(tab)
  }
  
  const goToNextStep = () => {
    switch (activeTab) {
      case 'members':
        if (members && members.length > 0) {
          setActiveTab('activities')
        } else {
          toast({
            title: "Chưa thể chuyển bước tiếp theo",
            description: "Vui lòng thêm ít nhất một thành viên trước khi thêm hoạt động",
            variant: "destructive",
            duration: 3000
          })
        }
        break;
      case 'activities':
        if (activities && activities.length > 0) {
          setActiveTab('results')
        } else {
          toast({
            title: "Chưa thể chuyển bước tiếp theo",
            description: "Vui lòng thêm ít nhất một hoạt động trước khi xem kết quả",
            variant: "destructive",
            duration: 3000
          })
        }
        break;
      default:
        break;
    }
  }
  
  const goToPreviousStep = () => {
    switch (activeTab) {
      case 'activities':
        setActiveTab('members')
        break;
      case 'results':
        setActiveTab('activities')
        break;
      default:
        break;
    }
  }

  const openAddMemberModal = () => {
    setShowAddMemberModal(true)
  }

  const closeAddMemberModal = () => {
    setShowAddMemberModal(false)
  }

  const openSelectFromDBModal = () => {
    setShowSelectFromDBModal(true)
  }

  const closeSelectFromDBModal = () => {
    setShowSelectFromDBModal(false)
  }

  return (
    <>
      <Header />
      
      <main className="flex-grow container mx-auto py-6 px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Chia Tiền Nhóm</h2>
          <div className="text-sm text-gray-500 hidden sm:block">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'members' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>1</div>
              <div className={`w-16 h-0.5 ${activeTab === 'members' || activeTab === 'activities' || activeTab === 'results' ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'activities' ? 'bg-primary text-white' : activeTab === 'results' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>2</div>
              <div className={`w-16 h-0.5 ${activeTab === 'activities' || activeTab === 'results' ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'results' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>3</div>
            </div>
          </div>
        </div>

        <TabNavigation 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
        />

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <MembersPanel 
            active={activeTab === 'members'} 
            openAddMemberModal={openAddMemberModal}
            openSelectFromDBModal={openSelectFromDBModal}
          />
          
          <ActivitiesPanel 
            active={activeTab === 'activities'} 
          />
          
          <ResultsPanel 
            active={activeTab === 'results'} 
          />
          
          {/* Nút điều hướng step */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
            <button
              onClick={goToPreviousStep}
              className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'members' ? 'invisible' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              disabled={activeTab === 'members'}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Quay lại
              </div>
            </button>
            
            <div className="flex space-x-2">
              {activeTab === 'members' && (
                <button
                  onClick={openAddMemberModal}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  Thêm thành viên
                </button>
              )}
              
              <button
                onClick={goToNextStep}
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'results' ? 'invisible' : 'bg-primary text-white hover:bg-primary/90'}`}
                disabled={activeTab === 'results'}
              >
                <div className="flex items-center">
                  {activeTab === 'members' ? 'Thêm hoạt động' : 'Xem kết quả chia tiền'}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <AddMemberModal 
        show={showAddMemberModal} 
        onClose={closeAddMemberModal} 
      />
      
      <SelectFromDBModal 
        show={showSelectFromDBModal} 
        onClose={closeSelectFromDBModal} 
      />
    </>
  )
}
