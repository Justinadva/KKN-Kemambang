"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Pencil, Trash2, CheckCircle, AlertCircle } from "lucide-react";

export interface WasteType {
  id: number;
  name: string;
  emoji: string;
  color: string;
  buy_price_per_kg: number;
  sell_price_per_kg: number;
}

interface WasteTypeManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const COLORS = [
  "#003E87","#8B5CF6","#6B7280","#06B6D4","#22C55E",
  "#F59E0B","#EF4444","#EC4899","#14B8A6","#F97316",
];
const EMOJIS = ["♻️","🧴","📦","⚙️","🍶","🌿","🥫","📰","🔩","💡","🛢️","🪣","🧱","🌾","🫙"];

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${
        ok ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
    </motion.div>
  );
}

export default function WasteTypeManager({ isOpen, onClose, onUpdated }: WasteTypeManagerProps) {
  const [types, setTypes] = useState<WasteType[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const empty = { name: "", emoji: "♻️", color: "#003E87", buy_price_per_kg: "", sell_price_per_kg: "" };
  const [form, setForm] = useState<typeof empty>(empty);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/waste-types");
      setTypes(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isOpen) fetchTypes(); }, [isOpen]);

  const startEdit = (wt: WasteType) => {
    setEditId(wt.id);
    setForm({
      name: wt.name,
      emoji: wt.emoji,
      color: wt.color,
      buy_price_per_kg: String(wt.buy_price_per_kg),
      sell_price_per_kg: String(wt.sell_price_per_kg),
    });
    setShowForm(true);
  };

  const startAdd = () => {
    setEditId(null);
    setForm(empty);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.buy_price_per_kg || !form.sell_price_per_kg) {
      showToast("Isi semua field wajib", false);
      return;
    }
    const payload = {
      name: form.name,
      emoji: form.emoji,
      color: form.color,
      buy_price_per_kg: parseInt(form.buy_price_per_kg),
      sell_price_per_kg: parseInt(form.sell_price_per_kg),
    };
    try {
      if (editId) {
        await fetch(`/api/waste-types/${editId}`, { method: "PUT", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
        showToast("Jenis sampah diperbarui", true);
      } else {
        await fetch("/api/waste-types", { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
        showToast("Jenis sampah ditambahkan", true);
      }
      setShowForm(false);
      fetchTypes();
      onUpdated();
    } catch {
      showToast("Gagal menyimpan", false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus jenis sampah ini?")) return;
    await fetch(`/api/waste-types/${id}`, { method: "DELETE" });
    showToast("Jenis sampah dihapus", true);
    fetchTypes();
    onUpdated();
  };

  return (
    <>
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-black/6">
                <div>
                  <h2 className="text-lg font-bold text-[#000000]">Kelola Jenis Sampah</h2>
                  <p className="text-xs text-[#6B7280] mt-0.5">Tambah, ubah, atau hapus kategori sampah</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-black/6 transition-colors">
                  <X className="w-4 h-4 text-[#6B7280]" />
                </button>
              </div>

              {/* Form area */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 bg-[#F8F9FA] border-b border-black/6">
                      <p className="text-xs font-bold text-[#003E87] mb-3 uppercase tracking-wider">
                        {editId ? "Edit Jenis Sampah" : "Tambah Jenis Baru"}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Emoji picker */}
                        <div className="col-span-2">
                          <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Emoji</label>
                          <div className="flex flex-wrap gap-2">
                            {EMOJIS.map((e) => (
                              <button
                                key={e}
                                onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                                  form.emoji === e ? "bg-[#003E87]/10 ring-2 ring-[#003E87]" : "hover:bg-black/5"
                                }`}
                              >
                                {e}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Name */}
                        <div className="col-span-2">
                          <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Nama Jenis <span className="text-red-400">*</span></label>
                          <input
                            className="w-full px-3 py-2.5 rounded-xl border-2 border-black/10 focus:border-[#003E87] focus:outline-none text-sm text-[#000000]"
                            placeholder="cth: Botol PET, Aluminium..."
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          />
                        </div>

                        {/* Buy price */}
                        <div>
                          <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Harga Beli dari Warga <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] font-medium">Rp</span>
                            <input
                              type="number" min="0"
                              className="w-full pl-8 pr-3 py-2.5 rounded-xl border-2 border-black/10 focus:border-[#003E87] focus:outline-none text-sm text-[#000000] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="3500"
                              value={form.buy_price_per_kg}
                              onChange={(e) => setForm((f) => ({ ...f, buy_price_per_kg: e.target.value }))}
                            />
                          </div>
                          <p className="text-[10px] text-[#6B7280] mt-1">per kg, dibayar ke anggota</p>
                        </div>

                        {/* Sell price */}
                        <div>
                          <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Harga Jual ke Pengepul <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] font-medium">Rp</span>
                            <input
                              type="number" min="0"
                              className="w-full pl-8 pr-3 py-2.5 rounded-xl border-2 border-black/10 focus:border-[#003E87] focus:outline-none text-sm text-[#000000] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="4000"
                              value={form.sell_price_per_kg}
                              onChange={(e) => setForm((f) => ({ ...f, sell_price_per_kg: e.target.value }))}
                            />
                          </div>
                          <p className="text-[10px] text-[#22C55E] mt-1">estimasi saat ini (fluktuatif)</p>
                        </div>

                        {/* Color */}
                        <div className="col-span-2">
                          <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Warna Label</label>
                          <div className="flex gap-2">
                            {COLORS.map((c) => (
                              <button
                                key={c}
                                onClick={() => setForm((f) => ({ ...f, color: c }))}
                                className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? "scale-125 ring-2 ring-offset-2 ring-black/20" : "hover:scale-110"}`}
                                style={{ background: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => setShowForm(false)}
                          className="flex-1 py-2.5 rounded-xl border-2 border-black/10 text-sm font-medium text-[#6B7280] hover:bg-black/4 transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleSubmit}
                          className="flex-1 py-2.5 rounded-xl bg-[#003E87] text-white text-sm font-semibold hover:bg-[#002d65] transition-colors"
                        >
                          {editId ? "Simpan Perubahan" : "Tambahkan"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-[#003E87] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {types.map((wt) => (
                      <div
                        key={wt.id}
                        className="flex items-center gap-3 p-3 rounded-2xl border border-black/6 hover:bg-black/2 transition-colors"
                      >
                        <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl" style={{ background: wt.color + "18" }}>
                          {wt.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#000000] truncate">{wt.name}</p>
                          <div className="flex gap-3 mt-0.5">
                            <span className="text-[10px] text-[#6B7280]">
                              Beli: <span className="font-bold text-[#000000]">Rp {wt.buy_price_per_kg.toLocaleString("id-ID")}</span>/kg
                            </span>
                            <span className="text-[10px] text-[#6B7280]">
                              Jual: <span className="font-bold text-[#22C55E]">Rp {wt.sell_price_per_kg.toLocaleString("id-ID")}</span>/kg
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(wt)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#003E87]/8 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#003E87]" />
                          </button>
                          <button
                            onClick={() => handleDelete(wt.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!showForm && (
                <div className="px-6 py-4 border-t border-black/6">
                  <button
                    onClick={startAdd}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#003E87] text-white text-sm font-semibold hover:bg-[#002d65] transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    Tambah Jenis Sampah Baru
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
