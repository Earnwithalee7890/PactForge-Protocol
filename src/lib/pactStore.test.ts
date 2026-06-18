// Mock localStorage for node environment testing
if (typeof global !== 'undefined') {
  const store: Record<string, string> = {};
  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { for (const key in store) delete store[key]; }
    },
    configurable: true,
    enumerable: true,
    writable: true
  });
}


import { pactStore } from "./pactStore";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

function runTests() {
  console.log("Starting pactStore unit tests...");

  // 1. Initial State Check
  const pacts = pactStore.getPacts();
  assert(pacts.length === 4, "Should initialize with 4 default mock pacts");

  const pact1 = pactStore.getPactById(1);
  assert(pact1 !== undefined, "Pact #1 should exist");
  assert(pact1?.title === "DeFi Dashboard UI/UX Design", "Pact #1 title matches");

  // 2. Create Pact
  const newPact = pactStore.createPact(
    "Test Pact",
    "Description of test pact",
    "SP_CLIENT",
    "SP_PROVIDER",
    "1,000 STX",
    [
      { title: "Milestone A", description: "Deliver A", amount: "500 STX" },
      { title: "Milestone B", description: "Deliver B", amount: "500 STX" }
    ]
  );

  assert(newPact.id === 5, "New pact should have ID 5");
  assert(newPact.state === "created", "New pact should start in 'created' state");
  assert(newPact.milestones.length === 2, "New pact should have 2 milestones");

  // 3. Update Milestone State & Completion
  const updatedPact = pactStore.updateMilestoneState(5, 1, 1); // Mark first milestone In Progress (state 1)
  assert(updatedPact?.state === "active", "Pact should become 'active' when a milestone starts");

  pactStore.updateMilestoneState(5, 1, 5); // Pay milestone 1
  pactStore.updateMilestoneState(5, 2, 5); // Pay milestone 2
  const completedPact = pactStore.getPactById(5);
  assert(completedPact?.state === "completed", "Pact should become 'completed' when all milestones are paid");

  // 4. Dispute Workflow
  const dispute = pactStore.raiseDispute(1, "Late deliverable", "Deliverable is 2 weeks late.");
  assert(dispute !== undefined, "Dispute should be successfully created");
  assert(dispute?.pactId === 1, "Dispute pactId should match pact");
  
  const disputedPact = pactStore.getPactById(1);
  assert(disputedPact?.state === "disputed", "Pact state should change to 'disputed'");

  // 5. Vote Dispute (quorums)
  pactStore.voteDispute(dispute!.id, "client", "voter1");
  pactStore.voteDispute(dispute!.id, "client", "voter2");
  pactStore.voteDispute(dispute!.id, "client", "voter3");
  pactStore.voteDispute(dispute!.id, "client", "voter4");
  const resolvedDispute = pactStore.voteDispute(dispute!.id, "client", "voter5"); // 5th vote triggers resolution

  assert(resolvedDispute?.status === "resolved_client", "Dispute should resolve in favor of client");
  const refundedPact = pactStore.getPactById(1);
  assert(refundedPact?.state === "cancelled", "Resolved dispute in favor of client should cancel the pact");

  // 6. Test clearAll reset capability
  pactStore.clearAll();
  const clearedPacts = pactStore.getPacts();
  // Since cleared, it should re-initialize with default mock pacts (which has 4 items)
  assert(clearedPacts.length === 4, "Store should reset and reinitialize with 4 items after clearAll");

  console.log("All unit tests passed successfully!");
}

runTests();

