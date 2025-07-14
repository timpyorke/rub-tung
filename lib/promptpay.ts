// Types for better type safety
type TargetType = 'phone' | 'tax' | 'ewallet';
type MerchantIdType = '01' | '02' | '03';
type HexString = string;
type CrcValue = number;

// PromptPay field identifiers
const ID_PAYLOAD_FORMAT = '00' as const;
const ID_POI_METHOD = '01' as const;
const ID_MERCHANT_INFORMATION_BOT = '29' as const;
const ID_TRANSACTION_CURRENCY = '53' as const;
const ID_TRANSACTION_AMOUNT = '54' as const;
const ID_COUNTRY_CODE = '58' as const;
const ID_CRC = '63' as const;

// PromptPay values
const PAYLOAD_FORMAT_EMV_QRCPS_MERCHANT_PRESENTED_MODE = '01' as const;
const POI_METHOD_STATIC = '11' as const;
const POI_METHOD_DYNAMIC = '12' as const;
const MERCHANT_INFORMATION_TEMPLATE_ID_GUID = '00' as const;
const BOT_ID_MERCHANT_PHONE_NUMBER: MerchantIdType = '01';
const BOT_ID_MERCHANT_TAX_ID: MerchantIdType = '02';
const BOT_ID_MERCHANT_EWALLET_ID: MerchantIdType = '03';
const GUID_PROMPTPAY = 'A000000677010111' as const;
const TRANSACTION_CURRENCY_THB = '764' as const;
const COUNTRY_CODE_TH = 'TH' as const;

// CRC-16-XMODEM implementation
function crc16xmodem(data: string, initial: CrcValue = 0xFFFF): CrcValue {
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


function sanitizeTarget(id: string): string {
  return id.replace(/[^0-9]/g, '');
}

function formatTarget(id: string): string {
  const numbers = sanitizeTarget(id);
  if (numbers.length >= 13) return numbers;
  return ('0000000000000' + numbers.replace(/^0/, '66')).slice(-13);
}

function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

function formatCrc(crcValue: CrcValue): HexString {
  return ('0000' + crcValue.toString(16).toUpperCase()).slice(-4);
}

function f(id: string, value: string): string {
  return [id, ('00' + value.length).slice(-2), value].join('');
}

function serialize(xs: (string | false | null | undefined | 0)[]): string {
  return xs.filter(x => x).join('');
}

export interface PromptPayOptions {
  amount?: number;
}

export interface PromptPayTarget {
  value: string;
  type: TargetType;
  formatted: string;
}

export function generatePayload(target: string, options: PromptPayOptions = {}): string {
  target = sanitizeTarget(target);

  if (!target) {
    throw new Error('Please provide a valid phone number, tax ID, or e-wallet ID');
  }

  const amount = options.amount;
  const targetType: MerchantIdType = target.length >= 15 ? BOT_ID_MERCHANT_EWALLET_ID :
    target.length >= 13 ? BOT_ID_MERCHANT_TAX_ID :
      BOT_ID_MERCHANT_PHONE_NUMBER;

  const data = [
    f(ID_PAYLOAD_FORMAT, PAYLOAD_FORMAT_EMV_QRCPS_MERCHANT_PRESENTED_MODE),
    f(ID_POI_METHOD, amount ? POI_METHOD_DYNAMIC : POI_METHOD_STATIC),
    f(ID_MERCHANT_INFORMATION_BOT, serialize([
      f(MERCHANT_INFORMATION_TEMPLATE_ID_GUID, GUID_PROMPTPAY),
      f(targetType, formatTarget(target))
    ])),
    f(ID_COUNTRY_CODE, COUNTRY_CODE_TH),
    f(ID_TRANSACTION_CURRENCY, TRANSACTION_CURRENCY_THB),
    amount && f(ID_TRANSACTION_AMOUNT, formatAmount(amount))
  ];

  const dataToCrc = serialize(data) + ID_CRC + '04';
  data.push(f(ID_CRC, formatCrc(crc16xmodem(dataToCrc, 0xffff))));
  return serialize(data);
}

export function formatDisplayTarget(target: string): string {
  const clean = sanitizeTarget(target);
  if (clean.length === 10 && clean.startsWith('0')) {
    return clean.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  } else if (clean.length === 13) {
    return clean.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5');
  }
  return clean;
}

export function getTargetType(target: string): TargetType {
  const clean = sanitizeTarget(target);
  if (clean.length >= 15) return 'ewallet';
  if (clean.length >= 13) return 'tax';
  return 'phone';
}
