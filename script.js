const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const address = document.getElementById("address");
const balance = document.getElementById("balance");

let provider = window.solana;

async function connectWallet() {
  if (!provider || !provider.isPhantom) {
    alert("Please install Phantom Wallet.");
    window.open("https://phantom.app/", "_blank");
    return;
  }

  try {
    const resp = await provider.connect();

    address.textContent = resp.publicKey.toString();

    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("mainnet-beta")
    );

    const lamports = await connection.getBalance(resp.publicKey);
    balance.textContent = (lamports / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4) + " SOL";
  } catch (err) {
    console.error(err);
  }
}

async function disconnectWallet() {
  if (provider) {
    await provider.disconnect();
    address.textContent = "Not Connected";
    balance.textContent = "0 SOL";
  }
}

connectBtn.addEventListener("click", connectWallet);
disconnectBtn.addEventListener("click", disconnectWallet);
