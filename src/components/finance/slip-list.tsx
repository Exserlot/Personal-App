"use client"

import { PaymentSlip } from "@/types";
import { useState } from "react";
import { Trash2, Eye, FileText, Calendar } from "lucide-react";
import { deleteSlip } from "@/lib/actions/finance";
import { SlipViewer } from "./slip-viewer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface SlipListProps {
    slips: PaymentSlip[];
    onSlipDeleted?: () => void;
}

export function SlipList({ slips, onSlipDeleted }: SlipListProps) {
    const [selectedSlip, setSelectedSlip] = useState<PaymentSlip | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ id: string; slip: PaymentSlip } | null>(null);

    const handleDeleteClick = (slip: PaymentSlip) => {
        setConfirmDelete({ id: slip.id, slip });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;

        setDeleting(confirmDelete.id);
        const success = await deleteSlip(confirmDelete.id);
        setDeleting(null);
        setConfirmDelete(null);

        if (success && onSlipDeleted) {
            onSlipDeleted();
        }
    };

    if (slips.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Uploaded Slips
                </h3>
                <div className="text-center py-12 text-muted-foreground">
                    <FileText className="mx-auto mb-3 opacity-50" size={48} />
                    <p>No slips uploaded yet</p>
                    <p className="text-sm mt-1">Upload your first slip!</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Uploaded Slips ({slips.length})
                </h3>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {slips.map((slip) => (
                        <div
                            key={slip.id}
                            className="group relative border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all bg-background"
                        >
                            {/* Image */}
                            <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                                <img
                                    src={slip.imagePath}
                                    alt={slip.fileName}
                                    className="w-full h-full object-cover"
                                />

                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setSelectedSlip(slip)}
                                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                        title="View details"
                                    >
                                        <Eye size={20} className="text-gray-800" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(slip)}
                                        disabled={deleting === slip.id}
                                        className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
                                        title="ลบ"
                                    >
                                        <Trash2 size={20} className="text-white" />
                                    </button>
                                </div>

                                {/* QR Badge */}
                                {slip.qrData && (
                                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md">
                                        QR
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                    <Calendar size={12} />
                                    {new Date(slip.uploadDate).toLocaleDateString("th-TH", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </p>

                                {slip.qrData?.amount && (
                                    <p className="font-bold text-primary text-lg">
                                        ฿{slip.qrData.amount.toLocaleString()}
                                    </p>
                                )}

                                {slip.note && (
                                    <p className="text-sm text-muted-foreground truncate mt-1">
                                        {slip.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Slip Viewer Modal */}
            {selectedSlip && (
                <SlipViewer
                    slip={selectedSlip}
                    onClose={() => setSelectedSlip(null)}
                />
            )}

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Payment Slip"
                message={`Are you sure you want to delete this slip? ${
                    confirmDelete?.slip.qrData?.amount 
                        ? `(฿${confirmDelete.slip.qrData.amount.toLocaleString()})` 
                        : ''
                } This action cannot be undone.`}
                confirmText="ลบสลิป"
                cancelText="ยกเลิก"
                danger={true}
            />
        </>
    );
}
