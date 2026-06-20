import { formatSTX, shortenAddress, parseClarityError } from "./stacks";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

function runTests() {
  console.log("Starting stacks utility unit tests...");

  // 1. formatSTX tests
  assert(formatSTX(1000000) === "1.00", "1,000,000 micro-STX should format as 1.00");
  assert(formatSTX(5000000) === "5.00", "5,000,000 micro-STX should format as 5.00");
  assert(formatSTX(1234567) === "1.234567", "1,234,567 micro-STX should format as 1.234567");

  // 2. shortenAddress tests
  const address = "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT";
  assert(shortenAddress(address) === "SP2F50...NFBT", "Should shorten address with default characters");
  assert(shortenAddress(address, 6) === "SP2F500B...XGNFBT", "Should shorten address with custom length (6)");
  assert(shortenAddress("") === "", "Should return empty string if address is empty");

  // 3. parseClarityError tests
  assert(parseClarityError("u100").includes("Unauthorized"), "Clarity error u100 should parse as Unauthorized");
  assert(parseClarityError("err-code 101").includes("Insufficient"), "Clarity error 101 should parse as Insufficient balance");
  assert(parseClarityError("code 103").includes("expired"), "Clarity error 103 should parse as expired");
  assert(parseClarityError("u999").includes("Clarity error code: u999"), "Clarity error u999 should display code in fallback message");
  assert(parseClarityError("UserRejected").includes("rejected"), "UserRejected should parse as wallet rejection");
  assert(parseClarityError("Custom message") === "Custom message", "Generic string should pass through directly");

  console.log("All stacks utility tests passed successfully!");
}

runTests();
