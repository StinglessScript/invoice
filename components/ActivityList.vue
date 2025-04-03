<template>
  <div>
    <div v-if="!store.activities.length" class="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-500 mb-2">Chưa có hoạt động nào</p>
      <p class="text-sm text-gray-400">Hãy thêm hoạt động để bắt đầu tính toán</p>
    </div>
    
    <div v-else class="space-y-4">
      <div 
        v-for="activity in store.activities" 
        :key="activity.id"
        class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-start">
            <div class="flex-shrink-0 bg-blue-100 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-lg text-gray-800">{{ activity.name }}</h3>
              <p class="text-blue-600 font-medium">
                {{ formatCurrency(activity.amount) }}
              </p>
            </div>
          </div>
          <button 
            @click="removeActivity(activity.id)" 
            class="p-1.5 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-3 mt-3">
          <div class="flex items-center">
            <div class="flex items-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span class="text-sm font-medium text-gray-700">Người trả:</span>
            </div>
            <span class="text-sm font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              {{ activity.payer }}
            </span>
          </div>
          
          <div class="mt-3">
            <div class="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span class="text-sm font-medium text-gray-700">Người tham gia:</span>
            </div>
            <div class="flex flex-wrap gap-2 mt-1">
              <span 
                v-for="(participant, idx) in activity.participants" 
                :key="idx"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                <span class="font-bold mr-1">{{ participant.charAt(0).toUpperCase() }}</span>
                <span>{{ participant }}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div class="mt-3 text-sm flex justify-between items-center">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="text-gray-600">Mỗi người phải trả:</span>
          </div>
          <span class="bg-indigo-100 text-indigo-800 font-medium px-2 py-1 rounded-md">
            {{ formatCurrency(activity.amount / activity.participants.length) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBillSplitterStore } from '~/stores/billSplitter';
import { formatCurrency } from '~/utils/formatter';

const store = useBillSplitterStore();

const removeActivity = (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa hoạt động này?')) {
    store.removeActivity(id);
  }
};
</script>
