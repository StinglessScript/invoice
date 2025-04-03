// Định nghĩa các kiểu dữ liệu cho VietQR API

export interface Bank {
  id: string;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name?: string;
  swift_code?: string;
  support?: number;
}

export interface BankListResponse {
  code: string;
  desc: string;
  data: {
    banks: Bank[];
  };
}

export interface QRCodeGenRequest {
  accountNo: string;    // Số tài khoản
  accountName?: string; // Tên chủ tài khoản (tùy chọn)
  acqId: string;        // Mã ngân hàng (bin)
  amount: number;       // Số tiền
  addInfo?: string;     // Thông tin bổ sung (nội dung chuyển khoản)
  format?: string;      // Định dạng ảnh (mặc định: png)
  template?: string;    // Giao diện (compact, print, qr)
}

export interface QRDisplayInfo {
  bankName: string;
  bankCode: string;
  bankBin: string;
  bankLogo: string;
  accountNo: string;
  accountName?: string;
  amount: number;
  addInfo?: string;
  qrCode: string;
}