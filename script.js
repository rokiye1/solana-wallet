// ================================
// Solana Wallet Pro v2
// script.js - Part 3A
// ================================

// Buttons
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const refreshBtn = document.getElementById("refreshBtn");
const copyBtn = document.getElementById("copyBtn");
const receiveBtn = document.getElementById("receiveBtn");
const sendBtn = document.getElementById("sendBtn");

// Inputs
const receiver = document.getElementById("receiver");
const amount = document.getElementById("amount");

// Display
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const address = document.getElementById("address");
const history = document.getElementById("history");
const network = document.getElementById("network");
const networkStatus = document.getElementById("networkStatus");

// Wallet
let provider = window.solana;
let publicKey = null;

// Connection
function getConnection() {
  switch (network.value) {
    case "Devnet":
      return new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl("devnet")
      );

    case "Testnet":
      return new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl("testnet")
      );

    default:
      return new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl("mainnet-beta")
      );
  }
}

// Load Balance
async function loadBalance() {
  if (!publicKey) return;

  try {
    const connection = getConnection();

    const lamports = await connection.getBalance(publicKey);

    balance.textContent =
      (
        lamports /
        solanaWeb3.LAMPORTS_PER_SOL
      ).toFixed(4) + " SOL";

  } catch (err) {
    console.error(err);
    balance.textContent = "Error";
  }
}

// Connect Wallet
async function connectWallet() {

  if (!provider || !provider.isPhantom) {

    alert("Please install Phantom Wallet");

    window.open("https://phantom.app/", "_blank");

    return;
  }

  try {

    const response = await provider.connect();

    publicKey = response.publicKey;

    address.textContent = publicKey.toString();

    status.textContent =
      "🟢 Wallet Connected";

    await loadBalance();

  } catch (err) {

    console.error(err);

    alert("Wallet connection failed.");

  }

}// ================================
// Solana Wallet Pro v2
// script.js - Part 3B
// ================================

// Disconnect Wallet
async function disconnectWallet() {
  if (!provider) return;

  try {
    await provider.disconnect();

    publicKey = null;

    status.textContent = "🔴 Wallet Not Connected";
    address.textContent = "Not Connected";
    balance.textContent = "0 SOL";

    history.innerHTML = "<li>No transactions found.</li>";

  } catch (err) {
    console.error(err);
  }
}

// Refresh Balance
refreshBtn.addEventListener("click", async () => {
  if (!publicKey) {
    alert("Connect your wallet first.");
    return;
  }

  await loadBalance();
});

// Network Switch
network.addEventListener("change", async () => {

  networkStatus.textContent =
    "Current : " + network.value;

  if (publicKey) {
    await loadBalance();
  }

});

// Auto Connect
window.addEventListener("load", async () => {

  if (!provider || !provider.isPhantom) return;

  try {

    const response =
      await provider.connect({
        onlyIfTrusted: true
      });

    publicKey = response.publicKey;

    address.textContent =
      publicKey.toString();

    status.textContent =
      "🟢 Wallet Connected";

    await loadBalance();

  } catch (e) {

    console.log("Auto Connect skipped");

  }

});

// Button Events
connectBtn.addEventListener(
  "click",
  connectWallet
);

disconnectBtn.addEventListener(
  "click",
  disconnectWallet
);// ================================
// Solana Wallet Pro v2
// script.js - Part 3C
// ================================

// Load Transaction History
async function loadTransactions() {
  if (!publicKey) return;

  history.innerHTML = "<li>Loading...</li>";

  try {
    const connection = getConnection();

    const signatures = await connection.getSignaturesForAddress(
      publicKey,
      { limit: 5 }
    );

    history.innerHTML = "";

    if (signatures.length === 0) {
      history.innerHTML = "<li>No transactions found.</li>";
      return;
    }

    signatures.forEach((tx) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${tx.err ? "❌ Failed" : "✅ Success"}</strong><br>
        ${tx.signature.slice(0,20)}...
      `;

      history.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    history.innerHTML =
      "<li>Failed to load transactions.</li>";
  }
}

// Copy Wallet Address
copyBtn.addEventListener("click", async () => {

  if (!publicKey) {
    alert("Connect wallet first.");
    return;
  }

  try {

    await navigator.clipboard.writeText(
      publicKey.toString()
    );

    alert("Address copied!");

  } catch (err) {

    alert("Copy failed.");

  }

});

// Receive Address
receiveBtn.addEventListener("click", () => {

  if (!publicKey) {
    alert("Connect wallet first.");
    return;
  }

  alert(
    "Receive SOL to:\n\n" +
    publicKey.toString()
  );

});

// Connect হলে Balance + History লোড হবে
const oldConnectWallet = connectWallet;

connectWallet = async function () {

  await oldConnectWallet();

  if (publicKey) {
    await loadTransactions();
  }

};// ================================
// Solana Wallet Pro v2
// script.js - Part 3D (Final)
// ================================

// Dark / Light Mode
const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");

  themeBtn.textContent =
    document.body.classList.contains("light")
      ? "☀️"
      : "🌙";
});

// Send SOL (Basic)
sendBtn.addEventListener("click", async () => {

  if (!publicKey) {
    alert("Connect your wallet first.");
    return;
  }

  const receiverAddress = receiver.value.trim();
  const sendAmount = parseFloat(amount.value);

  if (!receiverAddress) {
    alert("Enter receiver wallet address.");
    return;
  }

  if (!sendAmount || sendAmount <= 0) {
    alert("Enter a valid SOL amount.");
    return;
  }

  // Placeholder
  // এখানে পরবর্তী ধাপে Phantom Sign & Send Transaction যোগ করা হবে
  alert(
    "Ready to send " +
    sendAmount +
    " SOL to:\n\n" +
    receiverAddress
  );

});

// Global Error Handler
window.addEventListener("error", (e) => {
  console.error("App Error:", e.message);
});

console.log("✅ Solana Wallet Pro v2 Loaded");
