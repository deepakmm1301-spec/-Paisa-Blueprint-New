import React, { useState } from "react";
import { UserProfile, getShareableLink } from "../types";
import { Wallet, Landmark, TrendingUp, Sparkles, Scale, Percent, ShieldCheck, Share2 } from "lucide-react";

interface Props {
  profile: UserProfile;
}

export default function NetWorthTracker({ profile }: Props) {
  // We can let them toggle between using global profile assets or drafting live ledger overrides
  const [useProfileValues, setUseProfileValues] = useState<boolean>(true);
  
  // Local state ledger overrides
  const [localMf, setLocalMf] = useState<number>(profile.investments.mutualFunds || 350000);
  const [localStocks, setLocalStocks] = useState<number>(profile.investments.stocks || 120000);
  const [localSavings, setLocalSavings] = useState<number>(profile.currentSavings || 80000);
  const [localGold, setLocalGold] = useState<number>(profile.investments.gold || 150000);
  const [localRealEstate, setLocalRealEstate] = useState<number>(profile.investments.realEstate || 0);
  const [localEpf, setLocalEpf] = useState<number>(profile.investments.epf || 180000);
  const [localPpf, setLocalPpf] = useState<number>(profile.investments.ppf || 50000);
  const [localNps, setLocalNps] = useState<number>(profile.investments.nps || 60000);

  const [localHomeLoan, setLocalHomeLoan] = useState<number>(profile.loans.homeLoan || 0);
  const [localCarLoan, setLocalCarLoan] = useState<number>(profile.loans.carLoan || 0);
  const [localPersonalLoan, setLocalPersonalLoan] = useState<number>(profile.loans.personalLoan || 0);
  const [localOtherLoan, setLocalOtherLoan] = useState<number>(profile.loans.otherLoan || 0);

  // Pick source
  const assets = {
    savings: useProfileValues ? profile.currentSavings : localSavings,
    mutualFunds: useProfileValues ? profile.investments.mutualFunds : localMf,
    stocks: useProfileValues ? profile.investments.stocks : localStocks,
    gold: useProfileValues ? profile.investments.gold : localGold,
    realEstate: useProfileValues ? profile.investments.realEstate : localRealEstate,
    epf: useProfileValues ? profile.investments.epf : localEpf,
    ppf: useProfileValues ? profile.investments.ppf : localPpf,
    nps: useProfileValues ? profile.investments.nps : localNps,
  };

  const liabilities = {
    homeLoan: useProfileValues ? profile.loans.homeLoan : localHomeLoan,
    carLoan: useProfileValues ? profile.loans.carLoan : localCarLoan,
    personalLoan: useProfileValues ? profile.loans.personalLoan : localPersonalLoan,
    otherLoan: useProfileValues ? profile.loans.otherLoan : localOtherLoan,
  };

  const totalAssets = 
    assets.savings + 
    assets.mutualFunds + 
    assets.stocks + 
    assets.gold + 
    assets.realEstate + 
    assets.epf + 
    assets.ppf + 
    assets.nps;

  const totalLiabilities = 
    liabilities.homeLoan + 
    liabilities.carLoan + 
    liabilities.personalLoan + 
    liabilities.otherLoan;

  const netWorth = totalAssets - totalLiabilities;
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) : 0;

  const shareToWhatsApp = () => {
    const currentUrl = getShareableLink("networth", "/my-wealth-tracker");
    
    const text = `💰 *My Paisa Balancesheet & Wealth Projections*
*Total Assets:* ₹${totalAssets.toLocaleString("en-IN")}
*Total Loans/Debt:* ₹${totalLiabilities.toLocaleString("en-IN")}
-----------------------------------
*My Net Worth:* 🎉 ₹${netWorth.toLocaleString("en-IN")}
Debt to Asset Ratio: ${(debtToAssetRatio * 100).toFixed(1)}%

Track your wealth balance sheets and compounding growth: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div id="networth-tracker-module" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-xs text-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-6 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-bhagwa-600 bg-bhagwa-50 dark:bg-bhagwa-950/30 px-2.5 py-1 rounded-full">Balance Sheet</span>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-2 font-display">My Wealth Tracker</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track total accumulated assets (safe investments, liquidity schemes) against active loan liabilities.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3 md:mt-0">
          <button
            onClick={shareToWhatsApp}
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xs transition-all border-0 cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> Share on WhatsApp
          </button>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400">
            <label className="cursor-pointer" htmlFor="toggle-profile-sync">
              Sync with profile setup:
            </label>
            <input
              id="toggle-profile-sync"
              type="checkbox"
              checked={useProfileValues}
              onChange={(e) => setUseProfileValues(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-bhagwa-600"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-6">
        {/* Summary Block */}
        <div className="lg:col-span-12 bg-gradient-to-r from-bhagwa-900 to-bhagwa-950 text-white p-6 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-bhagwa-300">Paisa Balance Sheet Formula</span>
            <h3 className="text-3xl font-extrabold font-mono mt-1 text-emerald-400">
              ₹{netWorth.toLocaleString("en-IN")}
            </h3>
            <span className="text-xs text-bhagwa-200 mt-0.5 block">Net Worth = Asset base minus Debt obligations</span>
          </div>

          <div className="flex gap-6 border-t border-bhagwa-800 md:border-t-0 md:border-l md:pl-8 pt-4 md:pt-0 text-sm">
            <div>
              <span className="text-[11px] text-bhagwa-300 uppercase font-semibold">Total Assets Pool</span>
              <span className="block text-base font-bold text-gray-100 font-mono">₹{totalAssets.toLocaleString("en-IN")}</span>
            </div>
            <div>
              <span className="text-[11px] text-bhagwa-300 uppercase font-semibold">Total Liabilities</span>
              <span className="block text-base font-bold text-rose-300 font-mono">₹{totalLiabilities.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets ledger */}
        <div className="p-5 border border-slate-100 rounded-2xl bg-emerald-50/5/30 text-slate-700">
          <h3 className="font-bold text-slate-800 text-md mb-4 flex items-center gap-1.5 font-display">
            <Wallet className="w-5 h-5 text-emerald-600" /> Assets Portfolio Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Savings & FDs (Cash)</span>
              {useProfileValues ? (
                <span className="font-bold font-mono">₹{assets.savings.toLocaleString("en-IN")}</span>
              ) : (
                <input
                  type="number"
                  value={localSavings}
                  onChange={(e) => setLocalSavings(Number(e.target.value))}
                  className="w-32 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs"
                />
              )}
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Mutual Fund Equity</span>
              {useProfileValues ? (
                <span className="font-bold font-mono">₹{assets.mutualFunds.toLocaleString("en-IN")}</span>
              ) : (
                <input
                  type="number"
                  value={localMf}
                  onChange={(e) => setLocalMf(Number(e.target.value))}
                  className="w-32 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs"
                />
              )}
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Equities / Direct Stocks</span>
              {useProfileValues ? (
                <span className="font-bold font-mono">₹{assets.stocks.toLocaleString("en-IN")}</span>
              ) : (
                <input
                  type="number"
                  value={localStocks}
                  onChange={(e) => setLocalStocks(Number(e.target.value))}
                  className="w-32 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs"
                />
              )}
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Physical Gold holdings</span>
              {useProfileValues ? (
                <span className="font-bold font-mono">₹{assets.gold.toLocaleString("en-IN")}</span>
              ) : (
                <input
                  type="number"
                  value={localGold}
                  onChange={(e) => setLocalGold(Number(e.target.value))}
                  className="w-32 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs"
                />
              )}
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Employee Provident Fund (EPF)</span>
              {useProfileValues ? (
                <span className="font-bold font-mono">₹{assets.epf.toLocaleString("en-IN")}</span>
              ) : (
                <input
                  type="number"
                  value={localEpf}
                  onChange={(e) => setLocalEpf(Number(e.target.value))}
                  className="w-32 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs"
                />
              )}
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Public Provident Fund (PPF)</span>
              {useProfileValues ? (
                <span className="font-bold font-mono">₹{assets.ppf.toLocaleString("en-IN")}</span>
              ) : (
                <input
                  type="number"
                  value={localPpf}
                  onChange={(e) => setLocalPpf(Number(e.target.value))}
                  className="w-32 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs"
                />
              )}
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">National Pension Scheme (NPS)</span>
              {useProfileValues ? (
                <span className="font-bold font-mono">₹{assets.nps.toLocaleString("en-IN")}</span>
              ) : (
                <input
                  type="number"
                  value={localNps}
                  onChange={(e) => setLocalNps(Number(e.target.value))}
                  className="w-32 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs"
                />
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-600">Real Estate / Properties</span>
              {useProfileValues ? (
                <span className="font-bold font-mono">₹{assets.realEstate.toLocaleString("en-IN")}</span>
              ) : (
                <input
                  type="number"
                  value={localRealEstate}
                  onChange={(e) => setLocalRealEstate(Number(e.target.value))}
                  className="w-32 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs"
                />
              )}
            </div>
          </div>
        </div>

        {/* Liabilities ledger */}
        <div className="p-5 border border-slate-100 rounded-2xl bg-rose-50/5/30 text-slate-700">
          <h3 className="font-bold text-slate-800 text-md mb-4 flex items-center gap-1.5 font-display">
            <Landmark className="w-5 h-5 text-rose-500" /> Liabilities & Debt Ledger
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Home Loan Outstanding</span>
              {useProfileValues ? (
                <span className="font-bold font-mono">₹{liabilities.homeLoan.toLocaleString("en-IN")}</span>
              ) : (
                <input
                  type="number"
                  value={localHomeLoan}
                  onChange={(e) => setLocalHomeLoan(Number(e.target.value))}
                  className="w-32 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs"
                />
              )}
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Vehicle / Car Loan</span>
              {useProfileValues ? (
                <span className="font-bold font-mono">₹{liabilities.carLoan.toLocaleString("en-IN")}</span>
              ) : (
                <input
                  type="number"
                  value={localCarLoan}
                  onChange={(e) => setLocalCarLoan(Number(e.target.value))}
                  className="w-32 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs"
                />
              )}
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Personal Loan obligations</span>
              {useProfileValues ? (
                <span className="font-bold font-mono">₹{liabilities.personalLoan.toLocaleString("en-IN")}</span>
              ) : (
                <input
                  type="number"
                  value={localPersonalLoan}
                  onChange={(e) => setLocalPersonalLoan(Number(e.target.value))}
                  className="w-32 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs"
                />
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-600">Other Debts / Credit cards</span>
              {useProfileValues ? (
                <span className="font-bold font-mono">₹{liabilities.otherLoan.toLocaleString("en-IN")}</span>
              ) : (
                <input
                  type="number"
                  value={localOtherLoan}
                  onChange={(e) => setLocalOtherLoan(Number(e.target.value))}
                  className="w-32 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs"
                />
              )}
            </div>
          </div>

          {/* Debt health gauges */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-600 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Leverage risk analysis</span>
            
            <div className="flex justify-between font-semibold">
              <span>Debt-to-Asset ratio:</span>
              <span className={debtToAssetRatio > 0.4 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                {Math.round(debtToAssetRatio * 100)}% {debtToAssetRatio > 0.4 ? "(High debt risk)" : "(Healthy leverage)"}
              </span>
            </div>
            
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  debtToAssetRatio > 0.4 ? "bg-rose-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, Math.round(debtToAssetRatio * 100))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
