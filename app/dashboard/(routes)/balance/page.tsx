"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Wallet, Plus, History, ArrowUpRight, MessageCircle, Copy, Check } from "lucide-react";
import { useLanguage } from "@/components/providers/rtl-provider";

interface BalanceTransaction {
  id: string;
  amount: number;
  type: "DEPOSIT" | "PURCHASE";
  description: string;
  createdAt: string;
}

export default function BalancePage() {
  const { data: session } = useSession();
  const { locale } = useLanguage();
  const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [copiedVodafone, setCopiedVodafone] = useState(false);

  // Check if user is a student (USER role)
  const isStudent = session?.user?.role === "USER";
  
  const vodafoneCashNumber = "01025729944";
  const whatsappLink = `https://wa.me/201559973722`;

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/user/balance");
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/balance/transactions");
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleAddBalance = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(tr("يرجى إدخال مبلغ صحيح", "Please enter a valid amount"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/balance/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.newBalance);
        setAmount("");
        toast.success(tr("تم إضافة الرصيد بنجاح", "Balance added successfully"));
        fetchTransactions(); // Refresh transactions
      } else {
        const error = await response.text();
        toast.error(error || tr("حدث خطأ أثناء إضافة الرصيد", "An error occurred while adding balance"));
      }
    } catch (error) {
      console.error("Error adding balance:", error);
      toast.error(tr("حدث خطأ أثناء إضافة الرصيد", "An error occurred while adding balance"));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = (text: string, setCopiedState: (value: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    toast.success(tr("تم نسخ الرقم", "Number copied"));
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tr("إدارة الرصيد", "Balance management")}</h1>
          <p className="text-muted-foreground">
            {isStudent 
              ? tr("عرض رصيد حسابك وسجل المعاملات", "View your account balance and transaction history") 
              : tr("أضف رصيد إلى حسابك لشراء الكورسات", "Add balance to your account to purchase courses")
            }
          </p>
        </div>
      </div>

      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {tr("رصيد الحساب", "Account balance")}
          </CardTitle>
          <CardDescription>
            {tr("الرصيد المتاح في حسابك", "Available balance in your account")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-brand">
            {balance.toFixed(2)} {tr("جنيه", "EGP")}
          </div>
        </CardContent>
      </Card>

      {/* Add Balance Section - Only for non-students */}
      {!isStudent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {tr("إضافة رصيد", "Add balance")}
            </CardTitle>
            <CardDescription>
              {tr("أضف مبلغ إلى رصيد حسابك", "Add an amount to your account balance")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="number"
                placeholder={tr("أدخل المبلغ", "Enter amount")}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                className="flex-1"
              />
              <Button 
                onClick={handleAddBalance}
                disabled={isLoading}
                className="bg-brand hover:bg-brand/90"
              >
                {isLoading ? tr("جاري الإضافة...", "Adding...") : tr("إضافة الرصيد", "Add balance")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Deposit Section - Only for students */}
      {isStudent && (
        <Card className="border-brand/20 bg-brand/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-brand" />
              {tr("إضافة رصيد عبر فودافون كاش", "Add balance via Vodafone Cash")}
            </CardTitle>
            <CardDescription>
              {tr("قم بتحويل المبلغ إلى أحد الأرقام التالية ثم أرسل صورة الإيصال", "Transfer the amount to the following number then send a receipt screenshot")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vodafone Cash */}
            <div className="bg-card rounded-lg p-4 border-2 border-brand/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{tr("رقم فودافون كاش", "Vodafone Cash number")}</p>
                  <p className="text-2xl font-bold text-brand">{vodafoneCashNumber}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(vodafoneCashNumber, setCopiedVodafone)}
                  className="h-10 w-10"
                >
                  {copiedVodafone ? (
                    <Check className="h-4 w-4 text-brand" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-sm">{tr("خطوات الإيداع:", "Deposit steps:")}</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>{tr("قم بتحويل المبلغ المطلوب إلى رقم فودافون كاش أعلاه", "Transfer the required amount to the Vodafone Cash number above")}</li>
                <li>{tr("احفظ صورة إيصال التحويل من التطبيق", "Save a screenshot of the transfer receipt from the app")}</li>
                <li>{tr("اضغط على زر \"إرسال صورة الإيصال\" أدناه", "Click the \"Send receipt image\" button below")}</li>
                <li>{tr("سيتم مراجعة طلبك وإضافة الرصيد إلى حسابك خلال 24 ساعة", "Your request will be reviewed and balance will be added within 24 hours")}</li>
              </ol>
            </div>

            <Button
              asChild
              className="w-full bg-brand hover:bg-brand/90 text-white"
              size="lg"
            >
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
                {tr("إرسال صورة الإيصال على واتساب", "Send receipt image on WhatsApp")}
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {tr("سجل المعاملات", "Transaction history")}
          </CardTitle>
          <CardDescription>
            {tr("تاريخ جميع المعاملات المالية", "History of all financial transactions")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
              <p className="mt-2 text-muted-foreground">{tr("جاري التحميل...", "Loading...")}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{tr("لا توجد معاملات حتى الآن", "No transactions yet")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === "DEPOSIT" 
                        ? "bg-green-100 text-green-600" 
                        : "bg-red-100 text-red-600"
                    }`}>
                      {transaction.type === "DEPOSIT" ? (
                        <Plus className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                                         <div>
                       <p className="font-medium">
                         {transaction.description.includes("Added") && transaction.type === "DEPOSIT" 
                          ? (locale === "ar"
                            ? transaction.description.replace(/Added (\d+(?:\.\d+)?) EGP to balance/, "تم إضافة $1 جنيه إلى الرصيد")
                            : transaction.description)
                           : transaction.description.includes("Purchased course:") && transaction.type === "PURCHASE"
                          ? (locale === "ar"
                            ? transaction.description.replace(/Purchased course: (.+)/, "تم شراء الكورس: $1")
                            : transaction.description)
                           : transaction.description
                         }
                       </p>
                       <p className="text-sm text-muted-foreground">
                         {formatDate(transaction.createdAt)}
                       </p>
                       <p className="text-xs text-muted-foreground">
                         {transaction.type === "DEPOSIT" ? tr("إيداع", "Deposit") : tr("شراء كورس", "Course purchase")}
                       </p>
                     </div>
                  </div>
                  <div className={`font-bold ${
                    transaction.type === "DEPOSIT" ? "text-green-600" : "text-red-600"
                  }`}>
                    {transaction.type === "DEPOSIT" ? "+" : "-"}
                    {Math.abs(transaction.amount).toFixed(2)} {tr("جنيه", "EGP")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 