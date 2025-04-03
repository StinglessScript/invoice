<template>
  <div>
    <form @submit.prevent="submitActivity" class="space-y-5">
      <div class="form-group">
        <label for="activity-name" class="form-label flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tên hoạt động
        </label>
        <div class="relative">
          <input 
            id="activity-name"
            v-model="activity.name" 
            type="text" 
            class="form-input pl-10"
            placeholder="Ví dụ: Cà phê, Nhậu, Karaoke..." 
            required
          />
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="activity-amount" class="form-label flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tổng số tiền
        </label>
        <div class="relative">
          <input 
            id="activity-amount"
            v-model="amount" 
            type="text"
            class="form-input pl-10 pr-16"
            placeholder="Nhập số tiền" 
            required
            @input="formatAmountOnInput"
            @blur="formatAmount"
          />
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 bg-gray-100 px-3 rounded-r-lg border-l">
            VND
          </span>
        </div>
        <div class="mt-2 grid grid-cols-3 gap-2">
          <button 
            type="button" 
            v-for="preset in presetAmounts" 
            :key="preset"
            @click="selectPresetAmount(preset)"
            class="px-2 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
          >
            {{ formatCurrency(preset) }}
          </button>
        </div>
      </div>
      
      <div class="form-group">
        <label for="activity-payer" class="form-label flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Người trả tiền
        </label>
        <div class="relative">
          <select 
            id="activity-payer"
            v-model="activity.payer" 
            class="form-input pl-10 appearance-none"
            required
          >
            <option value="" disabled>Chọn người trả</option>
            <option 
              v-for="(member, index) in store.members" 
              :key="index" 
              :value="member"
            >
              {{ member }}
            </option>
          </select>
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Người tham gia
        </label>
        
        <div v-if="store.members.length === 0" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mt-2">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">Hãy thêm thành viên vào nhóm trước!</p>
            </div>
          </div>
        </div>
        
        <div v-else class="mt-3 bg-white border border-gray-200 rounded-lg p-2">
          <div class="grid grid-cols-2 gap-2">
            <div v-for="(member, index) in store.members" :key="index" class="flex items-center p-2 rounded hover:bg-gray-50">
              <input 
                :id="`participant-${index}`" 
                type="checkbox"
                v-model="activity.participants"
                :value="member"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label :for="`participant-${index}`" class="ml-2 block text-sm text-gray-900 select-none cursor-pointer">
                {{ member }}
              </label>
            </div>
          </div>
          
          <div v-if="activity.participants.length === 0 && touched" class="mt-2 text-sm text-red-500 bg-red-50 p-2 rounded">
            <div class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Vui lòng chọn ít nhất một người tham gia
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end">
        <button 
          type="submit" 
          class="btn-primary group relative"
          :disabled="!isFormValid || store.members.length === 0"
          :class="{'opacity-50 cursor-not-allowed': !isFormValid || store.members.length === 0}"
        >
          <span class="absolute left-0 inset-y-0 flex items-center pl-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-200 group-hover:text-blue-100 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </span>
          <span class="pl-8 pr-4">Thêm hoạt động</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useBillSplitterStore } from '~/stores/billSplitter';
import { formatCurrency, parseCurrency } from '~/utils/formatter';

const store = useBillSplitterStore();
const amount = ref('');
const touched = ref(false);

// Các mức tiền được đặt sẵn để dễ dàng lựa chọn
const presetAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

const activity = reactive({
  name: '',
  amount: 0,
  payer: '',
  participants: []
});

const isFormValid = computed(() => {
  return (
    activity.name.trim() !== '' &&
    amount.value !== '' &&
    activity.payer !== '' &&
    activity.participants.length > 0
  );
});

// Format số tiền khi người dùng blur khỏi input
const formatAmount = () => {
  if (amount.value) {
    const parsed = parseCurrency(amount.value);
    if (!isNaN(parsed)) {
      activity.amount = parsed;
      amount.value = formatCurrency(parsed);
    }
  }
};

// Format số tiền khi người dùng đang nhập
const formatAmountOnInput = (event) => {
  // Chỉ giữ lại các ký tự số
  let value = event.target.value.replace(/[^\d]/g, '');
  
  // Nếu có giá trị thì format
  if (value) {
    // Chuyển thành số
    const numericValue = parseInt(value, 10);
    
    // Gán giá trị
    activity.amount = numericValue;
    
    // Hiển thị dạng phân cách hàng nghìn khi đang nhập
    if (numericValue >= 1000) {
      // Format với dấu phân cách hàng nghìn
      amount.value = numericValue.toLocaleString('vi-VN');
    } else {
      // Giữ nguyên giá trị nếu nhỏ hơn 1000
      amount.value = value;
    }
  } else {
    // Nếu không có giá trị thì để trống
    amount.value = '';
    activity.amount = 0;
  }
};

// Chọn một mức tiền được đặt sẵn
const selectPresetAmount = (value) => {
  activity.amount = value;
  amount.value = formatCurrency(value);
};

const submitActivity = () => {
  touched.value = true;
  
  if (!isFormValid.value) return;
  
  // Ensure amount is parsed correctly
  activity.amount = parseCurrency(amount.value);
  
  store.addActivity({
    id: Date.now(),
    name: activity.name,
    amount: activity.amount,
    payer: activity.payer,
    participants: [...activity.participants]
  });
  
  // Reset form
  activity.name = '';
  amount.value = '';
  activity.amount = 0;
  activity.payer = '';
  activity.participants = [];
  touched.value = false;
};
</script>
