"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

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
    if (saved) {
      setAddress(saved);
    }
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      // Dynamic import to avoid SSR issues
      const { showConnect } = await import("@stacks/connect");

      showConnect({
        appDetails: {
          name: "PactForge Protocol",
          icon: typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "/logo.png",
        },
        onFinish: (data: { userSession: { loadUserData: () => { profile: { stxAddress: { mainnet: string } } } } }) => {
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
