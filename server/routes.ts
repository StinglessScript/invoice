import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./pgStorage"; // Sử dụng PostgreSQL storage thay vì in-memory
import { z } from "zod";
import { 
  insertMemberSchema, 
  insertActivitySchema, 
  insertParticipantSchema,
  insertTransactionSchema
} from "../shared/schema.js";
import { vietqrService } from "./vietqrService";
import { QRCodeGenRequest } from "../shared/vietqr";

export async function registerRoutes(app: Express): Promise<Server> {
  // Members routes
  app.get("/api/members", async (req: Request, res: Response) => {
    const members = await storage.getMembers();
    res.json(members);
  });

  app.get("/api/members/search", async (req: Request, res: Response) => {
    const query = req.query.q as string || "";
    const members = await storage.searchMembers(query);
    res.json(members);
  });

  app.get("/api/members/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid member ID" });
    }
    
    const member = await storage.getMember(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    res.json(member);
  });

  app.post("/api/members", async (req: Request, res: Response) => {
    try {
      const data = insertMemberSchema.parse(req.body);
      
      // Kiểm tra trùng lặp: name giống nhau và active = true
      const existingMembers = await storage.searchMembers(data.name);
      const duplicate = existingMembers.find(m => 
        m.name.toLowerCase() === data.name.toLowerCase() && 
        m.active === true
      );
      
      // Nếu tìm thấy thành viên bị xóa mềm (active=false), cập nhật thay vì tạo mới
      const inactiveMatch = existingMembers.find(m => 
        m.name.toLowerCase() === data.name.toLowerCase() && 
        m.active === false
      );
      
      if (duplicate) {
        return res.status(400).json({ 
          message: "Thành viên với tên này đã tồn tại" 
        });
      }
      
      // Nếu có thành viên bị xóa mềm, kích hoạt lại
      if (inactiveMatch) {
        const reactivated = await storage.reactivateMember(inactiveMatch.id);
        return res.status(200).json(reactivated);
      }
      
      const member = await storage.createMember(data);
      res.status(201).json(member);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Failed to create member" });
    }
  });
  
  app.delete("/api/members/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid member ID" });
    }
    
    try {
      // Kiểm tra xem thành viên có tồn tại không trước khi xóa
      const member = await storage.getMember(id);
      if (!member) {
        return res.status(404).json({ message: "Không tìm thấy thành viên" });
      }
      
      const deleted = await storage.deleteMember(id);
      if (deleted) {
        res.status(204).send();
      } else {
        // Thành viên tồn tại nhưng không thể xóa vì ràng buộc khóa ngoại
        return res.status(409).json({ 
          message: "Không thể xóa thành viên", 
          detail: "Thành viên này đang tham gia hoạt động hoặc giao dịch. Hãy xóa các hoạt động và giao dịch liên quan trước." 
        });
      }
    } catch (error) {
      console.error("Error in delete member route:", error);
      res.status(500).json({ message: "Lỗi máy chủ khi xóa thành viên", error: String(error) });
    }
  });

  // Activities routes
  app.get("/api/activities", async (req: Request, res: Response) => {
    const activities = await storage.getActivitiesWithParticipants();
    res.json(activities);
  });

  app.post("/api/activities", async (req: Request, res: Response) => {
    try {
      const activityData = insertActivitySchema.parse({
        name: req.body.name,
        amount: Number(req.body.amount),
        payerId: Number(req.body.payerId)
      });
      
      // Create activity
      const activity = await storage.createActivity(activityData);
      
      // Add participants
      if (Array.isArray(req.body.participants)) {
        const participantIds = req.body.participants.map(Number);
        
        for (const memberId of participantIds) {
          await storage.addParticipant({
            activityId: activity.id,
            memberId
          });
        }
      }
      
      // Return full activity with participants
      const activities = await storage.getActivitiesWithParticipants();
      const activityWithParticipants = activities.find(a => a.id === activity.id);
      
      res.status(201).json(activityWithParticipants);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.delete("/api/activities/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid activity ID" });
    }
    
    const deleted = await storage.deleteActivity(id);
    if (!deleted) {
      return res.status(404).json({ message: "Activity not found" });
    }
    
    res.status(204).send();
  });
  
  app.patch("/api/activities/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      // Lấy hoạt động hiện tại
      const activity = await storage.getActivity(id);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Lấy dữ liệu cập nhật
      const updateData = {
        name: req.body.name || activity.name,
        amount: Number(req.body.amount) || activity.amount,
        payerId: Number(req.body.payerId) || activity.payerId
      };
      
      // Cập nhật hoạt động
      const updatedActivity = await storage.updateActivity(id, updateData);
      
      // Cập nhật người tham gia nếu có
      if (Array.isArray(req.body.participants)) {
        // Xóa tất cả người tham gia cũ
        await storage.removeAllParticipantsFromActivity(id);
        
        // Thêm người tham gia mới
        const participantIds = req.body.participants.map(Number);
        for (const memberId of participantIds) {
          await storage.addParticipant({
            activityId: id,
            memberId
          });
        }
      }
      
      // Lấy hoạt động đã cập nhật với danh sách người tham gia mới
      const activityWithParticipants = await storage.getActivityWithParticipants(id);
      
      res.json(activityWithParticipants);
    } catch (err) {
      console.error("Error updating activity:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  // Results routes
  app.get("/api/results", async (req: Request, res: Response) => {
    try {
      const balances = await storage.calculateBalances();
      
      // Generate transactions
      const transactions = [];
      // Deep copy to avoid modifying the original balances
      const mutableBalances = balances.map(b => ({...b}));
      
      // Find who needs to pay and who needs to receive
      const debtors = mutableBalances.filter(b => b.balance < 0)
        .sort((a, b) => a.balance - b.balance); // Largest debt first
      const creditors = mutableBalances.filter(b => b.balance > 0)
        .sort((a, b) => b.balance - a.balance); // Largest credit first
      
      // Calculate transactions
      for (const debtor of debtors) {
        let amountToSend = -debtor.balance; // Convert to positive
        
        for (let i = 0; i < creditors.length && amountToSend > 0; i++) {
          const creditor = creditors[i];
          
          if (creditor.balance <= 0) continue;
          
          const transferAmount = Math.min(amountToSend, creditor.balance);
          
          transactions.push({
            fromMemberId: debtor.memberId,
            toMemberId: creditor.memberId,
            amount: transferAmount,
            fromMember: { id: debtor.memberId, name: debtor.name, phone: debtor.phone },
            toMember: { id: creditor.memberId, name: creditor.name, phone: creditor.phone },
            completed: false
          });
          
          // Update balances
          amountToSend -= transferAmount;
          creditor.balance -= transferAmount;
        }
      }
      
      res.json({
        summary: {
          totalSpent: balances.reduce((sum, b) => sum + b.paid, 0),
          memberCount: balances.length,
          activityCount: (await storage.getActivities()).length,
          averagePerMember: balances.length ? Math.floor(balances.reduce((sum, b) => sum + b.shouldPay, 0) / balances.length) : 0
        },
        memberBalances: balances,
        transactions
      });
    } catch (err) {
      console.error("Error calculating results:", err);
      res.status(500).json({ message: "Failed to calculate results" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", async (req: Request, res: Response) => {
    const transactions = await storage.getTransactionsWithMembers();
    res.json(transactions);
  });

  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const data = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(data);
      res.status(201).json(transaction);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.patch("/api/transactions/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }
    
    try {
      const { completed } = req.body;
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ message: "Missing or invalid 'completed' status" });
      }
      
      const transaction = await storage.updateTransactionStatus(id, completed);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (err) {
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  // VietQR API Routes
  app.get("/api/vietqr/banks", async (req: Request, res: Response) => {
    try {
      let banks = [];
      
      // Nếu có tham số tìm kiếm và không rỗng
      if (req.query.q && String(req.query.q).trim() !== '') {
        const query = String(req.query.q).trim();
        banks = await vietqrService.findBank(query);
      } else {
        // Lấy tất cả ngân hàng
        banks = await vietqrService.getBanks();
      }
      
      return res.json(banks || []);
    } catch (error) {
      console.error("Error fetching banks:", error);
      return res.status(500).json({ 
        message: "Không thể lấy danh sách ngân hàng", 
        error: String(error) 
      });
    }
  });

  app.post("/api/vietqr/generate", async (req: Request, res: Response) => {
    try {
      const qrData: QRCodeGenRequest = {
        accountNo: req.body.accountNo,
        accountName: req.body.accountName,
        acqId: req.body.acqId, // Bank BIN
        amount: Number(req.body.amount),
        addInfo: req.body.addInfo,
        format: req.body.format || 'compact',
        template: req.body.template
      };
      
      const qrInfo = await vietqrService.generateQRInfo(qrData);
      res.json(qrInfo);
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ 
        message: "Không thể tạo mã QR", 
        error: String(error) 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
