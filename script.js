const halvingDate = new Date("2024-04-19T00:00:00Z");
const msInDay = 1000 * 60 * 60 * 24;
const altStart = 235;
const altDuration = 310;
const trapDuration = 120;

const altStartDate = new Date(halvingDate.getTime() + altStart * msInDay);
const altEndDate = new Date(altStartDate.getTime() + altDuration * msInDay);
const trapEndDate = new Date(altEndDate.getTime() + trapDuration * msInDay);

const phaseEl = document.getElementById("phase");
const trapPhaseEl = document.getElementById("trapPhase");
const trapStatusEl = document.getElementById("trapStatus");

function updatePhase() {
  const now = new Date();

  if (now < altStartDate) {
    phaseEl.textContent = "Alt Season (not started)";
  } else if (now >= altStartDate && now < altEndDate) {
    phaseEl.textContent = "Alt Season (in play)";
  } else {
    phaseEl.textContent = "Alt Season (ended)";
  }

  if (now >= altEndDate && now <= trapEndDate) {
    trapPhaseEl.textContent = "Trap Altseason: ⚠️ Active";
    trapStatusEl.textContent = "Caution: late-cycle altcoin pumps may be traps.";
  } else {
    trapPhaseEl.textContent = "Trap Altseason: 🟢 Inactive";
    trapStatusEl.textContent = "";
  }
}

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  return num.toString();
}

async function fetchMarketData() {
  const totalEl = document.getElementById("total");
  const btcEl = document.getElementById("btc");
  const total2El = document.getElementById("total2");
  const totalPrettyEl = document.getElementById("totalPretty");
  const btcPrettyEl = document.getElementById("btcPretty");
  const total2PrettyEl = document.getElementById("total2Pretty");
  const diffEl = document.getElementById("diff");
  const statusEl = document.getElementById("status");

  try {
    const globalRes = await fetch("https://api.coingecko.com/api/v3/global");
    const btcRes = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin");

    const globalData = await globalRes.json();
    const btcData = await btcRes.json();

    const totalMarketCap = globalData.data.total_market_cap.usd;
    const btcMarketCap = btcData.market_data.market_cap.usd;
    const total2MarketCap = totalMarketCap - btcMarketCap;
    const diffPercent = ((total2MarketCap - btcMarketCap) / btcMarketCap) * 100;

    totalEl.textContent = totalMarketCap.toFixed(0);
    btcEl.textContent = btcMarketCap.toFixed(0);
    total2El.textContent = total2MarketCap.toFixed(0);

    totalPrettyEl.textContent = formatNumber(totalMarketCap);
    btcPrettyEl.textContent = formatNumber(btcMarketCap);
    total2PrettyEl.textContent = formatNumber(total2MarketCap);
    diffEl.textContent = diffPercent.toFixed(2) + "%";

    statusEl.className = "";

    if (diffPercent > 15) {
      statusEl.textContent = "🔴 EXIT NOW – TOTAL2 overheating";
      statusEl.classList.add("exit-now");
    } else if (diffPercent >= 0) {
      statusEl.textContent = "🟡 Safe to Exit – TOTAL2 ~= BTC";
      statusEl.classList.add("exit-watch");
    } else {
      statusEl.textContent = "🟢 Not Ready – BTC dominance strong";
      statusEl.classList.add("exit-safe");
    }
  } catch (err) {
    console.error("Error fetching data:", err);
    document.getElementById("status").textContent = "⚠️ Failed to load market data";
  }
}

document.getElementById("refreshButton").addEventListener("click", () => {
  fetchMarketData();
  updatePhase();
});

window.addEventListener("load", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  fetchMarketData();
  updatePhase();
});
