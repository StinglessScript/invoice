<template>
  <div>
    <!-- Summary of total contributions -->
    <div class="mb-6">
      <h3 class="font-medium text-gray-700 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Tổng chi tiêu của mỗi người:
      </h3>
      
      <div class="grid gap-4 sm:grid-cols-2">
        <div 
          v-for="(memberSummary, index) in store.memberSummaries" 
          :key="index"
          class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-center mb-3">
            <div class="bg-blue-100 text-blue-800 p-2 rounded-full mr-3 h-10 w-10 flex items-center justify-center">
              <span class="font-bold">{{ memberSummary.name.charAt(0).toUpperCase() }}</span>
            </div>
            <span class="font-bold text-lg">{{ memberSummary.name }}</span>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between items-center py-1 border-b border-gray-100">
              <span class="text-gray-600">Đã trả:</span>
              <span class="font-medium text-blue-600">{{ formatCurrency(memberSummary.paid) }}</span>
            </div>
            
            <div class="flex justify-between items-center py-1 border-b border-gray-100">
              <span class="text-gray-600">Cần trả:</span>
              <span class="font-medium text-green-600">{{ formatCurrency(memberSummary.shouldPay) }}</span>
            </div>
            
            <div class="flex justify-between items-center py-1">
              <span class="text-gray-600">
                {{ memberSummary.balance > 0 ? 'Nhận lại:' : 'Cần trả thêm:' }}
              </span>
              <span class="font-medium px-2 py-1 rounded-lg" :class="memberSummary.balance > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                {{ formatCurrency(Math.abs(memberSummary.balance)) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Transactions list -->
    <div>
      <h3 class="font-medium text-gray-700 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Giao dịch cần thực hiện:
      </h3>
      
      <div v-if="store.transactions.length === 0" class="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-green-700 font-medium">Mọi người đã trả đúng số tiền, không cần chuyển khoản thêm!</p>
      </div>
      
      <div v-else class="space-y-3">
        <div 
          v-for="(transaction, index) in store.transactions" 
          :key="index"
          class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="bg-red-100 text-red-800 p-2 rounded-full mr-3 h-10 w-10 flex items-center justify-center">
                <span class="font-bold">{{ transaction.from.charAt(0).toUpperCase() }}</span>
              </div>
              
              <div class="font-medium text-gray-800">
                <span class="font-semibold">{{ transaction.from }}</span>
                <span class="mx-1 text-gray-400">→</span>
                <span class="font-semibold text-green-600">{{ transaction.to }}</span>
              </div>
            </div>
            
            <div class="font-bold text-gray-900 bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-lg">
              {{ formatCurrency(transaction.amount) }}
            </div>
          </div>
          
          <!-- Hiển thị QR code nếu có -->
          <div 
            v-if="getMemberQrCode(transaction.to)" 
            class="mt-3 pt-3 border-t border-gray-100 flex items-center"
          >
            <div class="flex-1">
              <div class="text-sm text-gray-500 mb-1">Quét mã để chuyển khoản:</div>
              <div class="font-medium text-gray-700">{{ transaction.to }}</div>
            </div>
            <div class="h-20 w-20 flex items-center justify-center">
              <img 
                :src="getMemberQrCode(transaction.to)" 
                alt="QR Code" 
                class="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
        
        <div class="mt-3 bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div class="flex">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-blue-800">
              <div class="font-semibold mb-1">Mẹo:</div>
              <p>Bạn có thể sử dụng các ứng dụng chuyển tiền như VNPay, MoMo hoặc chuyển khoản ngân hàng để thực hiện các giao dịch trên.</p>
              <p class="mt-1">Nếu bạn đã thêm mã QR, có thể quét mã để thanh toán nhanh chóng hơn.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBillSplitterStore } from '~/stores/billSplitter';
import { formatCurrency } from '~/utils/formatter';

const store = useBillSplitterStore();

// Lấy QR code của thành viên
const getMemberQrCode = (memberName) => {
  const memberDetails = store.getMemberDetails(memberName);
  if (memberDetails && memberDetails.qrCode) {
    // Nếu là URL hợp lệ thì trả về trực tiếp
    if (isValidUrl(memberDetails.qrCode)) {
      return memberDetails.qrCode;
    }
    
    // Nếu là dạng Base64 của ảnh thì trả về trực tiếp
    if (isBase64Image(memberDetails.qrCode)) {
      return memberDetails.qrCode;
    }
    
    // Nếu là chuỗi thì tạo QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(memberDetails.qrCode)}`;
  }
  return null;
};

// Kiểm tra URL hợp lệ
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
};

// Kiểm tra chuỗi base64 hợp lệ của ảnh
const isBase64Image = (str) => {
  // Kiểm tra xem chuỗi có bắt đầu bằng data:image/ không
  return str && typeof str === 'string' && str.startsWith('data:image/');
};
</script>
