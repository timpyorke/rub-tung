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
import { Download, QrCode, Smartphone, CreditCard, Wallet, AlertCircle } from 'lucide-react';

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

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'Phone Number':
        return <Smartphone className="h-4 w-4" />;
      case 'Tax ID':
        return <CreditCard className="h-4 w-4" />;
      case 'E-wallet ID':
        return <Wallet className="h-4 w-4" />;
      default:
        return <QrCode className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 mr-3">
              <QrCode className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Rub Tung
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Generate QR codes for Thai PromptPay payments
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Enter the recipient information and amount
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target" className="text-sm font-medium">
                    Phone Number / Tax ID / E-wallet ID
                  </Label>
                  <Input
                    type="text"
                    id="target"
                    value={target}
                    onChange={(e) => setTarget(formatTargetInput(e.target.value))}
                    placeholder="0812345678"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Examples: 0812345678, 1234567890123, or e-wallet ID
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Amount (Optional)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      ฿
                    </span>
                    <Input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full pl-8"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave empty for flexible amount
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
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate QR Code
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
                Generated QR Code
              </CardTitle>
              <CardDescription>
                Your PromptPay QR code will appear here
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {qrDataURL ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-lg shadow-sm border">
                      <img 
                        src={qrDataURL} 
                        alt="PromptPay QR Code" 
                        className="max-w-full h-auto"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Payment to:</span>
                      <span className="text-sm">{formatDisplayTarget(target)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Amount:</span>
                      <span className="text-sm">
                        {amount ? `฿${parseFloat(amount).toFixed(2)}` : 'Flexible amount'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Type:</span>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getTargetIcon(getTargetType(target))}
                        {getTargetType(target)}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Payload:</span>
                      <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                        {payload}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleDownload} 
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Enter payment details and click "Generate QR Code"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
