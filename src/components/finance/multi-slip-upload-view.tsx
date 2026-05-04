"use client"
import { useState, useRef } from "react";
import { Wallet, Category } from "@/types";
import { uploadSlipAndCreateTransaction } from "@/lib/actions/finance";
import { CustomSelect } from "@/components/ui/custom-select";
import { Upload, X, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onCancel: () => void;
  wallets: Wallet[];
  categories: Category[];
  onSuccess?: () => void;
}

export function MultiSlipUploadView({ onCancel, wallets, categories, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [walletId, setWalletId] = useState(wallets[0]?.id || "");
  const expenseCategories = categories.filter(c => c.type === "expense");
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [results, setResults] = useState<{file: File; success: boolean; amount?: number; error?: string}[]>([]);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(0);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startUpload = async () => {
    if (files.length === 0) return;
    setStep(2);
    setResults([]);
    setCurrentProcessingIndex(0);

    const newResults: any[] = [];
    for (let i = 0; i < files.length; i++) {
      setCurrentProcessingIndex(i);
      const file = files[i];
      const formData = new FormData();
      formData.append("slip", file);
      if (walletId) formData.append("walletId", walletId);
      if (categoryId) formData.append("categoryId", categoryId);

      const res = await uploadSlipAndCreateTransaction(formData);
      newResults.push({
        file,
        success: res.success,
        amount: res.transaction?.amount,
        error: res.error
      });
      setResults([...newResults]);
    }
    
    setStep(3);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-secondary/80">
             <ArrowLeft size={16} />
          </div>
          <span className="font-bold text-sm">Back to Manual Entry</span>
        </button>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black tracking-tight mb-2">Automated Batch Scanner</h2>
        <p className="text-muted-foreground font-medium">Upload multiple slips, AI will sort them out.</p>
      </div>

      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-10 relative px-4">
        <div className="absolute left-4 right-4 top-1/2 h-1.5 bg-secondary -z-10 -translate-y-1/2 rounded-full"></div>
        <div className="absolute left-4 top-1/2 h-1.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500 rounded-full" style={{ width: `calc((100% - 2rem) * ${(step - 1) / 2})` }}></div>
        
        {[1, 2, 3].map(s => (
          <div key={s} className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500", step >= s ? "bg-primary text-primary-foreground shadow-xl shadow-primary/30 scale-110" : "bg-card border-none text-muted-foreground ring-4 ring-secondary")}>
            {s}
          </div>
        ))}
      </div>

      {/* Step 1: Selection */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-5 rounded-2xl border border-border/50">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Default Wallet</label>
              <CustomSelect
                value={walletId}
                onChange={setWalletId}
                options={wallets.map(w => ({ id: w.id, label: w.name }))}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Default Category</label>
              <CustomSelect
                value={categoryId}
                onChange={setCategoryId}
                options={expenseCategories.map(c => ({ id: c.id, label: c.name, icon: <span className="w-3 h-3 rounded-full" style={{backgroundColor: c.color}}></span> }))}
              />
            </div>
          </div>

          <div className="border-2 border-dashed border-primary/30 rounded-2xl p-10 flex flex-col items-center justify-center bg-primary/5 hover:border-primary/60 hover:bg-primary/10 transition-all cursor-pointer group shadow-sm" onClick={() => fileInputRef.current?.click()}>
            <div className="w-16 h-16 bg-background rounded-full shadow-md flex items-center justify-center mb-5 group-hover:-translate-y-2 group-hover:shadow-lg transition-all">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <p className="font-bold text-xl text-primary mb-1">Click to Select Slips</p>
            <p className="text-sm text-primary/70 font-medium">Select or drag & drop multiple images</p>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
          </div>

          {files.length > 0 && (
            <div className="mt-6 bg-secondary/10 p-5 rounded-2xl border border-border/50">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-base font-bold">Selected Files</h4>
                 <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-bold shadow-sm">{files.length} Slips</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                {files.map((f, i) => (
                  <div key={i} className="relative group aspect-[3/4] rounded-xl overflow-hidden border border-border shadow-sm">
                    <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <button onClick={() => removeFile(i)} className="absolute top-1.5 right-1.5 bg-red-500/90 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-red-600 backdrop-blur-sm"><X size={14}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={startUpload} disabled={files.length === 0} className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-lg rounded-2xl mt-6 disabled:opacity-50 transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 hover:from-primary hover:to-primary">
            Start Processing Batch
          </button>
        </div>
      )}

      {/* Step 2: Processing */}
      {step === 2 && (
        <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95">
          <div className="relative mb-10">
             <div className="w-32 h-32 border-[6px] border-secondary/50 rounded-full"></div>
             <div className="absolute top-0 left-0 w-32 h-32 border-[6px] border-primary rounded-full border-t-transparent animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-extrabold text-3xl">{Math.round((currentProcessingIndex / files.length) * 100)}%</span>
             </div>
          </div>
          
          <h3 className="text-3xl font-black mb-3 text-center">Reading AI Data...</h3>
          <p className="text-muted-foreground mb-10 font-bold text-lg bg-secondary/50 px-6 py-2 rounded-full">Processing {currentProcessingIndex + 1} of {files.length}</p>
          
          <div className="w-full max-w-sm bg-secondary rounded-full h-3 overflow-hidden shadow-inner">
             <div className="bg-primary h-full transition-all duration-300 rounded-full" style={{ width: `${(currentProcessingIndex / files.length) * 100}%` }}></div>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 3 && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="text-center pt-8">
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-[12px] ring-emerald-50 dark:ring-emerald-900/10 shadow-lg">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-3xl font-black">Scanning Complete!</h3>
            <p className="text-muted-foreground mt-3 font-medium text-lg">Successfully processed your batch of {files.length} slips.</p>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-3 custom-scrollbar pr-2 mt-8">
            {results.map((r, i) => (
              <div key={i} className={cn("p-4 rounded-2xl border flex items-center gap-4 transition-all hover:scale-[1.02] shadow-sm", r.success ? "border-emerald-200/50 bg-emerald-50/70 dark:bg-emerald-900/20" : "border-rose-200/50 bg-rose-50/70 dark:bg-rose-900/20")}>
                <img src={URL.createObjectURL(r.file)} className="w-14 h-20 object-cover rounded-xl shadow-md border border-white/20" alt="slip" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base truncate text-foreground">{r.file.name}</p>
                  {r.success ? (
                     <p className="text-base text-emerald-600 font-black mt-1">+ ฿{r.amount?.toLocaleString()}</p>
                  ) : (
                     <p className="text-sm text-rose-500 font-bold truncate mt-1">{r.error || "Failed"}</p>
                  )}
                </div>
                <div className="shrink-0 mr-3">
                   {r.success ? <CheckCircle2 className="text-emerald-500" size={32}/> : <AlertCircle className="text-rose-500" size={32}/>}
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => { onCancel(); if (onSuccess) onSuccess(); }} className="w-full py-4 bg-secondary text-foreground font-bold text-lg rounded-2xl hover:bg-secondary/80 mt-8 transition-colors border border-border shadow-sm">
            Done & Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
