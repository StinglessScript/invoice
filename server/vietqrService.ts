import axios from 'axios';
import { Bank, BankListResponse, QRCodeGenRequest, QRDisplayInfo } from '../shared/vietqr';

/**
 * VietQR Service
 * Singleton pattern cho việc truy cập API VietQR
 */
export class VietQRService {
  private static instance: VietQRService;
  private banksCache: Bank[] = []; // Khởi tạo là mảng rỗng thay vì null
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 3600000; // 1 giờ (milliseconds)

  private constructor() {
    // Tạo dữ liệu mẫu cho một số ngân hàng phổ biến
    this.banksCache = [
      {
        id: "970436",
        name: "Ngân hàng TMCP Ngoại thương Việt Nam",
        code: "VCB",
        bin: "970436",
        shortName: "Vietcombank", 
        logo: "https://api.vietqr.io/img/VCB.png",
        transferSupported: 1,
        lookupSupported: 1
      },
      {
        id: "970418",
        name: "Ngân hàng TMCP Công thương Việt Nam",
        code: "ICB",
        bin: "970418",
        shortName: "VietinBank",
        logo: "https://api.vietqr.io/img/ICB.png",
        transferSupported: 1,
        lookupSupported: 1
      },
      {
        id: "970415",
        name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
        code: "BIDV",
        bin: "970415",
        shortName: "BIDV",
        logo: "https://api.vietqr.io/img/BIDV.png",
        transferSupported: 1,
        lookupSupported: 1
      },
      {
        id: "970412",
        name: "Ngân hàng TMCP Kỹ thương Việt Nam",
        code: "TCB",
        bin: "970412",
        shortName: "Techcombank",
        logo: "https://api.vietqr.io/img/TCB.png",
        transferSupported: 1,
        lookupSupported: 1
      },
      {
        id: "970407",
        name: "Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh",
        code: "HDB",
        bin: "970407",
        shortName: "HDBank",
        logo: "https://api.vietqr.io/img/HDB.png",
        transferSupported: 1,
        lookupSupported: 1
      },
      {
        id: "970423",
        name: "Ngân hàng TMCP Tiên Phong",
        code: "TPB",
        bin: "970423",
        shortName: "TPBank",
        logo: "https://api.vietqr.io/img/TPB.png",
        transferSupported: 1,
        lookupSupported: 1
      },
      {
        id: "970432",
        name: "Ngân hàng TMCP Quân đội",
        code: "MB",
        bin: "970432",
        shortName: "MBBank",
        logo: "https://api.vietqr.io/img/MB.png",
        transferSupported: 1,
        lookupSupported: 1
      },
      {
        id: "970422",
        name: "Ngân hàng TMCP Quốc tế Việt Nam",
        code: "VIB",
        bin: "970422",
        shortName: "VIB",
        logo: "https://api.vietqr.io/img/VIB.png",
        transferSupported: 1,
        lookupSupported: 1
      }
    ];
    this.lastFetchTime = Date.now();
    console.log('Đã khởi tạo cache với', this.banksCache.length, 'ngân hàng');
  }

  public static getInstance(): VietQRService {
    if (!VietQRService.instance) {
      VietQRService.instance = new VietQRService();
    }
    return VietQRService.instance;
  }

  /**
   * Lấy danh sách tất cả ngân hàng có hỗ trợ chuyển khoản
   */
  public async getBanks(): Promise<Bank[]> {
    try {
      // Kiểm tra cache
      if (this.banksCache && this.banksCache.length > 0 && (Date.now() - this.lastFetchTime < this.CACHE_DURATION)) {
        return this.banksCache;
      }

      // Gọi API để lấy danh sách ngân hàng
      const response = await axios.get('https://api.vietqr.io/v2/banks');
      const data = response.data as BankListResponse;

      // Kiểm tra dữ liệu phản hồi
      if (data && data.code === '00' && data.data && Array.isArray(data.data.banks)) {
        // Lưu vào cache
        this.banksCache = data.data.banks;
        this.lastFetchTime = Date.now();
        return data.data.banks;
      } else {
        console.warn('Định dạng phản hồi API không đúng:', data);
        if (!this.banksCache) {
          this.banksCache = [];
        }
        return this.banksCache;
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách ngân hàng:', error);
      // Nếu có lỗi, trả về cache nếu có
      if (!this.banksCache) {
        this.banksCache = [];
      }
      return this.banksCache;
    }
  }

  /**
   * Tìm kiếm ngân hàng theo mã bin hoặc code
   */
  public async findBank(query: string): Promise<Bank[]> {
    try {
      // Lấy tất cả các ngân hàng
      const banks = await this.getBanks();
      
      // Kiểm tra xem có danh sách và có phải là một mảng không
      if (!banks || !Array.isArray(banks) || banks.length === 0) {
        console.warn('Không có dữ liệu ngân hàng để tìm kiếm:', query);
        return [];
      }
      
      // Tìm kiếm không phân biệt chữ hoa/thường
      const lowercaseQuery = query.toLowerCase();
      
      // Trả về các ngân hàng phù hợp
      const filtered = banks.filter(bank => 
        (bank.bin && typeof bank.bin === 'string' && bank.bin.toLowerCase().includes(lowercaseQuery)) || 
        (bank.code && typeof bank.code === 'string' && bank.code.toLowerCase().includes(lowercaseQuery)) || 
        (bank.name && typeof bank.name === 'string' && bank.name.toLowerCase().includes(lowercaseQuery)) ||
        (bank.shortName && typeof bank.shortName === 'string' && bank.shortName.toLowerCase().includes(lowercaseQuery))
      );
      
      console.log(`Tìm thấy ${filtered.length} ngân hàng khớp với "${query}"`);
      return filtered;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm ngân hàng:", error);
      return [];
    }
  }

  /**
   * Tạo thông tin QR Code cho thanh toán
   */
  public async generateQRInfo(qrRequest: QRCodeGenRequest): Promise<QRDisplayInfo> {
    // Validate input
    if (!qrRequest.accountNo || !qrRequest.acqId) {
      throw new Error('Thiếu thông tin tài khoản hoặc mã ngân hàng');
    }

    // Tìm ngân hàng từ cache nếu có, hoặc lấy danh sách mới
    let bankInfo: Bank | undefined;
    
    try {
      // Đảm bảo chúng ta có danh sách ngân hàng
      if (!this.banksCache || this.banksCache.length === 0) {
        await this.getBanks();
      }
      
      if (this.banksCache && this.banksCache.length > 0) {
        bankInfo = this.banksCache.find(bank => bank.bin === qrRequest.acqId);
      }
      
      // Nếu không tìm thấy ngân hàng, tạo một ngân hàng mới với thông tin cơ bản
      if (!bankInfo) {
        console.warn(`Không tìm thấy ngân hàng với mã bin ${qrRequest.acqId}, sử dụng thông tin cơ bản`);
        bankInfo = {
          id: qrRequest.acqId,
          bin: qrRequest.acqId,
          code: qrRequest.acqId,
          name: qrRequest.acqId,
          shortName: qrRequest.acqId,
          logo: 'https://vietqr.net/img/financial-services.png', // Logo mặc định
          transferSupported: 1,
          lookupSupported: 0
        };
      }
    } catch (error) {
      console.error('Lỗi khi tìm ngân hàng:', error);
      // Tạo ngân hàng mặc định nếu có lỗi
      bankInfo = {
        id: qrRequest.acqId,
        bin: qrRequest.acqId,
        code: qrRequest.acqId,
        name: qrRequest.acqId,
        shortName: qrRequest.acqId,
        logo: 'https://vietqr.net/img/financial-services.png', // Logo mặc định
        transferSupported: 1,
        lookupSupported: 0
      };
    }

    // Tạo đường dẫn tới QR code
    const params = new URLSearchParams();
    params.append('accountNo', qrRequest.accountNo);
    if (qrRequest.accountName) params.append('accountName', qrRequest.accountName);
    params.append('acqId', qrRequest.acqId);
    params.append('amount', qrRequest.amount.toString());
    if (qrRequest.addInfo) params.append('addInfo', qrRequest.addInfo);
    if (qrRequest.format) params.append('format', qrRequest.format);
    if (qrRequest.template) params.append('template', qrRequest.template);

    const qrCodeUrl = `https://img.vietqr.io/image/${qrRequest.acqId}-${qrRequest.accountNo}-${qrRequest.format || 'compact'}.png?${params.toString()}`;

    // Trả về thông tin để hiển thị
    return {
      bankName: bankInfo.name,
      bankCode: bankInfo.code,
      bankBin: bankInfo.bin,
      bankLogo: bankInfo.logo,
      accountNo: qrRequest.accountNo,
      accountName: qrRequest.accountName,
      amount: qrRequest.amount,
      addInfo: qrRequest.addInfo,
      qrCode: qrCodeUrl
    };
  }
}

export const vietqrService = VietQRService.getInstance();