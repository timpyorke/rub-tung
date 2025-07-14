'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { generatePayload, formatDisplayTarget, getTargetType } from '@/lib/promptpay';
import styles from './PromptPayGenerator.module.css';

export default function PromptPayGenerator() {
  const [target, setTarget] = useState('');
  const [amount, setAmount] = useState('');
  const [qrDataURL, setQrDataURL] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [payload, setPayload] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setQrDataURL('');

    try {
      const amountNum = amount ? parseFloat(amount) : undefined;
      const generatedPayload = generatePayload(target, { amount: amountNum });
      setPayload(generatedPayload);

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(generatedPayload, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrDataURL(qrDataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (qrDataURL) {
      const link = document.createElement('a');
      link.download = 'promptpay-qr-code.png';
      link.href = qrDataURL;
      link.click();
    }
  };

  const formatTargetInput = (value: string) => {
    const clean = value.replace(/[^0-9]/g, '');
    if (clean.length === 10 && clean.startsWith('0')) {
      return clean.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (clean.length === 13) {
      return clean.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5');
    }
    return clean;
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>₿</div>
      <h1 className={styles.title}>PromptPay QR Generator</h1>
      <p className={styles.subtitle}>Generate QR codes for Thai PromptPay payments</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="target" className={styles.label}>
            Phone Number / Tax ID / E-wallet ID
          </label>
          <input
            type="text"
            id="target"
            value={target}
            onChange={(e) => setTarget(formatTargetInput(e.target.value))}
            placeholder="0812345678"
            required
            className={styles.input}
          />
          <div className={styles.exampleText}>
            Examples: 0812345678, 1234567890123, or e-wallet ID
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="amount" className={styles.label}>
            Amount (Optional)
          </label>
          <div className={styles.currencyInput}>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={styles.input}
            />
          </div>
          <div className={styles.exampleText}>
            Leave empty for flexible amount
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={styles.button}
        >
          {isLoading ? 'Generating...' : 'Generate QR Code'}
        </button>
      </form>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {qrDataURL && (
        <div className={styles.qrContainer}>
          <h3>Your PromptPay QR Code</h3>
          <div className={styles.qrcode}>
            <img src={qrDataURL} alt="PromptPay QR Code" />
          </div>
          <div className={styles.qrInfo}>
            <strong>Payment to:</strong> {formatDisplayTarget(target)}<br />
            <strong>Amount:</strong> {amount ? `฿${parseFloat(amount).toFixed(2)}` : 'Flexible amount'}<br />
            <strong>Type:</strong> {getTargetType(target)}<br />
            <strong>Payload:</strong> <span className={styles.payloadText}>{payload}</span>
          </div>
          <button onClick={handleDownload} className={styles.downloadBtn}>
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
}
