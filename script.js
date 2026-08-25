// ======================================
// Solana Wallet Pro V3
// Part 3A
// ======================================

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

// Wallet
let provider = window.phantom?.solana || window.solana;
let wallet = null;

// Connection
function getConnection() {
  return new solanaWeb3.Connection(
    solanaWeb3.clusterApiUrl(network.value),
    "confirmed"
  );
}

// Load Balance
async function loadBalance() {
  if (!wallet) return;

  try {
    const connection = getConnection();
    const lamports = await connection.getBalance(wallet);

    balance.textContent =
      (lamports / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4) + " SOL";

  } catch (err) {
    console.error(err);
    balance.textContent = "Error";
  }
}

// Connect Wallet
async function connectWallet() {

  if (!provider || !provider.isPhantom) {
    alert("Please install Phantom Wallet.");
    window.open("https://phantom.app/", "_blank");
    return;
  }

  try {

    const res = await provider.connect();

    wallet = res.publicKey;

    status.textContent = "🟢 Wallet Connected";
    address.textContent = wallet.toString();

    await loadBalance();

  } catch (err) {

    console.error(err);
    alert("Wallet connection failed.");

  }

}
// ======================================
// Solana Wallet Pro V3
// Part 3B
// ======================================

// Disconnect Wallet
async function disconnectWallet() {
  if (!provider) return;

  try {
    await provider.disconnect();

    wallet = null;

    status.textContent = "🔴 Wallet Not Connected";
    address.textContent = "Not Connected";
    balance.textContent = "0 SOL";
    history.innerHTML = "<li>No transactions found.</li>";

    document.getElementById("qrcode").innerHTML = "";

  } catch (err) {
    console.error(err);
  }
}

// Refresh Balance
refreshBtn.addEventListener("click", async () => {
  if (!wallet) {
    alert("Connect your wallet first.");
    return;
  }

  await loadBalance();

  if (typeof loadTransactions === "function") {
    await loadTransactions();
  }
});

// Network Change
network.addEventListener("change", async () => {

  networkStatus.textContent =
    "Current : " + network.options[network.selectedIndex].text;

  if (wallet) {
    await loadBalance();

    if (typeof loadTransactions === "function") {
      await loadTransactions();
    }
  }

});

// Auto Connect
window.addEventListener("load", async () => {

  if (!provider || !provider.isPhantom) return;

  try {

    const res = await provider.connect({
      onlyIfTrusted: true
    });

    wallet = res.publicKey;

    status.textContent = "🟢 Wallet Connected";
    address.textContent = wallet.toString();

    await loadBalance();

  } catch (err) {
    console.log("Auto connect skipped");
  }

});

// Button Events
connectBtn.addEventListener("click", connectWallet);
disconnectBtn.addEventListener("click", disconnectWallet);
// ======================================
// Solana Wallet Pro V3
// Part 3C
// ======================================

// QR Code
function generateQRCode() {

  const qr = document.getElementById("qrcode");
  qr.innerHTML = "";

  if (!wallet) return;

  new QRCode(qr, {
    text: wallet.toString(),
    width: 180,
    height: 180
  });

}

// Transaction History
async function loadTransactions() {

  if (!wallet) return;

  history.innerHTML = "<li>Loading...</li>";

  try {

    const connection = getConnection();

    const signatures =
      await connection.getSignaturesForAddress(
        wallet,
        { limit: 5 }
      );

    history.innerHTML = "";

    if (signatures.length === 0) {
      history.innerHTML =
        "<li>No transactions found.</li>";
      return;
    }

    signatures.forEach(tx => {

      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${tx.err ? "❌ Failed" : "✅ Success"}</strong><br>
        ${tx.signature.slice(0,25)}...
      `;

      history.appendChild(li);

    });

  } catch (err) {

    console.error(err);

    history.innerHTML =
      "<li>Failed to load history.</li>";

  }

}

// Copy Address
copyBtn.addEventListener("click", async () => {

  if (!wallet) {
    alert("Connect wallet first.");
    return;
  }

  await navigator.clipboard.writeText(wallet.toString());

  alert("Wallet address copied.");

});

// Receive
receiveBtn.addEventListener("click", () => {

  if (!wallet) {
    alert("Connect wallet first.");
    return;
  }

  alert("Receive SOL:\n\n" + wallet.toString());

});

// Connect-এর পরে Balance + History + QR Load
const originalConnect = connectWallet;

connectWallet = async function () {

  await originalConnect();

  if (wallet) {

    generateQRCode();

    await loadTransactions();

  }

};

// Button Event Update
connectBtn.removeEventListener("click", originalConnect);
connectBtn.addEventListener("click", connectWallet);
// ======================================
// Solana Wallet Pro V3
// Part 3D (Final)
// ======================================

// Dark / Light Mode
themeBtn.addEventListener("click", () => {

  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");

  themeBtn.textContent = isLight ? "☀️" : "🌙";

  localStorage.setItem("theme", isLight ? "light" : "dark");

});

// Load Saved Theme
if (localStorage.getItem("theme") === "light") {

  document.body.classList.add("light");

  themeBtn.textContent = "☀️";

}

// Send SOL (Demo)
sendBtn.addEventListener("click", async () => {

  if (!wallet) {
    alert("Connect your wallet first.");
    return;
  }

  const receiverAddress = receiver.value.trim();
  const sendAmount = parseFloat(amount.value);

  if (!receiverAddress) {
    alert("Please enter receiver wallet address.");
    return;
  }

  if (isNaN(sendAmount) || sendAmount <= 0) {
    alert("Please enter a valid SOL amount.");
    return;
  }

  try {

    new solanaWeb3.PublicKey(receiverAddress);

    alert(
      `Ready to send ${sendAmount} SOL\n\nReceiver:\n${receiverAddress}`
    );

  } catch {

    alert("Invalid wallet address.");

  }

});

// Global Error Handler
window.addEventListener("error", (e) => {

  console.error("App Error:", e.message);

});

// App Loaded
console.log("✅ Solana Wallet Pro V3 Loaded");
