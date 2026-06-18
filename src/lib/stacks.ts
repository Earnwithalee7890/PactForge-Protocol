// Stacks network and contract configuration
export const NETWORK = "mainnet";
export const STACKS_API_URL = "https://api.mainnet.hiro.so";

// Deployer address
export const DEPLOYER = "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT";

// Contract addresses (deployed on mainnet)
export const CONTRACTS = {
  PACT_CORE: {
    address: DEPLOYER,
    name: "pactcore",
  },
  MILESTONE_ENGINE: {
    address: DEPLOYER,
    name: "milestone-v2",
  },
  ARBITER_DAO: {
    address: DEPLOYER,
    name: "arbiter-dao-v4",
  },
  REPUTATION_SBT: {
    address: DEPLOYER,
    name: "reputation-sbt-v2",
  },
  PACTFORGE_TOKEN: {
    address: DEPLOYER,
    name: "pactforge",
  },
} as const;

// Pact states mapping
export const PACT_STATES: Record<number, { label: string; color: string }> = {
  0: { label: "Created", color: "#94a3b8" },
  1: { label: "Funded", color: "#f59e0b" },
  2: { label: "Active", color: "#3b82f6" },
  3: { label: "Completed", color: "#22c55e" },
  4: { label: "Disputed", color: "#ef4444" },
  5: { label: "Cancelled", color: "#64748b" },
  6: { label: "Refunded", color: "#8b5cf6" },
};

// Milestone states mapping
export const MILESTONE_STATES: Record<number, { label: string; color: string }> = {
  0: { label: "Pending", color: "#94a3b8" },
  1: { label: "In Progress", color: "#3b82f6" },
  2: { label: "Submitted", color: "#f59e0b" },
  3: { label: "Approved", color: "#22c55e" },
  4: { label: "Rejected", color: "#ef4444" },
  5: { label: "Paid", color: "#8b5cf6" },
};

// Reputation tiers
export const REPUTATION_TIERS = [
  { name: "Unranked", minScore: 0, color: "#64748b" },
  { name: "Bronze", minScore: 1, color: "#cd7f32" },
  { name: "Silver", minScore: 20, color: "#c0c0c0" },
  { name: "Gold", minScore: 50, color: "#ffd700" },
  { name: "Diamond", minScore: 100, color: "#b9f2ff" },
];

// Format STX amount from micro-STX
export function formatSTX(microSTX: number): string {
  return (microSTX / 1_000_000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

// Shorten a principal address
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Parse Clarity error codes to human-readable text
export function parseClarityError(error: any): string {
  if (!error) return "Unknown transaction error.";
  
  const errorMessage = typeof error === "string" ? error : (error.message || "");
  
  // Try to find code like u100 or 100 in message
  const match = errorMessage.match(/u(\d+)/i) || errorMessage.match(/err-code\s*(\d+)/i) || errorMessage.match(/code\s*(\d+)/i);
  if (match) {
    const code = parseInt(match[1]);
    switch (code) {
      case 100:
      case 1001:
        return "Unauthorized action. You are not a party to this agreement.";
      case 101:
      case 1002:
        return "Insufficient balance to perform payment or funding.";
      case 102:
      case 1003:
        return "Invalid state: action cannot be completed in current state.";
      case 103:
      case 1004:
        return "Pact has expired or deadline has passed.";
      case 104:
      case 1005:
        return "Milestone payment is already completed or disputed.";
      case 105:
      case 1006:
        return "You have already voted or participated in this vote.";
      case 106:
      case 1007:
        return "Pact value must exceed zero.";
      default:
        return `Blockchain transaction failed with Clarity error code: u${code}.`;
    }
  }

  if (errorMessage.includes("UserRejected")) {
    return "Transaction request rejected in Stacks wallet.";
  }

  return errorMessage || "An unexpected blockchain transaction error occurred.";
}

