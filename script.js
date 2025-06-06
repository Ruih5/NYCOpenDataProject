// Global variables1
let allData = [];
const API_URL = 'https://data.cityofnewyork.us/resource/jb7j-dtam.json';

// DOM Elements
const yearFilter = document.getElementById('yearFilter');
const causeFilter = document.getElementById('causeFilter');
const dataContainer = document.getElementById('dataContainer');

// Fetch data from NYC Open Data API
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        allData = await response.json();
        
        // Initialize filters with unique values
        initializeFilters();
        
        // Display initial data
        displayData(allData);
    } catch (error) {
        console.error('Error fetching data:', error);
        dataContainer.innerHTML = '<div class="error">Error loading data. Please try again later.</div>';
    }
}

// Initialize filter dropdowns with unique values
function initializeFilters() {
    const years = [...new Set(allData.map(item => item.year))].sort();
    const causes = [...new Set(allData.map(item => item.leading_cause))].sort();

    // Populate year filter
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });

    // Populate cause filter
    causes.forEach(cause => {
        const option = document.createElement('option');
        option.value = cause;
        option.textContent = cause;
        causeFilter.appendChild(option);
    });
}

// Filter data based on selected criteria
function filterData() {
    const year = yearFilter.value;
    const cause = causeFilter.value;

    return allData.filter(item => {
        return (year === 'all' || item.year === year) &&
               (cause === 'all' || item.leading_cause === cause);
    });
}

// Display data in card view
function displayData(data) {
    dataContainer.innerHTML = '';

    // Group data by year and cause
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

    // Create cards for each group
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

// Event Listeners
yearFilter.addEventListener('change', () => displayData(filterData()));
causeFilter.addEventListener('change', () => displayData(filterData()));

// Initialize the dashboard
fetchData(); 