'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { generatePayload, getTargetType } from '@/lib/promptpay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Footer } from '@/components/footer';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { PWAUpdatePrompt } from '@/components/pwa-update-prompt';
import { OfflineIndicator } from '@/components/offline-indicator';
import { Download, QrCode, Smartphone, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { useSafeTranslation } from '@/components/safe-translation';

export default function PromptPayGenerator() {
  const { t } = useSafeTranslation();
  const [target, setTarget] = useState('');
  const [displayTarget, setDisplayTarget] = useState('');
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

  const handleTargetChange = (value: string) => {
    const clean = value.replace(/[^0-9]/g, '');
    setTarget(clean);

    // Format for display
    if (clean.length === 10 && clean.startsWith('0')) {
      setDisplayTarget(clean.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'));
    } else if (clean.length === 13) {
      setDisplayTarget(clean.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5'));
    } else {
      setDisplayTarget(clean);
    }
  };

  const getTranslatedTargetType = (target: string): string => {
    const targetType = getTargetType(target);
    switch (targetType) {
      case 'phone':
        return t('paymentTypes.phone');
      case 'tax':
        return t('paymentTypes.taxId');
      case 'ewallet':
        return t('paymentTypes.ewallet');
      default:
        return t('paymentTypes.phone');
    }
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case t('paymentTypes.phone'):
        return <Smartphone className="h-4 w-4" />;
      case t('paymentTypes.taxId'):
        return <CreditCard className="h-4 w-4" />;
      case t('paymentTypes.ewallet'):
        return <Wallet className="h-4 w-4" />;
      default:
        return <QrCode className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-2xl bg-primary/5">
            <QrCode className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-foreground">
          {t('app.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {t('app.description')}
        </p>

        <div className="absolute top-4 right-4 flex gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="target" className="block text-sm font-medium text-foreground">
                {t('form.targetLabel')}
              </Label>
              <div className="mt-1">
                <Input
                  type="tel"
                  id="target"
                  value={displayTarget}
                  onChange={(e) => handleTargetChange(e.target.value)}
                  placeholder={t('form.targetPlaceholder')}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="amount" className="block text-sm font-medium text-foreground">
                {t('form.amountLabel')}
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground sm:text-sm">
                    {t('currency.symbol')}
                  </span>
                </div>
                <Input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="block w-full pl-7 pr-12 border-input rounded-md focus:ring-primary focus:border-primary sm:text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground sm:text-sm">
                    THB
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isLoading ? t('form.generating') : t('form.generateButton')}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-md bg-destructive/10">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {qrDataURL && (
            <div className="mt-8 pt-8 border-t border-border/50">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
                  <img
                    src={qrDataURL}
                    alt="PromptPay QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>

                <div className="text-center w-full space-y-2 mb-6">
                  <p className="text-sm font-medium text-foreground">{displayTarget}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {amount ? `${parseFloat(amount).toFixed(2)} THB` : t('qrCode.flexibleAmount')}
                  </p>
                  <Badge variant="outline" className="mt-2 font-normal text-muted-foreground border-border/50">
                    {getTranslatedTargetType(target)}
                  </Badge>
                </div>

                <div className="w-full bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/50 rounded-lg p-3 mb-6">
                  <p className="text-xs text-yellow-700 dark:text-yellow-500 text-center">
                    {t('qrCode.disclaimer')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => { setQrDataURL(''); setPayload(''); }}
                    className="w-full"
                  >
                    {t('form.newQRCode')}
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t('qrCode.downloadButton')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 text-center">
        <Footer />
      </div>
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      <OfflineIndicator />
    </div>
  );
}
