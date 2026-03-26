"use client"

import { useState } from "react";
import { uploadSlip } from "@/lib/actions/finance";
import { PaymentSlip } from "@/types";
import { Upload, Check, X, Loader2 } from "lucide-react";

interface SlipUploadFormProps {
    onSlipUploaded?: (slip: PaymentSlip) => void;
}

export function SlipUploadForm({ onSlipUploaded }: SlipUploadFormProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{
        success: boolean;
        message: string;
        slip?: PaymentSlip;
    } | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadResult(null);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedFile(file);
            setUploadResult(null);

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("slip", selectedFile);
        if (note) {
            formData.append("note", note);
        }

        try {
            const result = await uploadSlip(formData);

            if (result.success && result.slip) {
                setUploadResult({
                    success: true,
                    message: "สลิปอัพโหลดสำเร็จ!",
                    slip: result.slip,
                });

                // Reset form
                setTimeout(() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setNote("");
                    setUploadResult(null);

                    if (onSlipUploaded && result.slip) {
                        onSlipUploaded(result.slip);
                    }
                }, 2000);
            } else {
                setUploadResult({
                    success: false,
                    message: result.error || "เกิดข้อผิดพลาดในการอัพโหลด",
                });
            }
        } catch (error) {
            setUploadResult({
                success: false,
                message: "เกิดข้อผิดพลาดในการอัพโหลด",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setNote("");
        setUploadResult(null);
    };

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Upload size={20} />
                Upload Payment Slip
            </h3>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 transition-colors ${selectedFile
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                {!previewUrl ? (
                    <div className="text-center">
                        <Upload className="mx-auto mb-3 text-muted-foreground" size={40} />
                        <p className="text-sm text-muted-foreground mb-2">
                            Drag and drop files here, or click to select files.
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="slip-upload"
                        />
                        <label
                            htmlFor="slip-upload"
                            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                            Select file
                        </label>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-h-64 mx-auto rounded-lg shadow-md"
                            />
                            {!uploading && !uploadResult && (
                                <button
                                    onClick={handleClear}
                                    className="absolute -top-4 -right-4 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {uploadResult && (
                            <div
                                className={`p-4 rounded-lg flex items-center gap-2 ${uploadResult.success
                                        ? "bg-emerald-500/10 text-emerald-600"
                                        : "bg-red-500/10 text-red-600"
                                    }`}
                            >
                                {uploadResult.success ? (
                                    <Check size={20} />
                                ) : (
                                    <X size={20} />
                                )}
                                <span className="font-medium">{uploadResult.message}</span>
                            </div>
                        )}

                        {uploadResult?.success && uploadResult.slip?.qrData && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-600 mb-2">
                                    QR Code Data:
                                </h4>
                                <div className="space-y-1 text-sm">
                                    {uploadResult.slip.qrData.amount && (
                                        <p>
                                            <span className="font-medium">Amount:</span> ฿
                                            {uploadResult.slip.qrData.amount.toLocaleString()}
                                        </p>
                                    )}
                                    {uploadResult.slip.qrData.recipient && (
                                        <p>
                                            <span className="font-medium">Recipient:</span>{" "}
                                            {uploadResult.slip.qrData.recipient}
                                        </p>
                                    )}
                                    {uploadResult.slip.qrData.reference && (
                                        <p>
                                            <span className="font-medium">Reference:</span>{" "}
                                            {uploadResult.slip.qrData.reference}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Note Input */}
            {selectedFile && !uploadResult && (
                <div className="mt-4">
                    <label
                        htmlFor="slip-note"
                        className="block text-sm font-medium mb-2"
                    >
                        Note (Optional)
                    </label>
                    <input
                        id="slip-note"
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a note about this slip..."
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={uploading}
                    />
                </div>
            )}

            {/* Upload Button */}
            {selectedFile && !uploadResult && (
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full mt-4 px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {uploading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Uploading and scanning QR...
                        </>
                    ) : (
                        <>
                            <Upload size={20} />
                            Upload Slip
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
