"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, TrendingUp, Clock, CheckCircle2, ChevronDown, X } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface PendingTx {
  id: number;
  waste_type_name: string;
  weight_kg: number;
  buy_price_per_kg: number;
  sell_price_per_kg: number;
  total_buy_value: number;
  created_at: string;
}

interface KasEntry {
  id: number;
  type: "pemasukan" | "pengeluaran";
  amount: number;
  description: string;
  balance_after: number;
  created_at: string;
  waste_type_name?: string;
  weight_kg?: number;
}

interface KeuanganTransparansiProps {
  kasBalance: number;
  totalSurplus: number;
  pending: PendingTx[];
  kasHistory: KasEntry[];
  onSellSuccess: () => void;
}

interface SellModalProps {
  tx: PendingTx;
  onClose: () => void;
  onSuccess: () => void;
}

function SellModal({ tx, onClose, onSuccess }: SellModalProps) {
  const [price, setPrice] = useState(String(tx.sell_price_per_kg));
  const [loading, setLoading] = useState(false);

  const actualPrice = parseInt(price) || 0;
  const surplus = (actualPrice - tx.buy_price_per_kg) * tx.weight_kg;

  const handleSell = async () => {
    if (!actualPrice || actualPrice <= 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${tx.id}/sell`, {
        method: "POST",
        body: JSON.stringify({ actual_sell_price_per_kg: actualPrice }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) { onSuccess(); onClose(); }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#000000]">Jual ke Pengepul</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">{tx.waste_type_name} · {tx.weight_kg} kg</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-black/6 flex items-center justify-center">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Info row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-2xl bg-black/4 p-3">
            <p className="text-[10px] text-[#6B7280] mb-0.5">Harga beli dari warga</p>
            <p className="text-sm font-bold text-[#000000]">Rp {tx.buy_price_per_kg.toLocaleString("id-ID")}/kg</p>
          </div>
          <div className="rounded-2xl bg-[#FED501]/12 p-3">
            <p className="text-[10px] text-[#6B7280] mb-0.5">Estimasi harga pengepul</p>
            <p className="text-sm font-bold text-[#003E87]">Rp {tx.sell_price_per_kg.toLocaleString("id-ID")}/kg</p>
          </div>
        </div>

        {/* Actual price input */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">
            Harga Jual Aktual ke Pengepul (Rp/kg) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] font-medium">Rp</span>
            <input
              type="number" min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-black/10 focus:border-[#003E87] focus:outline-none text-sm font-bold text-[#000000] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <p className="text-[10px] text-[#6B7280] mt-1">Masukkan harga pengepul hari ini (fluktuatif)</p>
        </div>

        {/* Surplus preview */}
        <div className={`rounded-2xl px-4 py-3 mb-4 border ${surplus >= 0 ? "bg-[#22C55E]/8 border-[#22C55E]/20" : "bg-red-50 border-red-200"}`}>
          <p className="text-[10px] text-[#6B7280] mb-0.5">Surplus ke Kas Bank Sampah</p>
          <p className={`text-xl font-extrabold ${surplus >= 0 ? "text-[#22C55E]" : "text-red-500"}`}>
            {surplus >= 0 ? "+" : ""}Rp {surplus.toLocaleString("id-ID")}
          </p>
          <p className="text-[10px] text-[#6B7280] mt-0.5">
            (Rp {actualPrice.toLocaleString("id-ID")} − Rp {tx.buy_price_per_kg.toLocaleString("id-ID")}) × {tx.weight_kg} kg
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-black/10 text-sm font-medium text-[#6B7280] hover:bg-black/4 transition-colors">
            Batal
          </button>
          <button
            onClick={handleSell}
            disabled={loading || !actualPrice}
            className="flex-1 py-3 rounded-xl bg-[#003E87] text-white text-sm font-semibold hover:bg-[#002d65] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Memproses..." : "Konfirmasi Jual"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function KeuanganTransparansi({
  kasBalance,
  totalSurplus,
  pending,
  kasHistory,
  onSellSuccess,
}: KeuanganTransparansiProps) {
  const [sellTx, setSellTx] = useState<PendingTx | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <AnimatePresence>
        {sellTx && (
          <SellModal
            tx={sellTx}
            onClose={() => setSellTx(null)}
            onSuccess={onSellSuccess}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6"
      >
        {/* Section header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#22C55E] flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#000000]">Transparansi Keuangan</h2>
            <p className="text-xs text-[#6B7280]">Kas bank sampah & riwayat surplus pengepul</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Kas balance card */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            {/* Kas saldo */}
            <div className="card p-5 bg-gradient-to-br from-[#003E87] to-[#002d65] text-white">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Saldo Kas Bank Sampah</p>
              <p className="text-xl sm:text-3xl font-extrabold break-all">Rp {kasBalance.toLocaleString("id-ID")}</p>
              <p className="text-xs text-white/50 mt-1">Akumulasi surplus dari semua penjualan ke pengepul</p>
            </div>

            {/* Total surplus */}
            <div className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/12 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#22C55E]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Total Surplus Terealisasi</p>
                <p className="text-lg font-extrabold text-[#22C55E]">Rp {totalSurplus.toLocaleString("id-ID")}</p>
              </div>
            </div>

            {/* Pending count */}
            <div className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FED501]/15 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#9A7F00]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Menunggu Dijual ke Pengepul</p>
                <p className="text-lg font-extrabold text-[#000000]">{pending.length} transaksi</p>
              </div>
            </div>
          </div>

          {/* Pending sales + kas history */}
          <div className="lg:col-span-2 card overflow-hidden">
            {/* Tab toggle */}
            <div className="flex border-b border-black/6">
              <button
                onClick={() => setShowHistory(false)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${!showHistory ? "text-[#003E87] border-b-2 border-[#003E87]" : "text-[#6B7280] hover:text-[#000000]"}`}
              >
                <Clock className="w-3.5 h-3.5 inline mr-1.5" strokeWidth={2} />
                Pending Jual ({pending.length})
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${showHistory ? "text-[#003E87] border-b-2 border-[#003E87]" : "text-[#6B7280] hover:text-[#000000]"}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" strokeWidth={2} />
                Riwayat Kas ({kasHistory.length})
              </button>
            </div>

            <div className="overflow-y-auto max-h-[340px]">
              <AnimatePresence mode="wait">
                {!showHistory ? (
                  <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {pending.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <CheckCircle2 className="w-10 h-10 text-[#22C55E]/40 mb-3" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-[#000000]">Semua sudah terjual!</p>
                        <p className="text-xs text-[#6B7280] mt-1">Tidak ada stok yang menunggu dijual ke pengepul.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-black/4">
                        {pending.map((tx) => {
                          const estimatedSurplus = (tx.sell_price_per_kg - tx.buy_price_per_kg) * tx.weight_kg;
                          return (
                            <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-4 hover:bg-black/2 transition-colors">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#000000] truncate">{tx.waste_type_name}</p>
                                <p className="text-xs text-[#6B7280]">
                                  {tx.weight_kg} kg · Bayar ke warga: <span className="font-medium">Rp {tx.total_buy_value.toLocaleString("id-ID")}</span>
                                </p>
                                <p className="text-[10px] text-[#6B7280] mt-0.5">
                                  {format(new Date(tx.created_at), "d MMM yyyy, HH:mm", { locale: idLocale })}
                                </p>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3">
                                <div className="text-left sm:text-right">
                                  <p className="text-[10px] text-[#6B7280]">Est. surplus</p>
                                  <p className="text-sm font-bold text-[#22C55E]">+Rp {estimatedSurplus.toLocaleString("id-ID")}</p>
                                </div>
                                <button
                                  onClick={() => setSellTx(tx)}
                                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#003E87] text-white text-xs font-semibold hover:bg-[#002d65] transition-colors whitespace-nowrap"
                                >
                                  <ChevronDown className="w-3 h-3 rotate-[-90deg]" strokeWidth={2.5} />
                                  Jual
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {kasHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <Wallet className="w-10 h-10 text-[#6B7280]/30 mb-3" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-[#000000]">Belum ada riwayat kas</p>
                        <p className="text-xs text-[#6B7280] mt-1">Riwayat akan muncul setelah transaksi jual pertama ke pengepul.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-black/4">
                        {/* Table header */}
                        <div className="hidden sm:grid grid-cols-[auto,1fr,auto,auto] gap-3 px-5 py-3 bg-black/2">
                          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Tipe</span>
                          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Keterangan</span>
                          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">Jumlah</span>
                          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">Saldo Kas</span>
                        </div>
                        {kasHistory.map((k) => (
                          <div key={k.id} className="flex flex-col sm:grid sm:grid-cols-[auto,1fr,auto,auto] gap-1.5 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 hover:bg-black/2 items-start sm:items-center transition-colors border-b border-black/4 last:border-0">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full self-start ${k.type === "pemasukan" ? "bg-[#22C55E]/12 text-[#16A34A]" : "bg-red-50 text-red-500"}`}>
                              {k.type === "pemasukan" ? "↑ Masuk" : "↓ Keluar"}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#000000]">{k.description}</p>
                              <p className="text-[10px] text-[#6B7280]">{format(new Date(k.created_at), "d MMM yyyy, HH:mm", { locale: idLocale })}</p>
                            </div>
                            <div className="flex sm:contents items-center justify-between w-full sm:w-auto gap-2">
                              <span className={`text-sm font-bold ${k.type === "pemasukan" ? "text-[#22C55E]" : "text-red-500"}`}>
                                {k.type === "pemasukan" ? "+" : "-"}Rp {k.amount.toLocaleString("id-ID")}
                              </span>
                              <span className="text-xs text-[#6B7280]">Saldo: <span className="font-bold text-[#000000]">Rp {k.balance_after.toLocaleString("id-ID")}</span></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
