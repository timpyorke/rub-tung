/**
 * PromptPay QR Code Generator
 * 
 * This module implements the EMV QR Code specification for Thai PromptPay payments.
 * It generates QR code payloads for phone numbers, tax IDs, and e-wallet IDs.
 * 
 * @see https://www.emvco.com/emv-technologies/qrcodes/
 * @see https://www.bot.or.th/en/our-roles/payment-systems/promptpay.html
 */

// ================================
// Type Definitions
// ================================

export type TargetType = 'phone' | 'tax' | 'ewallet';
export type MerchantIdType = '01' | '02' | '03';

export interface PromptPayOptions {
  amount?: number;
}

export interface PromptPayTarget {
  value: string;
  type: TargetType;
  formatted: string;
}

// ================================
// Constants - EMV QR Code Fields
// ================================

const EMV_FIELDS = {
  PAYLOAD_FORMAT: '00',
  POI_METHOD: '01',
  MERCHANT_INFORMATION_BOT: '29',
  TRANSACTION_CURRENCY: '53',
  TRANSACTION_AMOUNT: '54',
  COUNTRY_CODE: '58',
  CRC: '63',
} as const;

const EMV_VALUES = {
  PAYLOAD_FORMAT_EMV_QRCPS: '01',
  POI_METHOD_STATIC: '11',
  POI_METHOD_DYNAMIC: '12',
  MERCHANT_TEMPLATE_ID_GUID: '00',
  TRANSACTION_CURRENCY_THB: '764',
  COUNTRY_CODE_TH: 'TH',
} as const;

// ================================
// Constants - PromptPay Specific
// ================================

const PROMPTPAY = {
  GUID: 'A000000677010111',
  MERCHANT_ID: {
    PHONE: '01' as MerchantIdType,
    TAX_ID: '02' as MerchantIdType,
    EWALLET: '03' as MerchantIdType,
  },
  TARGET_LENGTH: {
    PHONE: 10,
    TAX_ID: 13,
    EWALLET_MIN: 15,
  },
} as const;

// ================================
// Utility Functions
// ================================

/**
 * Removes all non-numeric characters from input
 */
function sanitizeTarget(id: string): string {
  return id.replace(/[^0-9]/g, '');
}

/**
 * Formats target ID according to PromptPay specification
 * - Phone numbers: Convert to 13-digit format with country code
 * - Tax IDs and e-wallet IDs: Use as-is if already 13+ digits
 */
function formatTarget(id: string): string {
  const numbers = sanitizeTarget(id);
  
  // If already 13+ digits, use as-is
  if (numbers.length >= PROMPTPAY.TARGET_LENGTH.TAX_ID) {
    return numbers;
  }
  
  // Convert phone number to 13-digit format with country code
  const phoneWithCountryCode = numbers.replace(/^0/, '66');
  return phoneWithCountryCode.padStart(PROMPTPAY.TARGET_LENGTH.TAX_ID, '0');
}

/**
 * Formats amount to 2 decimal places
 */
function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Formats CRC value to 4-digit uppercase hex string
 */
function formatCrc(crcValue: number): string {
  return crcValue.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Creates EMV QR code field with ID, length, and value
 */
function createField(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

/**
 * Serializes array of field values, filtering out falsy values
 */
function serialize(fields: (string | false | null | undefined | 0)[]): string {
  return fields.filter(Boolean).join('');
}

// ================================
// CRC Implementation
// ================================

/**
 * CRC-16-XMODEM implementation for EMV QR Code checksum
 * Uses polynomial 0x1021 with initial value 0xFFFF
 */
function calculateCrc16(data: string, initial: number = 0xFFFF): number {
  let crc = initial;
  
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
    }
  }
  
  return crc;
}

// ================================
// Target Type Detection
// ================================

/**
 * Determines target type based on sanitized input length
 */
export function getTargetType(target: string): TargetType {
  const clean = sanitizeTarget(target);
  
  if (clean.length >= PROMPTPAY.TARGET_LENGTH.EWALLET_MIN) {
    return 'ewallet';
  }
  
  if (clean.length >= PROMPTPAY.TARGET_LENGTH.TAX_ID) {
    return 'tax';
  }
  
  return 'phone';
}

/**
 * Gets merchant ID type based on target length
 */
function getMerchantIdType(target: string): MerchantIdType {
  const targetType = getTargetType(target);
  
  switch (targetType) {
    case 'ewallet':
      return PROMPTPAY.MERCHANT_ID.EWALLET;
    case 'tax':
      return PROMPTPAY.MERCHANT_ID.TAX_ID;
    case 'phone':
    default:
      return PROMPTPAY.MERCHANT_ID.PHONE;
  }
}

// ================================
// Display Formatting
// ================================

/**
 * Formats target for display with appropriate separators
 */
export function formatDisplayTarget(target: string): string {
  const clean = sanitizeTarget(target);
  
  // Phone number format: 081-234-5678
  if (clean.length === PROMPTPAY.TARGET_LENGTH.PHONE && clean.startsWith('0')) {
    return clean.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  // Tax ID format: 1-2345-67890-12-3
  if (clean.length === PROMPTPAY.TARGET_LENGTH.TAX_ID) {
    return clean.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5');
  }
  
  // E-wallet ID: return as-is
  return clean;
}

// ================================
// Main Payload Generation
// ================================

/**
 * Validates target input
 */
function validateTarget(target: string): void {
  const clean = sanitizeTarget(target);
  
  if (!clean) {
    throw new Error('Please provide a valid phone number, tax ID, or e-wallet ID');
  }
  
  if (clean.length < PROMPTPAY.TARGET_LENGTH.PHONE) {
    throw new Error('Target must be at least 10 digits');
  }
}

/**
 * Validates amount input
 */
function validateAmount(amount?: number): void {
  if (amount !== undefined) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    
    if (amount > 1000000) {
      throw new Error('Amount cannot exceed 1,000,000 THB');
    }
  }
}

/**
 * Generates PromptPay QR code payload according to EMV specification
 */
export function generatePayload(target: string, options: PromptPayOptions = {}): string {
  // Validate inputs
  validateTarget(target);
  validateAmount(options.amount);
  
  const sanitizedTarget = sanitizeTarget(target);
  const { amount } = options;
  
  // Determine merchant ID type based on target
  const merchantIdType = getMerchantIdType(sanitizedTarget);
  
  // Build EMV QR code fields
  const fields = [
    // Required fields
    createField(EMV_FIELDS.PAYLOAD_FORMAT, EMV_VALUES.PAYLOAD_FORMAT_EMV_QRCPS),
    createField(EMV_FIELDS.POI_METHOD, amount ? EMV_VALUES.POI_METHOD_DYNAMIC : EMV_VALUES.POI_METHOD_STATIC),
    
    // Merchant information (PromptPay specific)
    createField(EMV_FIELDS.MERCHANT_INFORMATION_BOT, serialize([
      createField(EMV_VALUES.MERCHANT_TEMPLATE_ID_GUID, PROMPTPAY.GUID),
      createField(merchantIdType, formatTarget(sanitizedTarget)),
    ])),
    
    // Transaction details
    createField(EMV_FIELDS.COUNTRY_CODE, EMV_VALUES.COUNTRY_CODE_TH),
    createField(EMV_FIELDS.TRANSACTION_CURRENCY, EMV_VALUES.TRANSACTION_CURRENCY_THB),
    
    // Optional amount field
    amount && createField(EMV_FIELDS.TRANSACTION_AMOUNT, formatAmount(amount)),
  ];
  
  // Calculate CRC
  const dataForCrc = serialize(fields) + EMV_FIELDS.CRC + '04';
  const crcValue = calculateCrc16(dataForCrc);
  
  // Add CRC field
  fields.push(createField(EMV_FIELDS.CRC, formatCrc(crcValue)));
  
  return serialize(fields);
}

// ================================
// Exports
// ================================

export {
  sanitizeTarget,
  formatTarget,
  formatAmount,
  getMerchantIdType,
  validateTarget,
  validateAmount,
};