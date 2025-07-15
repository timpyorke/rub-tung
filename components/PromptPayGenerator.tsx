'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { generatePayload, formatDisplayTarget, getTargetType } from '@/lib/promptpay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex justify-end gap-2 mb-4">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 mr-3">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                {t('app.title')}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              {t('app.description')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
          <Card className={`md:col-span-1 ${qrDataURL ? 'hidden md:block' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {t('form.paymentDetails')}
              </CardTitle>
              <CardDescription>
                {t('form.paymentDetailsDescription')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target" className="text-sm font-medium">
                    {t('form.targetLabel')}
                  </Label>
                  <Input
                    type="text"
                    id="target"
                    value={target}
                    onChange={(e) => setTarget(formatTargetInput(e.target.value))}
                    placeholder={t('form.targetPlaceholder')}
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('form.targetExample')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    {t('form.amountLabel')}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      {t('currency.symbol')}
                    </span>
                    <Input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={t('form.amountPlaceholder')}
                      step="0.01"
                      min="0"
                      className="w-full pl-8"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('form.amountExample')}
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('form.generating')}
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      {t('form.generateButton')}
                    </>
                  )}
                </Button>
              </form>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                {t('qrCode.title')}
              </CardTitle>
              <CardDescription>
                {t('qrCode.description')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {qrDataURL ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border">
                      <img 
                        src={qrDataURL} 
                        alt="PromptPay QR Code" 
                        className="max-w-full h-auto"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('qrCode.paymentTo')}</span>
                      <span className="text-sm">{formatDisplayTarget(target)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('qrCode.amount')}</span>
                      <span className="text-sm">
                        {amount ? `${t('currency.symbol')}${parseFloat(amount).toFixed(2)}` : t('qrCode.flexibleAmount')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('qrCode.type')}</span>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getTargetIcon(getTranslatedTargetType(target))}
                        {getTranslatedTargetType(target)}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <span className="text-sm font-medium">{t('qrCode.payload')}</span>
                      <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                        {payload}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={handleDownload} 
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('qrCode.downloadButton')}
                    </Button>
                    <Button 
                      onClick={() => { setQrDataURL(''); setPayload(''); setError(''); }}
                      variant="ghost"
                      className="flex-1 md:hidden"
                      size="lg"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      {t('form.newQRCode')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {t('qrCode.emptyState')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
      <Footer />
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      <OfflineIndicator />
    </div>
  );
}
