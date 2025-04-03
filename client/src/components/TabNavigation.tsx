import React from 'react'

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-primary/5 to-transparent px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Chia Tiền Nhóm</h2>
          <p className="text-sm text-gray-600">Quản lý chi tiêu và chia sẻ chi phí dễ dàng với bạn bè</p>
        </div>
        <nav className="flex divide-x divide-gray-100" aria-label="Tabs">
          <button 
            className={`flex-1 relative py-4 px-4 font-medium text-sm transition-all duration-200 flex flex-col items-center gap-2 ${
              activeTab === 'members'
                ? 'text-primary bg-primary/5' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('members')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeTab === 'members' ? 'text-primary' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Thành viên</span>
            {activeTab === 'members' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-12 bg-primary rounded-t-full"></div>
            )}
          </button>
          
          <button 
            className={`flex-1 relative py-4 px-4 font-medium text-sm transition-all duration-200 flex flex-col items-center gap-2 ${
              activeTab === 'activities'
                ? 'text-primary bg-primary/5' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('activities')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeTab === 'activities' ? 'text-primary' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v4"></path>
              <path d="M16 2v4"></path>
              <rect x="2" y="6" width="20" height="16" rx="2"></rect>
              <path d="M12 14v4"></path>
              <path d="M10 16h4"></path>
            </svg>
            <span>Hoạt động</span>
            {activeTab === 'activities' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-12 bg-primary rounded-t-full"></div>
            )}
          </button>
          
          <button 
            className={`flex-1 relative py-4 px-4 font-medium text-sm transition-all duration-200 flex flex-col items-center gap-2 ${
              activeTab === 'results'
                ? 'text-primary bg-primary/5' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('results')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeTab === 'results' ? 'text-primary' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>Kết quả</span>
            {activeTab === 'results' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-12 bg-primary rounded-t-full"></div>
            )}
          </button>
        </nav>
      </div>
    </div>
  )
}
