import { create } from 'zustand'
import { apiRequest } from '@/lib/queryClient'

type Member = {
  id: number;
  name: string;
  phone: string;
  qrCode?: string;
}

type MemberStore = {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  searchMembers: (query: string) => Promise<Member[]>;
  addMember: (member: Omit<Member, 'id'>) => Promise<Member>;
  removeMember: (id: number) => Promise<boolean>;
}

const store = create<MemberStore>((set, get) => ({
  members: [],
  isLoading: false,
  error: null,
  
  fetchMembers: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const res = await fetch('/api/members', {
        credentials: 'include'
      })
      
      if (!res.ok) {
        throw new Error(`Failed to fetch members: ${res.status}`)
      }
      
      const data = await res.json()
      set({ members: data })
    } catch (err: any) {
      console.error('Error fetching members:', err)
      set({ error: err.message || 'Failed to fetch members' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  searchMembers: async (query: string) => {
    try {
      const res = await fetch(`/api/members/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include'
      })
      
      if (!res.ok) {
        throw new Error(`Search failed: ${res.status}`)
      }
      
      return await res.json()
    } catch (err: any) {
      console.error('Error searching members:', err)
      set({ error: err.message || 'Failed to search members' })
      throw err
    }
  },
  
  addMember: async (member) => {
    set({ isLoading: true, error: null })
    
    try {
      const res = await apiRequest('POST', '/api/members', member)
      const newMember = await res.json()
      
      // Add to local state if not already there
      const { members } = get()
      if (!members.some(m => m.id === newMember.id)) {
        set({ members: [...members, newMember] })
      }
      
      return newMember
    } catch (err: any) {
      console.error('Error adding member:', err)
      set({ error: err.message || 'Failed to add member' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  removeMember: async (id: number) => {
    set({ isLoading: true, error: null })
    
    try {
      // Gửi request xóa đến API
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      // Kiểm tra kết quả
      if (response.status === 204) {
        // Xóa thành công, cập nhật state
        const { members } = get()
        set({ members: members.filter(m => m.id !== id) })
        return true
      } else if (response.status === 409) {
        // Không thể xóa do ràng buộc khóa ngoại
        const errorData = await response.json()
        set({ error: errorData.detail || 'Không thể xóa thành viên do ràng buộc khóa ngoại' })
        return false
      } else {
        // Các lỗi khác
        const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định' }))
        set({ error: errorData.message || 'Không thể xóa thành viên' })
        return false
      }
    } catch (err: any) {
      console.error('Lỗi xóa thành viên:', err)
      set({ error: err.message || 'Không thể xóa thành viên' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  }
}))

// Use this hook to access the store
export const useMemberStore = () => ({
  members: store((state) => state.members),
  isLoading: store((state) => state.isLoading),
  error: store((state) => state.error),
  fetchMembers: store((state) => state.fetchMembers),
  searchMembers: store((state) => state.searchMembers),
  addMember: store((state) => state.addMember),
  removeMember: store((state) => state.removeMember)
})
