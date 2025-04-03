<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Ứng dụng chia tiền</h1>
    
    <div class="bg-white p-6 rounded-lg shadow mb-8">
      <h2 class="text-xl font-semibold mb-4">Thông tin cơ sở dữ liệu</h2>
      
      <div v-if="isLoading" class="text-center py-4">
        Đang tải thông tin...
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="border rounded-lg p-4 bg-blue-50">
          <h3 class="font-medium mb-2 text-blue-700">Thành viên</h3>
          <p class="text-3xl font-bold mb-1">{{ memberCount }}</p>
          <NuxtLink to="/admin" class="text-sm text-blue-600 hover:underline">
            Quản lý thành viên →
          </NuxtLink>
        </div>
        
        <div class="border rounded-lg p-4 bg-green-50">
          <h3 class="font-medium mb-2 text-green-700">Hoạt động</h3>
          <p class="text-3xl font-bold mb-1">{{ activityCount }}</p>
          <NuxtLink to="/admin" class="text-sm text-green-600 hover:underline">
            Quản lý hoạt động →
          </NuxtLink>
        </div>
      </div>
      
      <div v-if="!dbInitialized" class="mt-4 p-4 rounded-lg bg-yellow-50 border-yellow-200 border">
        <p class="font-medium text-yellow-700 mb-2">Cơ sở dữ liệu chưa được khởi tạo</p>
        <p class="mb-3 text-sm text-yellow-600">
          Bạn cần khởi tạo cơ sở dữ liệu để bắt đầu sử dụng ứng dụng với tính năng lưu trữ dữ liệu.
        </p>
        <NuxtLink 
          to="/admin" 
          class="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          Khởi tạo cơ sở dữ liệu
        </NuxtLink>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Hướng dẫn sử dụng -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Hướng dẫn sử dụng</h2>
        
        <ol class="list-decimal pl-6 space-y-3">
          <li>
            <span class="font-medium">Khởi tạo cơ sở dữ liệu</span>
            <p class="text-gray-600 text-sm mt-1">
              Truy cập trang Quản lý DB và nhấn nút "Khởi tạo cơ sở dữ liệu" để tạo các bảng cần thiết.
            </p>
          </li>
          <li>
            <span class="font-medium">Thêm thành viên</span>
            <p class="text-gray-600 text-sm mt-1">
              Thêm các thành viên tham gia vào hoạt động chia tiền. Bạn có thể thêm mã QR cho mỗi thành viên.
            </p>
          </li>
          <li>
            <span class="font-medium">Tạo hoạt động chi tiêu</span>
            <p class="text-gray-600 text-sm mt-1">
              Tạo các hoạt động chi tiêu, chỉ định người trả tiền và số tiền đã chi.
            </p>
          </li>
          <li>
            <span class="font-medium">Thêm người tham gia</span>
            <p class="text-gray-600 text-sm mt-1">
              Chọn những người tham gia vào mỗi hoạt động và ứng dụng sẽ tính toán số tiền mỗi người cần đóng góp.
            </p>
          </li>
          <li>
            <span class="font-medium">Xem báo cáo</span>
            <p class="text-gray-600 text-sm mt-1">
              Xem báo cáo chi tiết về các khoản phải thu/phải trả giữa các thành viên.
            </p>
          </li>
        </ol>
      </div>
      
      <!-- Tính năng -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Tính năng nổi bật</h2>
        
        <ul class="space-y-3">
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <div>
              <span class="font-medium">Lưu trữ dữ liệu</span>
              <p class="text-gray-600 text-sm mt-1">
                Lưu trữ thông tin thành viên, hoạt động và lịch sử giao dịch trong cơ sở dữ liệu PostgreSQL.
              </p>
            </div>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <div>
              <span class="font-medium">Hỗ trợ mã QR</span>
              <p class="text-gray-600 text-sm mt-1">
                Lưu trữ mã QR thanh toán cho từng thành viên để thuận tiện cho việc chuyển tiền.
              </p>
            </div>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <div>
              <span class="font-medium">Tính toán thông minh</span>
              <p class="text-gray-600 text-sm mt-1">
                Tự động tính toán số tiền mỗi người cần thanh toán và tối ưu hóa các giao dịch.
              </p>
            </div>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <div>
              <span class="font-medium">API đầy đủ</span>
              <p class="text-gray-600 text-sm mt-1">
                Cung cấp API đầy đủ để quản lý thành viên, hoạt động và người tham gia.
              </p>
            </div>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <div>
              <span class="font-medium">Giao diện thân thiện</span>
              <p class="text-gray-600 text-sm mt-1">
                Giao diện người dùng dễ sử dụng, hỗ trợ đầy đủ trên cả thiết bị di động và máy tính.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
const database = useDatabase();
const isLoading = ref(true);
const memberCount = ref(0);
const activityCount = ref(0);
const dbInitialized = ref(true);

// Tải thông tin khi trang được tạo
onMounted(async () => {
  try {
    // Tải danh sách thành viên và hoạt động
    const members = await database.fetchMembers();
    const activities = await database.fetchActivities();
    
    memberCount.value = members.length;
    activityCount.value = activities.length;
    
    // Nếu không có dữ liệu, có thể cơ sở dữ liệu chưa được khởi tạo
    dbInitialized.value = (members.length > 0 || activities.length > 0);
  } catch (error) {
    console.error('Error loading data:', error);
    dbInitialized.value = false;
  } finally {
    isLoading.value = false;
  }
});
</script>