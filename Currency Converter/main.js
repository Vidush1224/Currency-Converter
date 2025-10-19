const currencySymbols = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥',
  AUD: 'A$', CAD: 'C$', CHF: 'Fr', CNY: '¥', SEK: 'kr', NZD: 'NZ$'
};

    let currentRates = {};

    // Navigation
    function showSection(sectionId) {
      document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
      });
      document.getElementById(sectionId).classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Contact Form Handler
    function handleContactSubmit(e) {
      e.preventDefault();
      alert('Thank you for your message! We\'ll get back to you within 24 hours.');
      e.target.reset();
    }

    function updateSymbol() {
      const fromCurrency = document.getElementById('fromCurrency').value;
      const toCurrency = document.getElementById('toCurrency').value;
      document.getElementById('fromSymbol').textContent = currencySymbols[fromCurrency] || fromCurrency;
      document.getElementById('toSymbol').textContent = currencySymbols[toCurrency] || toCurrency;
    }

    function swapCurrencies() {
      const fromSelect = document.getElementById('fromCurrency');
      const toSelect = document.getElementById('toCurrency');
      const temp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = temp;
      updateSymbol();
      
      if (Object.keys(currentRates).length > 0) {
        convertCurrency();
      }
    }

    function quickConvert(amount) {
      document.getElementById('quantity').value = amount;
      if (Object.keys(currentRates).length > 0) {
        convertCurrency();
      }
    }

    async function convertCurrency() {
      const loading = document.querySelector(".loading");
      const output = document.querySelector(".output");
      const resultCard = document.getElementById("resultCard");
      const rateInfo = document.getElementById("rateInfo");
      const currencyGrid = document.getElementById("currencyGrid");

      const value = parseFloat(document.getElementById('quantity').value);
      const fromCurrency = document.getElementById('fromCurrency').value;
      const toCurrency = document.getElementById('toCurrency').value;

      if (isNaN(value) || value <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      loading.style.display = "block";
      output.style.display = "none";
      resultCard.style.display = "none";
      rateInfo.style.display = "none";
      currencyGrid.innerHTML = "";

      const url = `https://api.currencyapi.com/v3/latest?apikey=cur_live_uF2jTdnJsEHguKhmJV5YDy4YvbtsLy4QsGti2hh6&base_currency=${fromCurrency}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.data) throw new Error("Invalid API response");

        currentRates = data.data;
        loading.style.display = "none";

        // Show main conversion result
        const rate = data.data[toCurrency].value;
        const convertedValue = (rate * value).toFixed(2);
        const toSymbol = currencySymbols[toCurrency] || toCurrency;
        const fromSymbol = currencySymbols[fromCurrency] || fromCurrency;

        document.getElementById('result').value = convertedValue;

        resultCard.style.display = "block";
        document.getElementById('resultMain').textContent = `${toSymbol}${convertedValue}`;
        document.getElementById('resultDetail').textContent = `${fromSymbol}${value} ${fromCurrency} = ${toSymbol}${convertedValue} ${toCurrency}`;

        // Show exchange rate info
        rateInfo.style.display = "block";
        rateInfo.innerHTML = `<strong>Exchange Rate:</strong> 1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency} • Updated: ${new Date().toLocaleString()}`;

        // Show all currencies
        output.style.display = "block";
        let gridHTML = "";
        
        for (let key of Object.keys(data.data)) {
          const currencyRate = data.data[key].value;
          const currencyValue = (currencyRate * value).toFixed(2);
          const symbol = currencySymbols[key] || '';
          
          gridHTML += `
            <div class="currency-item">
              <div class="currency-code">${key}</div>
              <div class="currency-name">${data.data[key].code}</div>
              <div class="currency-value">${symbol}${currencyValue}</div>
            </div>
          `;
        }

        currencyGrid.innerHTML = gridHTML;

      } catch (err) {
        loading.style.display = "block";
        loading.innerHTML = '<div style="color: #e74c3c; font-weight: 600;">⚠️ Failed to fetch data. Please check your connection and try again.</div>';
        console.error("Error:", err);
      }
    }

    // Event listeners
    document.querySelector(".converter-form").addEventListener("submit", (e) => {
      e.preventDefault();
      convertCurrency();
    });

    document.getElementById('fromCurrency').addEventListener('change', updateSymbol);
    document.getElementById('toCurrency').addEventListener('change', updateSymbol);

    document.getElementById('quantity').addEventListener('input', () => {
      if (Object.keys(currentRates).length > 0) {
        const value = parseFloat(document.getElementById('quantity').value);
        const toCurrency = document.getElementById('toCurrency').value;
        if (!isNaN(value) && currentRates[toCurrency]) {
          const rate = currentRates[toCurrency].value;
          document.getElementById('result').value = (rate * value).toFixed(2);
        }
      }
    });

    // Initialize
    updateSymbol();