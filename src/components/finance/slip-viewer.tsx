"use client"

import { PaymentSlip } from "@/types";
import { X, Download, FileText, Calendar, DollarSign, User, Hash } from "lucide-react";
import { useState } from "react";
import { updateSlipNote } from "@/lib/actions/finance";

interface SlipViewerProps {
    slip: PaymentSlip;
    onClose: () => void;
}

export function SlipViewer({ slip, onClose }: SlipViewerProps) {
    const [note, setNote] = useState(slip.note || "");
    const [saving, setSaving] = useState(false);

    const handleSaveNote = async () => {
        setSaving(true);
        await updateSlipNote(slip.id, note);
        setSaving(false);
    };

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = slip.imagePath.startsWith("/") ? slip.imagePath : `/api/media?slipId=${slip.id}`;
        link.download = slip.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <FileText size={20} />
                        รายละเอียดสลิป
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Image */}
                        <div className="space-y-4">
                            <div className="rounded-lg overflow-hidden border border-border bg-muted">
                                <img
                                    src={slip.imagePath.startsWith("/") ? slip.imagePath : `/api/media?slipId=${slip.id}`}
                                    alt={slip.fileName}
                                    className="w-full h-auto"
                                />
                            </div>

                            <button
                                onClick={handleDownload}
                                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                <Download size={18} />
                                ดาวน์โหลดสลิป
                            </button>
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            {/* Upload Date */}
                            <div className="bg-muted/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Calendar size={16} />
                                    <span className="text-sm font-medium">วันที่อัพโหลด</span>
                                </div>
                                <p className="text-lg font-semibold">
                                    {new Date(slip.uploadDate).toLocaleDateString("th-TH", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>

                            {/* QR Data */}
                            {slip.qrData && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                                    <h3 className="font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                                        <DollarSign size={18} />
                                        ข้อมูลจาก QR Code
                                    </h3>

                                    <div className="space-y-3">
                                        {slip.qrData.amount && (
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">จำนวนเงิน</p>
                                                <p className="text-2xl font-bold text-emerald-600">
                                                    ฿{slip.qrData.amount.toLocaleString()}
                                                </p>
                                            </div>
                                        )}

                                        {slip.qrData.recipient && (
                                            <div>
                                                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                                    <User size={14} />
                                                    <p className="text-xs">ผู้รับเงิน</p>
                                                </div>
                                                <p className="font-medium">{slip.qrData.recipient}</p>
                                            </div>
                                        )}

                                        {slip.qrData.reference && (
                                            <div>
                                                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                                    <Hash size={14} />
                                                    <p className="text-xs">เลขอ้างอิง</p>
                                                </div>
                                                <p className="font-mono text-sm">{slip.qrData.reference}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Note */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    หมายเหตุ
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="เพิ่มหมายเหตุเกี่ยวกับสลิปนี้..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                />
                                {note !== slip.note && (
                                    <button
                                        onClick={handleSaveNote}
                                        disabled={saving}
                                        className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        {saving ? "กำลังบันทึก..." : "บันทึกหมายเหตุ"}
                                    </button>
                                )}
                            </div>

                            {/* File Info */}
                            <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3">
                                <p><span className="font-medium">ชื่อไฟล์:</span> {slip.fileName}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
