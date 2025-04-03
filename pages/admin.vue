<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Quản lý cơ sở dữ liệu</h1>
    
    <!-- Trạng thái kết nối DB -->
    <div class="bg-white p-6 rounded-lg shadow mb-8">
      <h2 class="text-xl font-semibold mb-4">Trạng thái cơ sở dữ liệu</h2>
      
      <div v-if="dbStatus.loading" class="text-center py-4">
        Đang kiểm tra kết nối...
      </div>
      
      <div v-else-if="dbStatus.error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 class="text-red-700 font-medium mb-2">Lỗi kết nối</h3>
        <p class="text-red-600 text-sm mb-3">{{ dbStatus.error }}</p>
        <button 
          @click="checkDbConnection" 
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Kiểm tra lại
        </button>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="border rounded-lg p-4 bg-blue-50">
          <h3 class="font-medium mb-2 text-blue-700">Thành viên</h3>
          <p class="text-3xl font-bold mb-1">{{ dbStatus.members.length || 0 }}</p>
        </div>
        
        <div class="border rounded-lg p-4 bg-green-50">
          <h3 class="font-medium mb-2 text-green-700">Hoạt động</h3>
          <p class="text-3xl font-bold mb-1">{{ dbStatus.activities.length || 0 }}</p>
        </div>
        
        <div class="border rounded-lg p-4 bg-purple-50">
          <h3 class="font-medium mb-2 text-purple-700">Tham gia</h3>
          <p class="text-3xl font-bold mb-1">{{ dbStatus.participants.length || 0 }}</p>
        </div>
      </div>
      
      <div class="mt-6">
        <button 
          @click="setupDatabase" 
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="dbSetupInProgress"
        >
          {{ dbSetupInProgress ? 'Đang khởi tạo...' : 'Khởi tạo cơ sở dữ liệu' }}
        </button>
        <p class="text-sm text-gray-500 mt-2">
          Khởi tạo hoặc cập nhật cấu trúc cơ sở dữ liệu. Thao tác này không xóa dữ liệu đã có.
        </p>
      </div>
    </div>
    
    <!-- Tabs quản lý dữ liệu -->
    <div class="bg-white rounded-lg shadow">
      <div class="border-b px-5">
        <nav class="flex space-x-6">
          <button 
            @click="activeTab = 'members'" 
            class="py-4 px-1 border-b-2 font-medium text-sm leading-5 focus:outline-none"
            :class="activeTab === 'members' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Thành viên
          </button>
          <button 
            @click="activeTab = 'activities'" 
            class="py-4 px-1 border-b-2 font-medium text-sm leading-5 focus:outline-none"
            :class="activeTab === 'activities' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Hoạt động
          </button>
          <button 
            @click="activeTab = 'participants'" 
            class="py-4 px-1 border-b-2 font-medium text-sm leading-5 focus:outline-none"
            :class="activeTab === 'participants' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Người tham gia
          </button>
        </nav>
      </div>
      
      <!-- Nội dung tab -->
      <div class="p-6">
        <!-- Tab thành viên -->
        <div v-if="activeTab === 'members'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">Quản lý thành viên</h3>
            <button
              @click="showMemberForm = !showMemberForm"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {{ showMemberForm ? 'Đóng biểu mẫu' : 'Thêm thành viên' }}
            </button>
          </div>
          
          <!-- Form thêm thành viên -->
          <div v-if="showMemberForm" class="bg-gray-50 p-4 rounded-lg mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tên thành viên</label>
                <input 
                  v-model="newMember.name" 
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên thành viên"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input 
                  v-model="newMember.phone" 
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số điện thoại (không bắt buộc)"
                />
              </div>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Mã QR (URL)</label>
              <input 
                v-model="newMember.qrCode" 
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập URL mã QR thanh toán (không bắt buộc)"
              />
            </div>
            
            <div class="flex justify-end">
              <button
                @click="addMember"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                :disabled="!newMember.name"
              >
                Thêm thành viên
              </button>
            </div>
          </div>
          
          <!-- Danh sách thành viên -->
          <div v-if="loadingStates.members" class="text-center py-8">
            Đang tải danh sách thành viên...
          </div>
          
          <div v-else-if="dbStatus.members.length === 0" class="text-center py-8 text-gray-500">
            Chưa có thành viên nào. Hãy thêm thành viên mới.
          </div>
          
          <div v-else>
            <table class="min-w-full border divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã QR</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="member in dbStatus.members" :key="member.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ member.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ member.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ member.phone || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span v-if="member.qrCode" class="text-blue-600 underline cursor-pointer" @click="openQRCode(member.qrCode)">
                      Xem mã QR
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click="confirmDeleteMember(member)" 
                      class="text-red-600 hover:text-red-900 mr-3"
                    >
                      Xóa
                    </button>
                    <button 
                      @click="editMember(member)" 
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Tab hoạt động -->
        <div v-if="activeTab === 'activities'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">Quản lý hoạt động</h3>
            <button
              @click="showActivityForm = !showActivityForm"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {{ showActivityForm ? 'Đóng biểu mẫu' : 'Thêm hoạt động' }}
            </button>
          </div>
          
          <!-- Form thêm hoạt động -->
          <div v-if="showActivityForm" class="bg-gray-50 p-4 rounded-lg mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tên hoạt động</label>
                <input 
                  v-model="newActivity.name" 
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên hoạt động"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                <input 
                  v-model="newActivity.amount" 
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số tiền"
                />
              </div>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Người trả tiền</label>
              <select
                v-model="newActivity.payerId"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Chọn người trả tiền</option>
                <option v-for="member in dbStatus.members" :key="member.id" :value="member.id">
                  {{ member.name }}
                </option>
              </select>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                v-model="newActivity.description"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mô tả (không bắt buộc)"
                rows="3"
              ></textarea>
            </div>
            
            <div class="flex justify-end">
              <button
                @click="addActivity"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                :disabled="!newActivity.name || !newActivity.amount || !newActivity.payerId"
              >
                Thêm hoạt động
              </button>
            </div>
          </div>
          
          <!-- Danh sách hoạt động -->
          <div v-if="loadingStates.activities" class="text-center py-8">
            Đang tải danh sách hoạt động...
          </div>
          
          <div v-else-if="dbStatus.activities.length === 0" class="text-center py-8 text-gray-500">
            Chưa có hoạt động nào. Hãy thêm hoạt động mới.
          </div>
          
          <div v-else>
            <table class="min-w-full border divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người trả</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tham gia</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="activity in dbStatus.activities" :key="activity.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ activity.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ activity.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(activity.amount) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getMemberName(activity.payerId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ getActivityParticipantCount(activity.id) }} người
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click="confirmDeleteActivity(activity)" 
                      class="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Tab người tham gia -->
        <div v-if="activeTab === 'participants'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">Quản lý người tham gia</h3>
            <button
              @click="showParticipantForm = !showParticipantForm"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {{ showParticipantForm ? 'Đóng biểu mẫu' : 'Thêm người tham gia' }}
            </button>
          </div>
          
          <!-- Form thêm người tham gia -->
          <div v-if="showParticipantForm" class="bg-gray-50 p-4 rounded-lg mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hoạt động</label>
                <select
                  v-model="newParticipant.activityId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Chọn hoạt động</option>
                  <option v-for="activity in dbStatus.activities" :key="activity.id" :value="activity.id">
                    {{ activity.name }} ({{ formatCurrency(activity.amount) }})
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Thành viên</label>
                <select
                  v-model="newParticipant.memberId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Chọn thành viên</option>
                  <option v-for="member in dbStatus.members" :key="member.id" :value="member.id">
                    {{ member.name }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="flex justify-end">
              <button
                @click="addParticipant"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                :disabled="!newParticipant.activityId || !newParticipant.memberId"
              >
                Thêm người tham gia
              </button>
            </div>
          </div>
          
          <!-- Danh sách người tham gia -->
          <div v-if="loadingStates.participants" class="text-center py-8">
            Đang tải danh sách người tham gia...
          </div>
          
          <div v-else-if="dbStatus.participants.length === 0" class="text-center py-8 text-gray-500">
            Chưa có người tham gia nào. Hãy thêm người tham gia mới.
          </div>
          
          <div v-else>
            <table class="min-w-full border divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hoạt động</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành viên</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="participant in dbStatus.participants" :key="`${participant.activityId}-${participant.memberId}`">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ participant.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getActivityName(participant.activityId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getMemberName(participant.memberId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click="confirmRemoveParticipant(participant)" 
                      class="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { formatCurrency } from '@/utils/formatter';

const database = useDatabase();

// Các tab và trạng thái biểu mẫu
const activeTab = ref('members');
const showMemberForm = ref(false);
const showActivityForm = ref(false);
const showParticipantForm = ref(false);

// Trạng thái tải dữ liệu
const loadingStates = ref({
  members: false,
  activities: false,
  participants: false
});

// Trạng thái DB và dữ liệu
const dbStatus = ref({
  loading: true,
  error: null,
  members: [],
  activities: [],
  participants: []
});

// Biến lưu trữ trạng thái khởi tạo DB
const dbSetupInProgress = ref(false);

// Dữ liệu biểu mẫu
const newMember = ref({
  name: '',
  phone: '',
  qrCode: ''
});

const newActivity = ref({
  name: '',
  amount: '',
  payerId: '',
  description: ''
});

const newParticipant = ref({
  activityId: '',
  memberId: ''
});

// Tải dữ liệu khi component được tạo
onMounted(async () => {
  await checkDbConnection();
});

// Tải dữ liệu từ Database
async function checkDbConnection() {
  dbStatus.value.loading = true;
  dbStatus.value.error = null;
  
  try {
    // Tải toàn bộ dữ liệu
    await Promise.all([
      fetchMembers(),
      fetchActivities(),
      fetchParticipants()
    ]);
  } catch (error) {
    console.error('Database connection error:', error);
    dbStatus.value.error = 'Không thể kết nối đến cơ sở dữ liệu. Hãy kiểm tra lại kết nối.';
  } finally {
    dbStatus.value.loading = false;
  }
}

// Các hàm truy vấn dữ liệu
async function fetchMembers() {
  loadingStates.value.members = true;
  try {
    const members = await database.fetchMembers();
    dbStatus.value.members = members;
  } catch (error) {
    console.error('Error fetching members:', error);
  } finally {
    loadingStates.value.members = false;
  }
}

async function fetchActivities() {
  loadingStates.value.activities = true;
  try {
    const activities = await database.fetchActivities();
    dbStatus.value.activities = activities;
  } catch (error) {
    console.error('Error fetching activities:', error);
  } finally {
    loadingStates.value.activities = false;
  }
}

async function fetchParticipants() {
  loadingStates.value.participants = true;
  try {
    // Tải tất cả các hoạt động và sau đó tải người tham gia cho từng hoạt động
    const activities = await database.fetchActivities();
    let allParticipants = [];
    
    for (const activity of activities) {
      const participants = await database.fetchActivityParticipants(activity.id);
      allParticipants = [...allParticipants, ...participants];
    }
    
    dbStatus.value.participants = allParticipants;
  } catch (error) {
    console.error('Error fetching participants:', error);
  } finally {
    loadingStates.value.participants = false;
  }
}

// Hàm khởi tạo cơ sở dữ liệu
async function setupDatabase() {
  dbSetupInProgress.value = true;
  
  try {
    await database.setupDatabase();
    await checkDbConnection(); // Tải lại dữ liệu sau khi khởi tạo
    alert('Cơ sở dữ liệu đã được khởi tạo thành công!');
  } catch (error) {
    console.error('Error setting up database:', error);
    alert('Có lỗi xảy ra khi khởi tạo cơ sở dữ liệu: ' + error.message);
  } finally {
    dbSetupInProgress.value = false;
  }
}

// Các hàm quản lý thành viên
async function addMember() {
  if (!newMember.value.name) return;
  
  try {
    await database.createMember(newMember.value);
    await fetchMembers();
    
    // Reset form
    newMember.value = { name: '', phone: '', qrCode: '' };
    showMemberForm.value = false;
  } catch (error) {
    console.error('Error adding member:', error);
    alert('Có lỗi xảy ra khi thêm thành viên: ' + error.message);
  }
}

function editMember(member) {
  // Implement edit member functionality
  alert('Chức năng sửa thành viên sẽ được cập nhật trong phiên bản tiếp theo.');
}

async function confirmDeleteMember(member) {
  if (!confirm(`Bạn có chắc chắn muốn xóa thành viên "${member.name}" không?`)) return;
  
  try {
    await database.deleteMember(member.id);
    await fetchMembers();
    await fetchParticipants(); // Tải lại người tham gia vì có thể đã thay đổi
  } catch (error) {
    console.error('Error deleting member:', error);
    alert('Có lỗi xảy ra khi xóa thành viên: ' + error.message);
  }
}

// Các hàm quản lý hoạt động
async function addActivity() {
  if (!newActivity.value.name || !newActivity.value.amount || !newActivity.value.payerId) return;
  
  try {
    const activity = {
      name: newActivity.value.name,
      amount: parseFloat(newActivity.value.amount),
      payerId: parseInt(newActivity.value.payerId),
      description: newActivity.value.description || ''
    };
    
    await database.createActivity(activity);
    await fetchActivities();
    
    // Reset form
    newActivity.value = { name: '', amount: '', payerId: '', description: '' };
    showActivityForm.value = false;
  } catch (error) {
    console.error('Error adding activity:', error);
    alert('Có lỗi xảy ra khi thêm hoạt động: ' + error.message);
  }
}

async function confirmDeleteActivity(activity) {
  if (!confirm(`Bạn có chắc chắn muốn xóa hoạt động "${activity.name}" không?`)) return;
  
  try {
    await database.deleteActivity(activity.id);
    await fetchActivities();
    await fetchParticipants(); // Tải lại người tham gia vì đã thay đổi
  } catch (error) {
    console.error('Error deleting activity:', error);
    alert('Có lỗi xảy ra khi xóa hoạt động: ' + error.message);
  }
}

// Các hàm quản lý người tham gia
async function addParticipant() {
  if (!newParticipant.value.activityId || !newParticipant.value.memberId) return;
  
  try {
    await database.addParticipant({
      activityId: parseInt(newParticipant.value.activityId),
      memberId: parseInt(newParticipant.value.memberId)
    });
    
    await fetchParticipants();
    
    // Reset form
    newParticipant.value = { activityId: '', memberId: '' };
    showParticipantForm.value = false;
  } catch (error) {
    console.error('Error adding participant:', error);
    alert('Có lỗi xảy ra khi thêm người tham gia: ' + error.message);
  }
}

async function confirmRemoveParticipant(participant) {
  const activityName = getActivityName(participant.activityId);
  const memberName = getMemberName(participant.memberId);
  
  if (!confirm(`Bạn có chắc chắn muốn xóa "${memberName}" khỏi hoạt động "${activityName}" không?`)) return;
  
  try {
    await database.removeParticipant(participant.activityId, participant.memberId);
    await fetchParticipants();
  } catch (error) {
    console.error('Error removing participant:', error);
    alert('Có lỗi xảy ra khi xóa người tham gia: ' + error.message);
  }
}

// Các hàm tiện ích
function getMemberName(memberId) {
  const member = dbStatus.value.members.find(m => m.id === memberId);
  return member ? member.name : 'Không xác định';
}

function getActivityName(activityId) {
  const activity = dbStatus.value.activities.find(a => a.id === activityId);
  return activity ? activity.name : 'Không xác định';
}

function getActivityParticipantCount(activityId) {
  return dbStatus.value.participants.filter(p => p.activityId === activityId).length;
}

function openQRCode(qrCodeUrl) {
  window.open(qrCodeUrl, '_blank');
}
</script>