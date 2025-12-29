import React from "react";
import ListWithHeader from "../ListWithHeader";

interface WalletCardProps {
  balance: number;
  currency: string;
  transactions: { id: string; label: string; amount: number; type: string }[];
}

const WalletCard: React.FC<WalletCardProps> = ({ balance, currency, transactions }) => {
  return (
    <div className="rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Wallet</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Your current balance</p>

      {/* Balance */}
      <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
        {currency} {balance.toLocaleString()}
      </div>

      {/* Transactions */}


      {/* <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Transactions</h3>
      <ul className="space-y-2">
        {transactions.map((tx) => (
          <li
            key={tx.id}
            className="flex justify-between items-center text-sm bg-white dark:bg-gray-700 rounded-md px-3 py-2 shadow-sm"
          >
            <span className="text-gray-700 dark:text-gray-200">{tx.label}</span>
            <span
              className={`font-semibold ${
                tx.type === "credit" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {tx.type === "credit" ? "+" : "-"} {currency} {tx.amount}
            </span>
          </li>
        ))}
      </ul> */}
    </div>
  );
};

export default WalletCard;