let allData = [];
let filteredData = [];
let API_URL = 'https://data.cityofnewyork.us/resource/jb7j-dtam.json';

let yearFilter = document.getElementById('yearFilter');
let causeFilter = document.getElementById('causeFilter');
let chartTypeSelect = document.getElementById('chartType');


async function fetchData() {
        let response = await fetch(API_URL);
        allData = await response.json();

        initializeFilters();
        FilteredData();
        initializeCharts();

        yearFilter.addEventListener('change', () => {
            FilteredData();
            Charts();
        });
        causeFilter.addEventListener('change', () => {
            FilteredData();
            Charts();
        });
        chartTypeSelect.addEventListener('change', MainChart);
    }

function initializeFilters() {
  let yearList = [];
  let causeList = [];

  for (let i = 0; i < allData.length; i++) {
    let item = allData[i];

    if (item.year && !yearList.includes(item.year)) {
      yearList.push(item.year);
    }

    if (item.leading_cause && !causeList.includes(item.leading_cause)) {
      causeList.push(item.leading_cause);
    }
  }

  for (let i = 0; i < yearList.length; i++) {
    let option = document.createElement("option");
    option.value = yearList[i];
    option.textContent = yearList[i];
    yearFilter.appendChild(option);
  }

  for (let i = 0; i < causeList.length; i++) {
    let option = document.createElement("option");
    option.value = causeList[i];
    option.textContent = causeList[i];
    causeFilter.appendChild(option);
  }
}
function FilteredData() {
  let year = yearFilter.value;
  let cause = causeFilter.value;

  filteredData = []; 

  for (let i = 0; i < allData.length; i++) {
    let item = allData[i];

    if ((year === 'all' || item.year === year) &&
        (cause === 'all' || item.leading_cause === cause)) {
      filteredData.push(item);
    }
  }
}


function initializeCharts() {
    mainChart = c3.generate({
        bindto: '#mainChart',
        data: {
            columns: [],
            type: 'bar'
        },
        axis: {
            x: {
                type: 'category',
                tick: {
                    rotate: 45
                }
            },
            y: {
                label: 'Number of Deaths'
            }
        },
        tooltip: {
            grouped: false,
            format: {
                value: function(value) {
                    return value.toLocaleString();
                }
            }
        },
        point: { show: false },
        transition: { duration: 0 },
        interaction: { enabled: false }
    });

    genderChart = c3.generate({
        bindto: '#genderChart',
        data: {
            columns: [],
            type: 'pie'
        },
        tooltip: {
            grouped: false,
            format: {
                value: function(value) {
                    return value.toLocaleString();
                }
            }
        },
        transition: { duration: 0 },
        interaction: { enabled: false }
    });

    trendChart = c3.generate({
        bindto: '#trendChart',
        data: {
            x: 'x',
            columns: [],
            type: 'line'
        },
        axis: {
            x: {
                type: 'category',
                label: 'Year'
            },
            y: {
                label: 'Number of Deaths'
            }
        },
        tooltip: {
            grouped: false,
            format: {
                value: function(value) {
                    return value.toLocaleString();
                }
            }
        },
        point: { show: false },
        transition: { duration: 0 },
        interaction: { enabled: false }
    });

    Charts();
}

function MainChart() {
    let chartType = chartTypeSelect.value;

    let causeData = {};
    filteredData.forEach(item => {
        let cause = item.leading_cause;
        let deaths = parseInt(item.deaths) || 0;
        if (!causeData[cause]) {
            causeData[cause] = 0;
        }
        causeData[cause] += deaths;
    });

    let columns = Object.entries(causeData).map(([cause, deaths]) => [cause, deaths]);

    mainChart.load({
        columns: columns,
        unload: true,
        type: chartType
    });
}
function GenderChart() {
  let genderData = {
    Male: 0,
    Female: 0
  };

  for (let i = 0; i < filteredData.length; i++) {
    let item = filteredData[i];
    let gender = item.sex === 'M' ? 'Male' : 'Female';
    let deaths = parseInt(item.deaths);

    if (!isNaN(deaths)) {
      genderData[gender] += deaths;
    }
  }

  let columns = [];
  columns.push(['Male', genderData['Male']]);
  columns.push(['Female', genderData['Female']]);

  genderChart.load({
    columns: columns,
    unload: true
  });
}
function TrendChart() {
  let yearData = {};
  
  for (let i = 0; i < filteredData.length; i++) {
    let item = filteredData[i];
    let year = item.year;
    let deaths = parseInt(item.deaths) || 0;

    if (!yearData[year]) {
      yearData[year] = 0;
    }
    yearData[year] += deaths;
  }

  let years = [];
  for (let year in yearData) {
    years.push(year);
  }

  years.sort(); 

  let deathCounts = [];
  for (let i = 0; i < years.length; i++) {
    deathCounts.push(yearData[years[i]]);
  }

  trendChart.load({
    columns: [
      ['x'].concat(years),
      ['Deaths'].concat(deathCounts)
    ],
    unload: true
  });
}


function Charts() {
    MainChart();
    GenderChart();
    TrendChart();
}

fetchData();
