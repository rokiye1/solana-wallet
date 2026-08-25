// ================================
// Solana Wallet Pro V3
// script.js - Part 1
// ================================

// Buttons
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const refreshBtn = document.getElementById("refreshBtn");
const copyBtn = document.getElementById("copyBtn");
const receiveBtn = document.getElementById("receiveBtn");
const sendBtn = document.getElementById("sendBtn");
const themeBtn = document.getElementById("themeBtn");

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
const qrBox = document.getElementById("qrcode");

// Wallet
let provider = window.phantom?.solana || window.solana;
let wallet = null;

// Connection
function getConnection() {
  return new solanaWeb3.Connection(
    "https://api.mainnet-beta.solana.com",
    "confirmed"
  );
}
// ================================
// script.js - Part 2
// ================================

// Connect Wallet
async function connectWallet() {

  if (!provider || !provider.isPhantom) {
    alert("Please install Phantom Wallet.");
    return;
  }

  try {

    const response = await provider.connect();

    wallet = response.publicKey;

    status.textContent = "🟢 Wallet Connected";
    address.textContent = wallet.toString();

    networkStatus.textContent =
      "Current : Mainnet";

    await loadBalance();
    await loadTransactions();
    generateQRCode();

  } catch (err) {

    console.error(err);
    alert("Wallet connection failed.");

  }

}

// Disconnect Wallet
async function disconnectWallet() {

  try {

    await provider.disconnect();

    wallet = null;

    status.textContent =
      "🔴 Wallet Not Connected";

    address.textContent =
      "Not Connected";

    balance.textContent =
      "0 SOL";

    history.innerHTML =
      "<li>No transactions found.</li>";

    qrBox.innerHTML = "";

  } catch (err) {

    console.error(err);

  }

}

// Load Balance
async function loadBalance() {

  if (!wallet) return;

  try {

    const connection = getConnection();

    const lamports =
      await connection.getBalance(wallet);

    balance.textContent =
      (lamports / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4) + " SOL";

  } catch (err) {

    console.error(err);

    balance.textContent = "Error";

  }

}
// ================================
// script.js - Part 3
// ================================

// Transaction History
async function loadTransactions() {

  if (!wallet) return;

  try {

    const connection = getConnection();

    const txs = await connection.getSignaturesForAddress(
      wallet,
      { limit: 5 }
    );

    history.innerHTML = "";

    if (txs.length === 0) {
      history.innerHTML = "<li>No transactions found.</li>";
      return;
    }

    txs.forEach(tx => {

      const li = document.createElement("li");

      li.innerHTML =
        (tx.err ? "❌ Failed" : "✅ Success") +
        "<br>" +
        tx.signature.substring(0, 30) +
        "...";

      history.appendChild(li);

    });

  } catch (err) {

    console.error(err);

    history.innerHTML =
      "<li>Failed to load transactions.</li>";

  }

}

// QR Code
function generateQRCode() {

  qrBox.innerHTML = "";

  if (!wallet) return;

  new QRCode(qrBox, {
    text: wallet.toString(),
    width: 180,
    height: 180
  });

}

// Copy Address
copyBtn.onclick = async () => {

  if (!wallet) {
    alert("Connect wallet first.");
    return;
  }

  await navigator.clipboard.writeText(wallet.toString());

  alert("Address copied.");

};

// Refresh Balance
refreshBtn.onclick = async () => {

  await loadBalance();
  await loadTransactions();

};

// Theme
themeBtn.onclick = () => {

  document.body.classList.toggle("light");

  themeBtn.textContent =
    document.body.classList.contains("light")
      ? "☀️"
      : "🌙";

};

// Events
connectBtn.onclick = connectWallet;
disconnectBtn.onclick = disconnectWallet;

console.log("✅ Sol
            
