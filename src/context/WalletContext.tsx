"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { connect, isConnected, disconnect as stacksDisconnect, request } from "@stacks/connect";
import { 
  fetchCallReadOnlyFunction, 
  cvToValue, 
  principalCV, 
  uintCV
} from "@stacks/transactions";

interface ReputationData {
  score: number;
  pactsCompleted: number;
  milestonesDelivered: number;
  disputesWon: number;
  disputesLost: number;
  joinedAt: number;
}

interface WalletContextType {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  pfgBalance: number;
  reputation: ReputationData | null;
  isReputationLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  initializeReputation: () => Promise<void>;
  mintPFG: (amount: number, recipient: string) => Promise<void>;
  refreshOnChainData: () => Promise<void>;
  recordPactCompletedOnChain: (userAddress: string) => Promise<void>;
  recordMilestoneDeliveredOnChain: (userAddress: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connected: false,
  connecting: false,
  pfgBalance: 0,
  reputation: null,
  isReputationLoading: false,
  connect: async () => {},
  disconnect: () => {},
  initializeReputation: async () => {},
  mintPFG: async () => {},
  refreshOnChainData: async () => {},
  recordPactCompletedOnChain: async () => {},
  recordMilestoneDeliveredOnChain: async () => {},
});

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [pfgBalance, setPfgBalance] = useState<number>(0);
  const [reputation, setReputation] = useState<ReputationData | null>(null);
  const [isReputationLoading, setIsReputationLoading] = useState(false);

  const refreshOnChainData = useCallback(async (userAddr?: string) => {
    const activeAddress = userAddr || address;
    if (!activeAddress) return;

    setIsReputationLoading(true);
    try {
      // 1. Fetch reputation SBT profile
      const repResult = await fetchCallReadOnlyFunction({
        contractAddress: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT",
        contractName: "reputation-sbt-v2",
        functionName: "get-reputation",
        functionArgs: [principalCV(activeAddress)],
        senderAddress: activeAddress,
        network: "mainnet",
      });

      const repVal = cvToValue(repResult);
      if (repVal && repVal.value) {
        const data = repVal.value;
        setReputation({
          score: Number(data.score.value || data.score),
          pactsCompleted: Number(data["pacts-completed"]?.value || data["pacts-completed"] || 0),
          milestonesDelivered: Number(data["milestones-delivered"]?.value || data["milestones-delivered"] || 0),
          disputesWon: Number(data["disputes-won"]?.value || data["disputes-won"] || 0),
          disputesLost: Number(data["disputes-lost"]?.value || data["disputes-lost"] || 0),
          joinedAt: Number(data["joined-at"]?.value || data["joined-at"] || 0),
        });
      } else {
        setReputation(null);
      }

      // 2. Fetch PFG Token balance
      const balResult = await fetchCallReadOnlyFunction({
        contractAddress: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT",
        contractName: "pactforge",
        functionName: "get-balance",
        functionArgs: [principalCV(activeAddress)],
        senderAddress: activeAddress,
        network: "mainnet",
      });

      const balVal = cvToValue(balResult);
      if (balVal && balVal.value) {
        setPfgBalance(Number(balVal.value.value || balVal.value) / 1_000_000);
      } else {
        setPfgBalance(0);
      }
    } catch (err) {
      console.error("Error fetching on-chain mainnet data:", err);
    } finally {
      setIsReputationLoading(false);
    }
  }, [address]);

  // Restore session on mount and fetch data
  useEffect(() => {
    const saved = localStorage.getItem("pactforge_wallet");
    if (saved && isConnected()) {
      setAddress(saved);
      refreshOnChainData(saved);
    } else {
      localStorage.removeItem("pactforge_wallet");
      setAddress(null);
    }
  }, [refreshOnChainData]);

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    try {
      const res = await connect();
      if (res && res.addresses && res.addresses.length > 0) {
        const stxAddr = res.addresses.find(a => a.symbol === "STX")?.address || res.addresses[0].address;
        setAddress(stxAddr);
        localStorage.setItem("pactforge_wallet", stxAddr);
        await refreshOnChainData(stxAddr);
      }
    } catch (err) {
      console.error("Wallet connect error:", err);
    } finally {
      setConnecting(false);
    }
  }, [refreshOnChainData]);

  const disconnectWallet = useCallback(() => {
    try {
      stacksDisconnect();
    } catch (err) {
      console.error("Disconnect error:", err);
    }
    setAddress(null);
    setReputation(null);
    setPfgBalance(0);
    localStorage.removeItem("pactforge_wallet");
  }, []);

  // Initialize Reputation Profile on Mainnet
  const initializeReputation = useCallback(async () => {
    if (!address) return;
    try {
      await request("stx_callContract", {
        contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.reputation-sbt-v2",
        functionName: "init-reputation",
        functionArgs: [],
        postConditionMode: "allow",
        network: "mainnet",
      });
      // Refresh after broadcast / confirmation
      setTimeout(() => refreshOnChainData(), 5000);
    } catch (err) {
      console.error("Initialization failed:", err);
      throw err;
    }
  }, [address, refreshOnChainData]);

  // Mint PFG governance tokens (Only contract owner)
  const mintPFG = useCallback(async (amount: number, recipient: string) => {
    if (!address) return;
    try {
      const microAmount = amount * 1_000_000; // 6 decimals
      await request("stx_callContract", {
        contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactforge",
        functionName: "mint",
        functionArgs: [uintCV(microAmount), principalCV(recipient)],
        postConditionMode: "allow",
        network: "mainnet",
      });
      setTimeout(() => refreshOnChainData(), 5000);
    } catch (err) {
      console.error("Minting PFG failed:", err);
    }
  }, [address, refreshOnChainData]);

  // Record Pact Completion on Reputation Contract (Mainnet Tx)
  const recordPactCompletedOnChain = useCallback(async (userAddress: string) => {
    if (!address) return;
    await request("stx_callContract", {
      contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.reputation-sbt-v2",
      functionName: "record-pact-completed",
      functionArgs: [principalCV(userAddress)],
      postConditionMode: "allow",
      network: "mainnet",
    });
    setTimeout(() => refreshOnChainData(), 5000);
  }, [address, refreshOnChainData]);

  // Record Milestone Delivery on Reputation Contract (Mainnet Tx)
  const recordMilestoneDeliveredOnChain = useCallback(async (userAddress: string) => {
    if (!address) return;
    await request("stx_callContract", {
      contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.reputation-sbt-v2",
      functionName: "record-milestone-delivered",
      functionArgs: [principalCV(userAddress)],
      postConditionMode: "allow",
      network: "mainnet",
    });
    setTimeout(() => refreshOnChainData(), 5000);
  }, [address, refreshOnChainData]);

  return (
    <WalletContext.Provider value={{
      address,
      connected: !!address,
      connecting,
      pfgBalance,
      reputation,
      isReputationLoading,
      connect: connectWallet,
      disconnect: disconnectWallet,
      initializeReputation,
      mintPFG,
      refreshOnChainData,
      recordPactCompletedOnChain,
      recordMilestoneDeliveredOnChain,
    }}>
      {children}
    </WalletContext.Provider>
  );
}
