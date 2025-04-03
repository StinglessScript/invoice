<template>
  <div>
    <div class="flex items-center space-x-2 mb-5">
      <div class="flex-grow relative">
        <input 
          v-model="newMember" 
          @keyup.enter="addMember"
          type="text" 
          placeholder="Nhập tên thành viên" 
          class="form-input pl-10"
        />
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>
      <button 
        @click="addMember" 
        class="btn-primary flex items-center"
        :disabled="!newMember.trim()"
        :class="{'opacity-50 cursor-not-allowed': !newMember.trim()}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Thêm
      </button>
      <button 
        @click="openAddMemberModal" 
        class="btn-secondary flex items-center"
        title="Thêm thành viên chi tiết với mã QR"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        Chi tiết
      </button>
    </div>
    
    <div v-if="store.members.length === 0" class="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <p class="text-gray-500">Chưa có thành viên nào. Hãy thêm thành viên vào nhóm.</p>
    </div>
    
    <ul v-else class="divide-y divide-gray-200 bg-white rounded-lg border border-gray-200">
      <li 
        v-for="(member, index) in store.members" 
        :key="index"
        class="py-3 px-4 flex justify-between items-center transition-colors hover:bg-gray-50"
      >
        <div class="flex items-center">
          <div class="bg-blue-100 text-blue-800 p-2 rounded-full mr-3">
            <span class="font-bold">{{ member.charAt(0).toUpperCase() }}</span>
          </div>
          <span class="font-medium">{{ member }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <button 
            @click="openEditMemberModal(member)" 
            class="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded-full hover:bg-blue-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button 
            @click="removeMember(index)" 
            class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
            :disabled="store.isMemberUsedInActivity(member)"
            :class="{'opacity-50 cursor-not-allowed': store.isMemberUsedInActivity(member)}"
            :title="store.isMemberUsedInActivity(member) ? 'Không thể xóa, thành viên đang tham gia hoạt động' : 'Xóa thành viên'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </li>
    </ul>
    
    <!-- Modal thêm thành viên chi tiết -->
    <div v-if="showAddMemberModal" class="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeAddMemberModal"></div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {{ editMode ? 'Cập nhật thành viên' : 'Thêm thành viên' }}
                </h3>
                <div class="mt-4 space-y-4">
                  <div>
                    <label for="member-name" class="block text-sm font-medium text-gray-700">Tên thành viên</label>
                    <input 
                      type="text" 
                      id="member-name" 
                      v-model="memberForm.name" 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Nhập tên thành viên"
                    />
                  </div>
                  <div>
                    <label for="qr-code" class="block text-sm font-medium text-gray-700">Mã QR (Nhập URL, văn bản, hoặc upload ảnh)</label>
                    <div class="mt-1 flex items-center">
                      <input 
                        type="text" 
                        id="qr-code" 
                        v-model="memberForm.qrCode" 
                        class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Nhập mã QR, dán URL, hoặc dữ liệu base64"
                      />
                      <label for="qr-file-upload" class="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                        </svg>
                        Upload
                      </label>
                      <input 
                        type="file" 
                        id="qr-file-upload" 
                        accept="image/*" 
                        class="hidden" 
                        @change="onFileUpload"
                      />
                    </div>
                    <p class="mt-1 text-xs text-gray-500">Bạn có thể nhập URL, dán mã QR, hoặc upload ảnh QR code</p>
                  </div>
                  <div v-if="memberForm.qrCode" class="mt-4">
                    <p class="text-sm font-medium text-gray-700 mb-2">Xem trước mã QR:</p>
                    <div class="flex justify-center bg-gray-50 p-4 rounded-md">
                      <img 
                        :src="qrImageUrl" 
                        alt="Mã QR" 
                        class="h-32 w-32 object-contain border border-gray-200 rounded-md bg-white"
                        v-if="isValidQrCode(memberForm.qrCode)"
                      />
                      <div v-else class="h-32 w-32 flex items-center justify-center border border-gray-200 rounded-md bg-white text-xs text-gray-500 text-center p-2">
                        Định dạng không hợp lệ<br>Hãy nhập URL, chuỗi mã hoặc upload ảnh
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              :disabled="!memberForm.name.trim()"
              :class="{'opacity-50 cursor-not-allowed': !memberForm.name.trim()}"
              @click="saveMember"
            >
              {{ editMode ? 'Cập nhật' : 'Thêm mới' }}
            </button>
            <button 
              type="button" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              @click="closeAddMemberModal"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useBillSplitterStore } from '~/stores/billSplitter';

const store = useBillSplitterStore();
const newMember = ref('');
const showAddMemberModal = ref(false);
const editMode = ref(false);
const currentMemberId = ref(null);

const memberForm = reactive({
  name: '',
  qrCode: ''
});

// Tính URL mã QR dựa trên giá trị nhập vào
const qrImageUrl = computed(() => {
  if (!memberForm.qrCode) return '';
  
  // Kiểm tra xem đã là URL hợp lệ chưa
  if (isValidUrl(memberForm.qrCode)) {
    return memberForm.qrCode;
  }
  
  // Kiểm tra xem có phải dạng Base64 không
  if (isBase64Image(memberForm.qrCode)) {
    return memberForm.qrCode;
  }
  
  // Nếu không, tạo URL qua dịch vụ tạo mã QR
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(memberForm.qrCode)}`;
});

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

// Kiểm tra QR code hợp lệ (URL hoặc Base64)
const isValidQrCode = (str) => {
  return isValidUrl(str) || isBase64Image(str) || str.trim().length > 0;
};

// Xử lý khi upload file ảnh
const onFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Kiểm tra loại file
  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chọn file ảnh!');
    return;
  }
  
  // Đọc file thành chuỗi Base64
  const reader = new FileReader();
  reader.onload = (e) => {
    memberForm.qrCode = e.target.result;
  };
  reader.onerror = () => {
    alert('Có lỗi khi đọc file. Vui lòng thử lại!');
  };
  reader.readAsDataURL(file);
};

const addMember = () => {
  if (newMember.value.trim()) {
    store.addMember(newMember.value.trim());
    newMember.value = '';
  }
};

const removeMember = (index) => {
  store.removeMember(index);
};

// Mở modal thêm thành viên mới
const openAddMemberModal = () => {
  editMode.value = false;
  memberForm.name = '';
  memberForm.qrCode = '';
  currentMemberId.value = null;
  showAddMemberModal.value = true;
};

// Mở modal chỉnh sửa thành viên
const openEditMemberModal = (memberName) => {
  editMode.value = true;
  
  // Lấy thông tin chi tiết thành viên
  const memberDetails = store.getMemberDetails(memberName);
  
  if (memberDetails) {
    memberForm.name = memberDetails.name;
    memberForm.qrCode = memberDetails.qrCode || '';
    currentMemberId.value = memberDetails.id;
  } else {
    memberForm.name = memberName;
    memberForm.qrCode = '';
    currentMemberId.value = null;
  }
  
  showAddMemberModal.value = true;
};

// Đóng modal
const closeAddMemberModal = () => {
  showAddMemberModal.value = false;
};

// Lưu thông tin thành viên
const saveMember = () => {
  if (!memberForm.name.trim()) return;
  
  if (editMode.value && currentMemberId.value) {
    // Cập nhật thành viên
    store.updateMemberDetails(currentMemberId.value, {
      name: memberForm.name.trim(),
      qrCode: memberForm.qrCode
    });
  } else {
    // Thêm thành viên mới
    store.addMemberWithDetails({
      name: memberForm.name.trim(),
      qrCode: memberForm.qrCode
    });
  }
  
  // Đóng modal
  closeAddMemberModal();
};
</script>
