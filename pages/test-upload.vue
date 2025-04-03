<template>
  <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl sm:mx-auto">
      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <div class="max-w-md mx-auto">
          <div>
            <h1 class="text-2xl font-semibold mb-4">QR Code Upload Test</h1>
            
            <div class="mt-4">
              <label for="qr-file-upload" class="block text-sm font-medium text-gray-700">Upload QR Code Image</label>
              <input 
                type="file" 
                id="qr-file-upload" 
                accept="image/*" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                @change="onFileUpload"
              />
            </div>
            
            <div v-if="filePreview" class="mt-4">
              <p class="text-sm font-medium text-gray-700 mb-2">QR Code Preview:</p>
              <div class="bg-gray-50 p-4 rounded-md flex justify-center">
                <img 
                  :src="filePreview" 
                  alt="QR Code Preview" 
                  class="h-48 w-48 object-contain"
                />
              </div>
              <p class="mt-2 text-xs text-gray-500">Base64 string has been generated.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const filePreview = ref(null);

// Xử lý khi upload file
const onFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) {
    filePreview.value = null;
    return;
  }
  
  // Kiểm tra loại file
  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chọn file ảnh!');
    filePreview.value = null;
    return;
  }
  
  // Đọc file thành chuỗi Base64
  const reader = new FileReader();
  reader.onload = (e) => {
    filePreview.value = e.target.result;
    console.log('Base64 image loaded successfully');
  };
  reader.onerror = () => {
    alert('Có lỗi khi đọc file. Vui lòng thử lại!');
    filePreview.value = null;
  };
  reader.readAsDataURL(file);
};
</script>