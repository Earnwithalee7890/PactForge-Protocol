"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { connect, isConnected, disconnect as stacksDisconnect } from "@stacks/connect";

interface WalletContextType {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connected: false,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
});

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem("pactforge_wallet");
    if (saved && isConnected()) {
      setAddress(saved);
    } else {
      localStorage.removeItem("pactforge_wallet");
      setAddress(null);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    try {
      const res = await connect();
      if (res && res.addresses && res.addresses.length > 0) {
        // Find STX address or default to first address
        const stxAddr = res.addresses.find(a => a.symbol === "STX")?.address || res.addresses[0].address;
        setAddress(stxAddr);
        localStorage.setItem("pactforge_wallet", stxAddr);
      }
    } catch (err) {
      console.error("Wallet connect error:", err);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    try {
      stacksDisconnect();
    } catch (err) {
      console.error("Disconnect error:", err);
    }
    setAddress(null);
    localStorage.removeItem("pactforge_wallet");
  }, []);

  return (
    <WalletContext.Provider value={{
      address,
      connected: !!address,
      connecting,
      connect: connectWallet,
      disconnect: disconnectWallet,
    }}>
      {children}
    </WalletContext.Provider>
  );
}
