"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { showConnect } from "@stacks/connect";

interface WalletContextType {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connected: false,
  connecting: false,
  connect: () => {},
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
    if (saved) {
      setAddress(saved);
    }
  }, []);

  const connect = useCallback(() => {
    setConnecting(true);
    try {
      showConnect({
        appDetails: {
          name: "PactForge Protocol",
          icon: typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "/logo.png",
        },
        onFinish: (data) => {
          const userData = data.userSession.loadUserData();
          const stxAddr = userData.profile.stxAddress.mainnet;
          setAddress(stxAddr);
          localStorage.setItem("pactforge_wallet", stxAddr);
          setConnecting(false);
        },
        onCancel: () => {
          setConnecting(false);
        },
      });
    } catch (err) {
      console.error("Wallet connect error:", err);
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    localStorage.removeItem("pactforge_wallet");
  }, []);

  return (
    <WalletContext.Provider value={{
      address,
      connected: !!address,
      connecting,
      connect,
      disconnect,
    }}>
      {children}
    </WalletContext.Provider>
  );
}
