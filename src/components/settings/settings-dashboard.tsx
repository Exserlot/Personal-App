"use client";

import { useState, useRef } from "react";
import { User } from "next-auth";
import { UserSettings, Wallet } from "@/types";
import { updateSettings, updateProfile, uploadProfileImage } from "@/lib/actions/settings";
import { Settings as SettingsIcon, User as UserIcon, Palette, CreditCard, Loader2, Image as ImageIcon, Camera, Upload } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface SettingsDashboardProps {
  user: User;
  settings: UserSettings;
  wallets: Wallet[];
}

export function SettingsDashboard({ user, settings, wallets }: SettingsDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState(settings.currency);
  const [defaultWalletId, setDefaultWalletId] = useState(settings.defaultWalletId || "");
  const [name, setName] = useState(user.name || "");
  const [image, setImage] = useState(user.image || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    setLoading(true);
    await Promise.all([
       updateSettings(settings.userId, {
         currency,
         defaultWalletId: defaultWalletId || undefined
       }),
       updateProfile(user.id as string, name, image)
    ]);
    setLoading(false);
  }

  const hasChanges = 
    currency !== settings.currency || 
    defaultWalletId !== (settings.defaultWalletId || "") ||
    name !== (user.name || "") ||
    image !== (user.image || "");

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    const result = await uploadProfileImage(formData);
    if (result.success && result.path) {
      setImage(result.path);
    } else {
      alert("Failed to upload image. Please try again.");
    }
    setUploadingImage(false);
  };

  return (
    <div className="space-y-8 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="text-primary" />
            Settings
          </h2>
          <p className="text-muted-foreground">Manage your account and application preferences.</p>
        </div>
      </div>

      <div className="grid gap-6">
        
        {/* Profile Card */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
           <div className="border-b border-border bg-secondary/30 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                 <UserIcon size={18} className="text-primary" />
                 Profile Information
              </h3>
           </div>
           <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                 <div className="flex flex-col items-center gap-3">
                    <input 
                       type="file" 
                       accept="image/*" 
                       className="hidden" 
                       ref={fileInputRef} 
                       onChange={handleFileUpload} 
                    />
                    <button 
                       onClick={handleImageClick}
                       title="Change Profile Image"
                       disabled={uploadingImage}
                       className="group relative h-24 w-24 rounded-full bg-primary/10 flex flex-col items-center justify-center overflow-hidden border-4 border-primary/20 shadow-inner transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {image ? (
                           <img src={image} alt="Profile" className="h-full w-full object-cover group-hover:opacity-50 transition-opacity" />
                       ) : (
                           <UserIcon className="h-10 w-10 text-primary/50 group-hover:opacity-20 transition-opacity" />
                       )}
                       
                       {/* Hover Overlay */}
                       <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                         {uploadingImage ? <Loader2 className="text-white animate-spin" size={24} /> : <Camera className="text-white" size={24} />}
                       </div>
                    </button>
                    <span className="text-xs text-muted-foreground">
                       {uploadingImage ? "Uploading..." : "Click to upload"}
                    </span>
                 </div>
                 <div className="flex-1 space-y-4">
                    <div>
                       <label className="block text-sm font-medium mb-1 px-1">Display Name</label>
                       <input 
                         type="text" 
                         value={name} 
                         onChange={e => setName(e.target.value)} 
                         className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                         placeholder="Enter your name"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium mb-1 px-1">Login Provider</label>
                       <div className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-2.5 text-sm font-medium text-muted-foreground flex items-center gap-2 cursor-not-allowed">
                          {user.email ? "Google Account" : "Credentials (Username/Password)"}
                          <span className="text-xs font-normal opacity-70">({user.email || user.username})</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>



        {/* Preferences Card */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
           <div className="border-b border-border bg-secondary/30 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                 <CreditCard size={18} className="text-primary" />
                 Finance Settings
              </h3>
           </div>
           <div className="p-6 space-y-6">
              
              <div>
                 <label className="block text-sm font-medium mb-2">Default Currency</label>
                 <CustomSelect 
                    value={currency}
                    onChange={setCurrency}
                    options={[
                        { id: "THB", label: "Thailand Baht (฿)", subLabel: "THB" },
                        { id: "USD", label: "US Dollar ($)", subLabel: "USD" },
                        { id: "EUR", label: "Euro (€)", subLabel: "EUR" },
                    ]}
                    placeholder="Select Currency"
                 />
                 <p className="text-xs text-muted-foreground mt-2">
                    Used for displaying monetary values. Note: Automatic conversion is not currently supported.
                 </p>
              </div>

              <div>
                 <label className="block text-sm font-medium mb-2">Default Wallet (Auto-Transactions)</label>
                 {wallets.length > 0 ? (
                     <CustomSelect 
                        value={defaultWalletId}
                        onChange={setDefaultWalletId}
                        options={[
                            { id: "", label: "None (Always Ask)", subLabel: "-" },
                            ...wallets.map(w => ({
                                id: w.id,
                                label: w.name,
                                subLabel: `฿${w.balance.toLocaleString()}`
                            }))
                        ]}
                        placeholder="Select Default Wallet"
                     />
                 ) : (
                     <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        Create a wallet in the Finance tab first.
                     </div>
                 )}
                 
                 <p className="text-xs text-muted-foreground mt-2">
                    Used automatically for Wishlist and Subscription auto-transactions.
                 </p>
              </div>

           </div>
        </div>

      </div>

      {hasChanges && (
         <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-background border border-border shadow-2xl rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-bottom-5 z-50">
             <span className="text-sm font-medium">Unsaved changes</span>
             <button
               onClick={handleSave}
               disabled={loading}
               className="bg-primary text-primary-foreground px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
             >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Save Changes
             </button>
         </div>
      )}

    </div>
  );
}
