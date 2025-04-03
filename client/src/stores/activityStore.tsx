import { create } from 'zustand'
import { apiRequest } from '@/lib/queryClient'

type Activity = {
  id: number;
  name: string;
  amount: number;
  payerId: number;
  createdAt?: string;
}

type ActivityStore = {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  fetchActivities: () => Promise<void>;
  addActivity: (activity: { name: string; amount: number; payerId: number; participants: number[] }) => Promise<Activity>;
  updateActivity: (id: number, activity: { name: string; amount: number; payerId: number; participants: number[] }) => Promise<Activity>;
  removeActivity: (id: number) => Promise<boolean>;
  removeAllActivities: () => Promise<boolean>;
}

const store = create<ActivityStore>((set, get) => ({
  activities: [],
  isLoading: false,
  error: null,
  
  fetchActivities: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const res = await fetch('/api/activities', {
        credentials: 'include'
      })
      
      if (!res.ok) {
        throw new Error(`Failed to fetch activities: ${res.status}`)
      }
      
      const data = await res.json()
      set({ activities: data })
    } catch (err: any) {
      console.error('Error fetching activities:', err)
      set({ error: err.message || 'Failed to fetch activities' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  addActivity: async (activity) => {
    set({ isLoading: true, error: null })
    
    try {
      const res = await apiRequest('POST', '/api/activities', activity)
      const newActivity = await res.json()
      
      // Add to local state and refresh activities to get participants info
      await get().fetchActivities()
      
      return newActivity
    } catch (err: any) {
      console.error('Error adding activity:', err)
      set({ error: err.message || 'Failed to add activity' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  updateActivity: async (id, activity) => {
    set({ isLoading: true, error: null })
    
    try {
      const res = await apiRequest('PATCH', `/api/activities/${id}`, activity)
      const updatedActivity = await res.json()
      
      // Update local state and refresh activities to get participants info
      await get().fetchActivities()
      
      return updatedActivity
    } catch (err: any) {
      console.error('Error updating activity:', err)
      set({ error: err.message || 'Failed to update activity' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  removeActivity: async (id: number) => {
    set({ isLoading: true, error: null })
    
    try {
      const res = await apiRequest('DELETE', `/api/activities/${id}`, undefined)
      
      if (res.status === 204) {
        // Remove from local state
        const { activities } = get()
        set({ activities: activities.filter(a => a.id !== id) })
        return true
      } else {
        throw new Error(`Unexpected response: ${res.status}`)
      }
    } catch (err: any) {
      console.error('Error removing activity:', err)
      set({ error: err.message || 'Failed to remove activity' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  removeAllActivities: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const { activities } = get()
      let success = true
      
      // Xóa tuần tự từng hoạt động
      for (const activity of activities) {
        try {
          const res = await apiRequest('DELETE', `/api/activities/${activity.id}`, undefined)
          if (res.status !== 204) {
            success = false
          }
        } catch (err) {
          console.error(`Error removing activity ${activity.id}:`, err)
          success = false
        }
      }
      
      if (success) {
        // Xóa khỏi local state
        set({ activities: [] })
        return true
      } else {
        // Refresh lại danh sách để đồng bộ với server
        await get().fetchActivities()
        return false
      }
    } catch (err: any) {
      console.error('Error removing all activities:', err)
      set({ error: err.message || 'Failed to remove all activities' })
      return false
    } finally {
      set({ isLoading: false })
    }
  }
}))

// Use this hook to access the store
export const useActivityStore = () => ({
  activities: store((state) => state.activities),
  isLoading: store((state) => state.isLoading),
  error: store((state) => state.error),
  fetchActivities: store((state) => state.fetchActivities),
  addActivity: store((state) => state.addActivity),
  updateActivity: store((state) => state.updateActivity),
  removeActivity: store((state) => state.removeActivity),
  removeAllActivities: store((state) => state.removeAllActivities)
})
