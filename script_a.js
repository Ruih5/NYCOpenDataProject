let allData = [];
let API_URL = 'https://data.cityofnewyork.us/resource/jb7j-dtam.json';

let yearFilter = document.getElementById('yearFilter');
let causeFilter = document.getElementById('causeFilter');
let dataContainer = document.getElementById('dataContainer');

async function fetchData() {
        let response = await fetch(API_URL);
        allData = await response.json();
        initializeFilters();
        displayData(allData);
 
    }

function initializeFilters() {
    let yearList = [];
    let causeList = [];

    for (let i = 0; i < allData.length; i++) {
        let item = allData[i];

        if (!yearList.includes(item.year)) {
            yearList.push(item.year);
        }

        if (!causeList.includes(item.leading_cause)) {
            causeList.push(item.leading_cause);
        }
    }

    for (let i = 0; i < yearList.length; i++) {
        let option = document.createElement('option');
        option.value = yearList[i];
        option.textContent = yearList[i];
        yearFilter.appendChild(option);
    }

    for (let i = 0; i < causeList.length; i++) {
        let option = document.createElement('option');
        option.value = causeList[i];
        option.textContent = causeList[i];
        causeFilter.appendChild(option);
    }
}


function filterData() {
  let selectedYear = yearFilter.value;
  let selectedCause = causeFilter.value;
  
  let filteredData = [];
  
  for (let i = 0; i < allData.length; i++) {
    let item = allData[i];
    
    let matchYear = (selectedYear === 'all' || item.year === selectedYear);
    let matchCause = (selectedCause === 'all' || item.leading_cause === selectedCause);
    
    if (matchYear && matchCause) {
      filteredData.push(item);
    }
  }
  
  return filteredData;
}


function displayData(data) {
    dataContainer.innerHTML = '';

    let groupedData = {};

    for (let item of data) {
        let key = item.year + '-' + item.leading_cause;

        if (!groupedData[key]) {
            groupedData[key] = {
                year: item.year,
                cause: item.leading_cause,
                totalDeaths: 0,
                maleDeaths: 0,
                femaleDeaths: 0
            };
        }

        let deaths = parseInt(item.deaths) || 0;
        groupedData[key].totalDeaths += deaths;
        if (item.sex === 'M') groupedData[key].maleDeaths += deaths;
        if (item.sex === 'F') groupedData[key].femaleDeaths += deaths;
    }

    for (let key in groupedData) {
        let group = groupedData[key];
        let card = document.createElement('div');
        card.className = 'data-card';
        card.innerHTML = `
            <h3>${group.cause}</h3>
            <div class="stat">
                <span class="stat-label">Year:</span> ${group.year}
            </div>
            <div class="stat">
                <span class="stat-label">Total Deaths:</span> ${group.totalDeaths.toLocaleString()}
            </div>
            <div class="stat">
                <span class="stat-label">Male Deaths:</span> ${group.maleDeaths.toLocaleString()}
            </div>
            <div class="stat">
                <span class="stat-label">Female Deaths:</span> ${group.femaleDeaths.toLocaleString()}
            </div>
        `;
        dataContainer.appendChild(card);
    }
}

yearFilter.addEventListener('change', () => displayData(filterData()));
causeFilter.addEventListener('change', () => displayData(filterData()));

fetchData();
