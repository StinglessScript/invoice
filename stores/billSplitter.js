import { defineStore } from 'pinia';
import { calculateTransactions } from '~/utils/calculations';

export const useBillSplitterStore = defineStore('billSplitter', {
  state: () => ({
    members: [], // Danh sách tên thành viên (để tương thích với code cũ)
    memberDetails: [], // Danh sách chi tiết thành viên bao gồm tên và thông tin QR code
    activities: [],
    memberSummaries: [],
    transactions: [],
    showResults: false
  }),
  
  getters: {
    hasActivities: (state) => state.activities.length > 0,
    hasData: (state) => state.members.length > 0 || state.activities.length > 0
  },
  
  actions: {
    // Thêm thành viên chỉ với tên (để tương thích với code cũ)
    addMember(member) {
      // Check if member already exists (case-insensitive)
      const exists = this.members.some(m => 
        m.toLowerCase() === member.toLowerCase()
      );
      
      if (!exists) {
        // Thêm vào danh sách tên
        this.members.push(member);
        
        // Thêm vào danh sách chi tiết nếu chưa có
        const existsInDetails = this.memberDetails.some(m => 
          m.name.toLowerCase() === member.toLowerCase()
        );
        
        if (!existsInDetails) {
          this.memberDetails.push({
            id: Date.now(),
            name: member,
            qrCode: '' // QR code trống ban đầu
          });
        }
        
        this.saveToLocalStorage();
      } else {
        alert(`Thành viên "${member}" đã tồn tại!`);
      }
    },
    
    // Thêm thành viên với đầy đủ thông tin
    addMemberWithDetails(memberData) {
      // Check if member already exists (case-insensitive)
      const exists = this.members.some(m => 
        m.toLowerCase() === memberData.name.toLowerCase()
      );
      
      if (!exists) {
        // Thêm vào danh sách tên
        this.members.push(memberData.name);
        
        // Thêm vào danh sách chi tiết
        this.memberDetails.push({
          id: Date.now(),
          name: memberData.name,
          qrCode: memberData.qrCode || ''
        });
        
        this.saveToLocalStorage();
        return true;
      } else {
        alert(`Thành viên "${memberData.name}" đã tồn tại!`);
        return false;
      }
    },
    
    // Cập nhật thông tin thành viên
    updateMemberDetails(memberId, updatedData) {
      const memberIndex = this.memberDetails.findIndex(m => m.id === memberId);
      
      if (memberIndex !== -1) {
        const oldName = this.memberDetails[memberIndex].name;
        const newName = updatedData.name;
        
        // Cập nhật trong memberDetails
        this.memberDetails[memberIndex] = {
          ...this.memberDetails[memberIndex],
          ...updatedData
        };
        
        // Nếu tên thay đổi, cập nhật trong members và các hoạt động
        if (oldName !== newName) {
          // Cập nhật trong danh sách tên
          const nameIndex = this.members.findIndex(m => m === oldName);
          if (nameIndex !== -1) {
            this.members[nameIndex] = newName;
          }
          
          // Cập nhật trong các hoạt động
          this.activities.forEach(activity => {
            // Cập nhật người trả tiền
            if (activity.payer === oldName) {
              activity.payer = newName;
            }
            
            // Cập nhật người tham gia
            activity.participants = activity.participants.map(p => 
              p === oldName ? newName : p
            );
          });
        }
        
        this.saveToLocalStorage();
        return true;
      }
      
      return false;
    },
    
    // Lấy thông tin chi tiết thành viên
    getMemberDetails(memberName) {
      return this.memberDetails.find(m => m.name === memberName) || null;
    },
    
    removeMember(index) {
      const member = this.members[index];
      
      // Check if member is used in any activity
      if (this.isMemberUsedInActivity(member)) {
        alert(`Không thể xóa "${member}" vì họ đang tham gia hoạt động!`);
        return;
      }
      
      // Xóa từ danh sách tên
      this.members.splice(index, 1);
      
      // Xóa từ danh sách chi tiết
      const detailIndex = this.memberDetails.findIndex(m => m.name === member);
      if (detailIndex !== -1) {
        this.memberDetails.splice(detailIndex, 1);
      }
      
      this.saveToLocalStorage();
    },
    
    isMemberUsedInActivity(member) {
      return this.activities.some(activity => 
        activity.payer === member || 
        activity.participants.includes(member)
      );
    },
    
    addActivity(activity) {
      this.activities.push(activity);
      this.saveToLocalStorage();
    },
    
    removeActivity(id) {
      const index = this.activities.findIndex(activity => activity.id === id);
      if (index !== -1) {
        this.activities.splice(index, 1);
        this.saveToLocalStorage();
      }
    },
    
    calculateResults() {
      if (this.activities.length === 0) {
        alert('Chưa có hoạt động nào để tính toán!');
        return;
      }
      
      // Calculate what each member paid and should pay
      const memberBalances = {};
      
      // Initialize balances for all members
      this.members.forEach(member => {
        memberBalances[member] = {
          paid: 0,
          shouldPay: 0
        };
      });
      
      // Calculate paid amounts and should-pay amounts
      this.activities.forEach(activity => {
        // Add what the payer paid
        memberBalances[activity.payer].paid += activity.amount;
        
        // Calculate what each participant should pay
        const perPersonAmount = activity.amount / activity.participants.length;
        activity.participants.forEach(participant => {
          memberBalances[participant].shouldPay += perPersonAmount;
        });
      });
      
      // Calculate final balance (positive means they get money back)
      const balances = this.members.map(member => ({
        name: member,
        balance: memberBalances[member].paid - memberBalances[member].shouldPay,
        paid: memberBalances[member].paid,
        shouldPay: memberBalances[member].shouldPay
      }));
      
      // Calculate the transactions needed
      this.transactions = calculateTransactions(balances);
      this.memberSummaries = balances;
      this.showResults = true;
      this.saveToLocalStorage();
    },
    
    clearAll() {
      this.members = [];
      this.memberDetails = [];
      this.activities = [];
      this.memberSummaries = [];
      this.transactions = [];
      this.showResults = false;
      localStorage.removeItem('billSplitterData');
    },
    
    saveToLocalStorage() {
      const data = {
        members: this.members,
        memberDetails: this.memberDetails,
        activities: this.activities,
        memberSummaries: this.memberSummaries,
        transactions: this.transactions,
        showResults: this.showResults
      };
      
      localStorage.setItem('billSplitterData', JSON.stringify(data));
    },
    
    loadFromLocalStorage() {
      const savedData = localStorage.getItem('billSplitterData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.members = data.members || [];
        this.memberDetails = data.memberDetails || [];
        this.activities = data.activities || [];
        this.memberSummaries = data.memberSummaries || [];
        this.transactions = data.transactions || [];
        this.showResults = data.showResults || false;
        
        // Đảm bảo tương thích ngược với dữ liệu cũ
        if (this.members.length > 0 && this.memberDetails.length === 0) {
          // Nếu có danh sách thành viên nhưng không có chi tiết, tạo chi tiết cho từng thành viên
          this.members.forEach(member => {
            this.memberDetails.push({
              id: Date.now() + Math.random(),
              name: member,
              qrCode: ''
            });
          });
        }
      }
    }
  }
});
