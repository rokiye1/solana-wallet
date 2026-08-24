// ===================================
// Solana Wallet Pro v2
// Part 3A
// ===================================

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

// Network Connection
function getConnection() {

  switch (network.value) {

    case "Devnet":
      return new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl("devnet"),
        "confirmed"
      );

    case "Testnet":
      return new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl("testnet"),
        "confirmed"
      );

    default:
      return new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl("mainnet-beta"),
        "confirmed"
      );
  }

}

// Balance
async function loadBalance() {

  if (!wallet) return;

  try {

    const connection = getConnection();

    const lamports =
      await connection.getBalance(wallet);

    balance.textContent =
      (lamports /
      solanaWeb3.LAMPORTS_PER_SOL)
      .toFixed(4) + " SOL";

  } catch (err) {

    console.error(err);

    balance.textContent = "Error";

  }

}

// Connect Wallet
async function connectWallet() {

  if (!provider || !provider.isPhantom) {

    alert("Please install Phantom Wallet.");

    window.open("https://phantom.app/");

    return;

  }

  try {

    const response =
      await provider.connect();

    wallet = response.publicKey;

    address.textContent =
      wallet.toString();

    status.textContent =
      "🟢 Wallet Connected";

    await loadBalance();

  } catch (err) {

    console.error(err);

    alert("Connection Failed");

  }

}// ===================================
// Solana Wallet Pro v2
// Part 3B
// ===================================

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

});

// Network Switch
network.addEventListener("change", async () => {

  networkStatus.textContent =
    "Current : " + network.value;

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

    const response = await provider.connect({
      onlyIfTrusted: true
    });

    wallet = response.publicKey;

    address.textContent = wallet.toString();

    status.textContent = "🟢 Wallet Connected";

    await loadBalance();

    if (typeof loadTransactions === "function") {
      await loadTransactions();
    }

  } catch (err) {

    console.log("Auto Connect skipped");

  }

});

// Button Events
connectBtn.addEventListener("click", connectWallet);
disconnectBtn.addEventListener("click", disconnectWallet);// ===================================
// Solana Wallet Pro v2
// Part 3C
// ===================================

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

    signatures.forEach((tx) => {

      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${tx.err ? "❌ Failed" : "✅ Success"}</strong><br>
        ${tx.signature.substring(0,25)}...
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

  try {

    await navigator.clipboard.writeText(
      wallet.toString()
    );

    alert("Wallet address copied.");

  } catch (err) {

    alert("Copy failed.");

  }

});

// Receive
receiveBtn.addEventListener("click", () => {

  if (!wallet) {
    alert("Connect wallet first.");
    return;
  }

  alert(
    "Receive SOL to:\n\n" +
    wallet.toString()
  );

});

// Connect হলে History Load হবে
const originalConnectWallet = connectWallet;

connectWallet = async function () {

  await originalConnectWallet();

  if (wallet) {

    await loadTransactions();

  }

};// ===================================
// Solana Wallet Pro v2
// Part 3D
// ===================================

// Dark / Light Mode
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("light")
      ? "light"
      : "dark"
  );

  themeBtn.textContent =
    document.body.classList.contains("light")
      ? "☀️"
      : "🌙";
});

// Load Saved Theme
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
  themeBtn.textContent = "☀️";
}

// Send SOL (Basic Validation)

  if (!wallet) {
    alert("Connect your wallet first.");
    return;
  }

  const receiverAddress = receiver.value.trim();
  const sendAmount = parseFloat(amount.value);

  if (!receiverAddress) {
    alert("Please enter receiver address.");
    return;
  }

  try {
    new solanaWeb3.PublicKey(receiverAddress);
  } catch {
    alert("Invalid wallet address.");
    return;
  }

  if (isNaN(sendAmount) || sendAmount <= 0) {
    alert("Enter a valid SOL amount.");
    return;
  }

  alert(
    `Ready to send ${sendAmount} SOL\nTo:\n${receiverAddress}\n\n(Real transaction will be added in Part 3E)`
  );

});

// Global Error Handler
window.addEventListener("error", (event) => {
  console.error(event.error || event.message);
});

// App Loaded
console.log("✅ Solana Wallet Pro v2 Loaded");// ===================================
// Solana Wallet Pro v2
// Part 3E - Real Send SOL
// ===================================

sendBtn.removeEventListener("click", () => {});

sendBtn.onclick = async () => {

  if (!wallet) {
    alert("Connect your wallet first.");
    return;
  }

  try {

    const receiverAddress = receiver.value.trim();
    const sendAmount = parseFloat(amount.value);

    if (!receiverAddress) {
      alert("Enter receiver wallet address.");
      return;
    }

    if (isNaN(sendAmount) || sendAmount <= 0) {
      alert("Enter a valid SOL amount.");
      return;
    }

    const connection = getConnection();

    const toPublicKey = new solanaWeb3.PublicKey(receiverAddress);

    const transaction = new solanaWeb3.Transaction().add(

      solanaWeb3.SystemProgram.transfer({

        fromPubkey: wallet,
        toPubkey: toPublicKey,

        lamports:
          sendAmount *
          solanaWeb3.LAMPORTS_PER_SOL

      })

    );

    transaction.feePayer = wallet;

    const {
      blockhash
    } = await connection.getLatestBlockhash();

    transaction.recentBlockhash = blockhash;

    const result =
      await provider.signAndSendTransaction(
        transaction
      );

    await connection.confirmTransaction(
      result.signature,
      "confirmed"
    );

    alert("✅ Transaction Successful!\n\nSignature:\n" + result.signature);

    receiver.value = "";
    amount.value = "";

    await loadBalance();
    await loadTransactions();

  } catch (err) {

    console.error(err);

    alert("❌ Transaction failed or cancelled.");

  }

};// ===================================
// Solana Wallet Pro v2
// Part 3F - Final
// ===================================

// QR Code (Google Chart API)
function showQRCode() {

  if (!wallet) return;

  let qr = document.getElementById("walletQR");

  if (!qr) {

    qr = document.createElement("img");

    qr.id = "walletQR";
    qr.style.width = "180px";
    qr.style.marginTop = "15px";

    document
      .querySelector(".address-card")
      .appendChild(qr);

  }

  qr.src =
    "https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=" +
    encodeURIComponent(wallet.toString());

}

// Connect-এর পরে QR Code দেখাবে
const oldConnect = connectWallet;

connectWallet = async function () {

  await oldConnect();

  if (wallet) {

    showQRCode();

    await loadTransactions();

  }

};

// Disconnect হলে QR Code মুছে যাবে
const oldDisconnect = disconnectWallet;

disconnectWallet = async function () {

  await oldDisconnect();

  const qr = document.getElementById("walletQR");

  if (qr) qr.remove();

};

console.log("🚀 Solana Wallet Pro v2 Final Ready");
