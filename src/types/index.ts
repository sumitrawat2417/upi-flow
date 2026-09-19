// ─── Merchant Profile ─────────────────────────────────────────────
export interface MerchantProfile {
  id: string;
  businessName: string;
  upiId: string;       // Primary or legacy UPI ID
  upiIds: string[];    // Array of all verified UPI IDs
  upiLabels?: Record<string, string>; // Maps UPI ID -> User-defined Label
  createdAt: number;
}

// ─── Payment Status ───────────────────────────────────────────────
export type PaymentStatus = 'pending' | 'active' | 'received' | 'cancelled';
export type SessionStatus = 'active' | 'completed' | 'cancelled';

// ─── Individual Payment (QR) ──────────────────────────────────────
export interface Payment {
  id: string;         // e.g. QR-A72K
  amount: number;
  upiUri: string;
  status: PaymentStatus;
  confirmedAt?: number;
}

// ─── Payment Session ──────────────────────────────────────────────
export interface PaymentSession {
  id: string;         // e.g. #A81F
  merchantId: string;
  totalAmount: number;
  payments: Payment[];
  status: SessionStatus;
  createdAt: number;
  completedAt?: number;
}

// ─── Split Strategy ───────────────────────────────────────────────
export type SplitMode = 'auto' | 'equal' | 'custom';

export interface SplitResult {
  amounts: number[];
  mode: SplitMode;
}

// ─── App Settings ─────────────────────────────────────────────────
export interface AppSettings {
  splitThreshold: number;   // default 2000
  activeProfileId?: string;
}
