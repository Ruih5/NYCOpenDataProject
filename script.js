let allData = [];
const API_URL = 'https://data.cityofnewyork.us/resource/jb7j-dtam.json';

const yearFilter = document.getElementById('yearFilter');
const causeFilter = document.getElementById('causeFilter');
const dataContainer = document.getElementById('dataContainer');

async function fetchData() {
    try {
        const response = await fetch(API_URL);
        allData = await response.json();
        
        initializeFilters();
        
        displayData(allData);
    } catch (error) {
        console.error('Error fetching data:', error);
        dataContainer.innerHTML = '<div class="error">Error loading data. Please try again later.</div>';
    }
}

function initializeFilters() {
    const years = [...new Set(allData.map(item => item.year))].sort();
    const causes = [...new Set(allData.map(item => item.leading_cause))].sort();

    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });

    causes.forEach(cause => {
        const option = document.createElement('option');
        option.value = cause;
        option.textContent = cause;
        causeFilter.appendChild(option);
    });
}

function filterData() {
    const year = yearFilter.value;
    const cause = causeFilter.value;

    return allData.filter(item => {
        return (year === 'all' || item.year === year) &&
               (cause === 'all' || item.leading_cause === cause);
    });
}

function displayData(data) {
    dataContainer.innerHTML = '';

    const groupedData = data.reduce((acc, item) => {
        const key = `${item.year}-${item.leading_cause}`;
        if (!acc[key]) {
            acc[key] = {
                year: item.year,
                cause: item.leading_cause,
                totalDeaths: 0,
                maleDeaths: 0,
                femaleDeaths: 0
            };
        }
        
        acc[key].totalDeaths += parseInt(item.deaths) || 0;
        if (item.sex === 'M') acc[key].maleDeaths += parseInt(item.deaths) || 0;
        if (item.sex === 'F') acc[key].femaleDeaths += parseInt(item.deaths) || 0;
        
        return acc;
    }, {});

    Object.values(groupedData).forEach(group => {
        const card = document.createElement('div');
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
    });
}

yearFilter.addEventListener('change', () => displayData(filterData()));
causeFilter.addEventListener('change', () => displayData(filterData()));

fetchData(); 