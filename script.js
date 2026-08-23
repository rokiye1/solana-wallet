const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const address = document.getElementById("address");
const balance = document.getElementById("balance");
const status = document.getElementById("status");
const network = document.getElementById("network");
const networkStatus = document.getElementById("networkStatus");
const refreshBtn = document.getElementById("refreshBtn");

let provider = window.solana;
let publicKey = null;

function getConnection() {
  let net = network.value;

  if (net === "Mainnet") {
    return new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("mainnet-beta")
    );
  }

  if (net === "Devnet") {
    return new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("devnet")
    );
  }

  return new solanaWeb3.Connection(
    solanaWeb3.clusterApiUrl("testnet")
  );
}

async function loadBalance() {
  if (!publicKey) return;

  const connection = getConnection();
  const lamports = await connection.getBalance(publicKey);

  balance.textContent =
    (lamports / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4) + " SOL";
}

async function connectWallet() {
  if (!provider || !provider.isPhantom) {
    alert("Please install Phantom Wallet.");
    window.open("https://phantom.app/", "_blank");
    return;
  }

  try {
    const resp = await provider.connect();

    publicKey = resp.publicKey;

    address.textContent = publicKey.toString();
    status.textContent = "🟢 Wallet Connected";

    await loadBalance();
  } catch (err) {
    console.error(err);
  }
}

async function disconnectWallet() {
  if (!provider) return;

  await provider.disconnect();

  publicKey = null;
  address.textContent = "Not Connected";
  balance.textContent = "0 SOL";
  status.textContent = "🔴 Wallet Not Connected";
}

refreshBtn.addEventListener("click", loadBalance);

network.addEventListener("change", () => {
  networkStatus.textContent = "Current : " + network.value;
  loadBalance();
});

connectBtn.addEventListener("click", connectWallet);
disconnectBtn.addEventListener("click", disconnectWallet);
