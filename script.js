const halvingDate = new Date("2024-04-19T00:00:00Z");
const msInDay = 1000 * 60 * 60 * 24;
const altStart = 235;
const altDuration = 310;
const trapDuration = 120;

const totalEl = document.getElementById("total");
const btcEl = document.getElementById("btc");
const total2El = document.getElementById("total2");
const totalPrettyEl = document.getElementById("totalPretty");
const btcPrettyEl = document.getElementById("btcPretty");
const total2PrettyEl = document.getElementById("total2Pretty");
const diffEl = document.getElementById("diff");
const statusEl = document.getElementById("status");

const phaseEl = document.getElementById("phase");
const trapPhaseEl = document.getElementById("trapPhase");
const trapStatusEl = document.getElementById("trapStatus");
const countdownEl = document.getElementById("countdown");

const altStartDate = new Date(halvingDate.getTime() + altStart * msInDay);
const altEndDate = new Date(altStartDate.getTime() + altDuration * msInDay);
const trapEndDate = new Date(altEndDate.getTime() + trapDuration * msInDay);

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  return num.toString();
}

async function fetchData() {
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
      statusEl.textContent = "🔴 EXIT NOW – TOTAL2 is overheating (market may collapse)";
      statusEl.classList.add("exit-now");
    } else if (diffPercent >= 0) {
      statusEl.textContent = "🟡 Safe to Exit – TOTAL2 matches or slightly exceeds BTC";
      statusEl.classList.add("exit-watch");
    } else {
      statusEl.textContent = "🟢 Not Ready – BTC dominance still strong";
      statusEl.classList.add("exit-safe");
    }

    updateCyclePhase();
  } catch (err) {
    console.error("Error fetching data:", err);
    statusEl.textContent = "⚠️ Failed to load market data";
  }
}

function updateCyclePhase() {
  const now = new Date();

  if (now < altStartDate) {
    phaseEl.textContent = "Alt Season (not started)";
    nextPhaseDate = altStartDate;
  } else if (now < altEndDate) {
    phaseEl.textContent = "Alt Season (in play)";
    nextPhaseDate = altEndDate;
  } else {
    phaseEl.textContent = "Alt Season (ended)";
    nextPhaseDate = trapEndDate;
  }

  if (now >= altEndDate && now <= trapEndDate) {
    trapPhaseEl.textContent = "Trap Altseason: ⚠️ Active";
    trapStatusEl.textContent = "Caution: late-cycle altcoin pumps may be traps.";
  } else {
    trapPhaseEl.textContent = "Trap Altseason: 🟢 Inactive";
    trapStatusEl.textContent = "";
  }
}

let nextPhaseDate = null;
function updateCountdown() {
  if (!nextPhaseDate) return;

  const now = new Date();
  const diff = nextPhaseDate - now;

  if (diff <= 0) {
    countdownEl.textContent = "🚨 Phase transition is occurring now!";
    return;
  }

  const days = Math.floor(diff / msInDay);
  const hours = Math.floor((diff % msInDay) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countdownEl.textContent = `⏳ Next Phase In: ${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Button listener
document.getElementById("refreshButton").addEventListener("click", () => {
  fetchData();
  updateCountdown();
});

// Initial load
window.addEventListener("load", () => {
  fetchData();
  updateCountdown();
  setInterval(updateCountdown, 1000);
});
