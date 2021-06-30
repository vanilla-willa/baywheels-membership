function formatDate(date) {
  const offset = new Date().getTimezoneOffset();
  var timezoneDate = new Date(date)
    timezoneDate.setMinutes(timezoneDate.getMinutes() + offset)
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    timezoneDate = timezoneDate.toLocaleDateString('en-US', options);
  return timezoneDate;
}

/* https://github.com/oslego/chrome-extension-custom-element */
class Popup extends HTMLElement {
  constructor() {
    super();
    this.addResults = this.addResults.bind(this);
    // Create a shadow root
    this.shadow = this.attachShadow({mode: 'closed'});
    this.shadow.innerHTML = `
      <link rel="stylesheet" href="chrome-extension://pkempffnmnjbghkdadjfolkcfdmdbkfa/style.css">
      <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.0"> </script>
      <div class="bap-wrapper">
        <span id='bap-left-border'></span>
        <div class="bap-header">
          <h6 class="bap-header-text">Baywheels Analysis Popup</h6>
          <span class="bap-spacer"></span>
          <span id="bap-close"></span>
        </div>
        <div class='bap-body' id='bap-body'>
          <div id="instruction">
            Select range (up to one year) to analyze. <br/>
            If no end date is selected, it will analyze up to one year after the start date.
          </div>
          <div id='input'>
            <div class='date-input'>
              <label for='start'> Start Date </label>
              <input type='date' id='start' class='date-input' required>
            </div>
            <div class='date-input'>
                <label for='end'> End Date </label>
                <input type='date' id='end' class='date-input' disabled>
            </div>
          </div>
          <div id='buttons'>
            <button type='submit'> Submit </button>
            <button type='reset' disabled> Reset </button>
          </div>
        </div>
      </div>
    `
    /* <div id='bap-sf-lineart'></div> */
  }

  connectedCallback() {
    this.shadow.getElementById('bap-close').addEventListener("click", () => this.remove() );
    const showMoreButton = document.querySelector("button[data-testid=DATA_TESTID_SHOW_MORE]");
    while (!showMoreButton.hasAttribute('disabled')) {
        showMoreButton.click();
    }
    const cards = document.querySelectorAll("div[data-testid=DATA_TESTID_RIDE_OVERVIEW_CARD]")
    const lastDate = cards[cards.length-1].firstChild.firstChild.innerText

    this.shadow.getElementById('start').min = new Date(lastDate).toISOString().split("T")[0]
    this.shadow.getElementById('start').max = new Date().toISOString().split("T")[0];
    this.shadow.getElementById('start').addEventListener("input", (e) => {
      this.startDate = e.target.value;
      this.shadow.getElementById('start').setAttribute('value', this.startDate);
      this.shadow.getElementById('end').disabled = false;
      this.shadow.getElementById('end').removeAttribute('disabled');
      this.shadow.getElementById('end').setAttribute('min', this.startDate);
      var endDate = this.startDate.split('-');
      endDate[0] = String(Number(endDate[0]) + 1);
      endDate = endDate.join('-');
      const today = new Date().toISOString().split("T")[0];
      if (endDate > today) endDate = today;
      this.shadow.getElementById('end').setAttribute('max', endDate);
      this.endDate = endDate;
    });

    this.shadow.getElementById('end').addEventListener("input", (e) => {
      this.endDate = e.target.value;
      this.shadow.getElementById('end').setAttribute('value', this.endDate);
    });

    this.reset = this.shadow.querySelector('[type="reset"]');
    this.submit = this.shadow.querySelector('[type="submit"]');

    this.reset.addEventListener('click', e => {
      this.shadow.getElementById('start').value = '';
      this.shadow.getElementById('end').value = '';
      this.shadow.getElementById('start').removeAttribute('value');
      this.shadow.getElementById('end').removeAttribute('value');
      this.shadow.getElementById('end').removeAttribute('max');
      this.shadow.getElementById('end').removeAttribute('min');
      this.shadow.getElementById('end').setAttribute('disabled', 'true');
      var results = this.shadow.getElementById('bap-body').getElementsByTagName('tab-results');
      if (results.length) results[0].remove();
      this.shadow.querySelector('[type="reset"]').setAttribute('disabled', 'true');
    });

    this.submit.addEventListener('click', () => {
      if (!this.shadow.getElementById('start').value) console.log("error")
      else {
        this.shadow.querySelector('[type="reset"]').removeAttribute('disabled');
        this.addResults()
      }
    });
  }

  disconnectedCallback() {

  }
  
  addResults() {
    var results = this.shadow.getElementById('bap-body').getElementsByTagName('tab-results');
    if (results[0]) results[0].parentNode.removeChild(results[0])

    const dateRow = this.shadow.getElementById('bap-body');
    const spacer = dateRow.appendChild(document.createElement('div'));
    spacer.className = 'bap-result-spacer'

    const toggle = document.createElement('label');;
    toggle.innerHTML = `
      <input type="checkbox" id="switch">
      <div class="label-text">
        <span>Check to see data for all dates</span>
      </div>`
    if (!this.shadow.getElementById('switch')) dateRow.appendChild(toggle)

    const data = dateRow.appendChild(document.createElement('tab-results'));
    data.addData();

    const updateData = (option) => {
      var update = this.shadow.getElementById('days-table').getElementsByTagName('tr')
          update[1].children[1].innerHTML = data.data.summary[option][update[1].children[0].innerHTML]
          update[2].children[1].innerHTML = data.data.summary[option]['activeDays']
        update = this.shadow.getElementById('bike-table').getElementsByTagName('tr')
      for (var i = 1; i < update.length; i++ ) {
        update[i].children[1].innerHTML = data.data.summary[option][update[i].children[0].innerHTML][0]
        update[i].children[2].innerHTML = data.data.summary[option][update[i].children[0].innerHTML][1]
        update[i].children[3].innerHTML = data.data.summary[option][update[i].children[0].innerHTML][2]
      }
    }

    this.shadow.getElementById('switch').addEventListener('click', (event) => {
      if (event.currentTarget.checked) {
        updateData('full');
        this.shadow.getElementById('tab1header').textContent = formatDate(data.data.summary.full.lastDate) + ' - ' +  formatDate( new Date() );
      } else {
        updateData('year')
        this.shadow.getElementById('tab1header').textContent = formatDate(data.startDate) + ' - ' +  formatDate( data.endDate );
      }
    })
  } 
}

// Create currency formatter
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}); //currency.format(value)

class TabResults extends HTMLElement  {
  constructor() {
    // Always call super first in constructor
    super();
    this.startDate = '';
    this.endDate = '';
    this.showTab = this.showTab.bind(this);
    this.addData = this.addData.bind(this);
    this.data = '';
    this.innerHTML = `
        <div class="tab">
          <button class="tab-option active" id='summary-tab'> Summary </button>
          <button class="tab-option" id='charts-tab'> Visualizations </button>
          <button class="tab-option" id='analysis-tab'> Worth It? </button>
        </div>

        <div id="default" class="tab-content" style='display: block;'></div>
        <div id="charts" class="tab-content" style='display: none;'></div>
        <div id="analysis" class="tab-content" style='display: none;'></div>
    `;
  }

  addData() {
    var shadow = this.getRootNode();
    var startDate = shadow.host.startDate;
    var endDate = shadow.host.endDate;
    this.startDate = new Date(startDate.concat('T00:00:00'));
    this.endDate = new Date(endDate.concat('T00:00:00'));
    shadow.getElementById('summary-tab').addEventListener("click", (e) => {this.showTab(e, 'default');});
    shadow.getElementById('charts-tab').addEventListener("click", (e) => {this.showTab(e, 'charts'); });
    shadow.getElementById('analysis-tab').addEventListener("click", (e) => {this.showTab(e, 'analysis'); });
    this.data = getData(startDate, endDate);
    console.log('data: ', this.data)
    
    const {days, activeDays, ...yearBikeData} = this.data.summary.year;

    const avg = this.data.average;
    const result = this.data.result;
    
    const tab1header = shadow.getElementById('default').appendChild(document.createElement('p'));
    tab1header.className = 'date';
    tab1header.id = 'tab1header'
    tab1header.textContent = formatDate(this.startDate) + ' - ' +  formatDate(this.endDate);
    //formatDate(this.data.startDate) + ' - ' +  formatDate( this.data.endDate );
    //tab1header.textContent = formatDate(lastDate) + ' - ' +  formatDate(firstDate);
    const spacer1 = tab1header.appendChild(document.createElement('div'));
      spacer1.className = 'bap-result-spacer'

    shadow.getElementById('default').innerHTML += `
      <table id='days-table'>
        <caption>Days</caption>
        <thead>
          <tr>
            <th></th>
            <th>#</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
      `

    var body = shadow.getElementById('days-table').getElementsByTagName('tbody')[0];
    var row = body.insertRow()
    var col = row.insertCell(0);
    col.innerHTML = 'days';
    col = row.insertCell(1);
    col.innerHTML = this.data.summary.year.days;
    row = body.insertRow()
    col = row.insertCell(0);
    col.innerHTML = 'active days';
    col = row.insertCell(1);
    col.innerHTML = this.data.summary.year.activeDays;

    shadow.getElementById('default').innerHTML += `
      <br>
      <table id='bike-table'>
        <caption>Bikes</caption>
        <thead>
          <tr>
            <th></th>
            <th>#</th>
            <th>duration</th>
            <th>$</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
      `
    for (const obj in yearBikeData) {
      var body = shadow.getElementById('bike-table').getElementsByTagName('tbody')[0];
      var row = body.insertRow()
      var col1 = row.insertCell(0);
      col1.innerHTML = obj;
      yearBikeData[obj].map((d, i) => {
        var col = row.insertCell(i+1);
        col.innerHTML = d
      })
    }

    const tab2header = shadow.getElementById('charts').appendChild(document.createElement('p'));
    tab2header.className = 'date';
    tab2header.id = 'tab2header'
    tab2header.textContent = formatDate(this.startDate) + ' - ' +  formatDate(this.endDate);
    const spacer2 = tab2header.appendChild(document.createElement('div'));
      spacer2.className = 'bap-result-spacer';
    shadow.getElementById('charts').innerHTML += `
        <div style="height: 200px">
          <canvas id="monthly-frequency" ></canvas>
        </div>
        <div style="height: 200px">
          <canvas id="day-frequency" ></canvas>
        </div>
    `

    let max1 = Math.max.apply(null, this.data.chartData.monthAll['ebikes']);
    let max2 = Math.max.apply(null, this.data.chartData.monthAll['classic bikes'])
    const maxY = Math.max(max1, max2)

    var bar = shadow.getElementById('monthly-frequency');
    var barChartData = {
      /*labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],*/
      labels: [1,2,3,4,5,6,7,8,9,10,11,12],
      datasets: [{
        label: 'ebikes',
        backgroundColor: 'rgb(255, 0, 191)',
        data: this.data.chartData.monthAll['ebikes']
      }, {
        label: 'classic bikes',
        backgroundColor: 'rgba(30,144,200,255)',
        data: this.data.chartData.monthAll['classic bikes']
      }]
    }
    var barChart = new Chart(bar, {
        type: 'bar',
        data: barChartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Monthly Frequency' },
              legend: {display: true, position: 'bottom'}
            },
            tooltips: {enabled: true, intersect: false, mode: 'index'},
            scales: {
                x: {
                  display: true,
                  title: {
                    display: true,
                    text: 'Month'
                  },
                },
                y: {
                    display: true,
                    title: {
                      display: true,
                      text: "Number of bikes"
                    },
                    ticks: {max: maxY + 2 ,stepSize: 1},
                    padding: {top: 30, left: 0, right: 0, bottom: 0},
                    beginAtZero: true
                }
            }
        }
    });

    var pie = shadow.getElementById('day-frequency');
    var pieChart = new Chart(pie, {
      type: 'pie',
      data: {
        labels: ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'],
        datasets: [{
          label: 'My First Dataset',
          data: this.data.chartData.daysAll,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Day Frequency' },
          legend: {display: true, position: 'left'}
        },
      }
    })
    /*
    var pieChart = new Chart(pie, {
      type: 'pie',
      data: {datasets: pieChartData},
      /*options: {
        title: {
          display: true,
          text: 'Day Frequency',
          position: top
        }
        /*
        plugins: {
          datalabels: {
            formatter: (value, ctx) => {
              let sum = 0;
              let dataArr = ctx.chart.data.datasets[0].data;
              dataArr.map(data => {sum += data;});
              let percentage = (value * 100 / sum).toFixed(2) + "%";
              return percentage;
            },
            color: '#fff',
          }
        }
      }
    })*/
    
    const tab3header = shadow.getElementById('analysis').appendChild(document.createElement('p'));
    tab3header.className = 'date';
    tab3header.textContent = formatDate(new Date(startDate.concat('T00:00:00'))) + ' - ' +  formatDate(new Date(endDate.concat('T00:00:00')));
    const spacer3 = tab3header.appendChild(document.createElement('div'));
      spacer3.className = 'bap-result-spacer'

    shadow.getElementById('analysis').innerHTML += `<div class='bap-result-space'></div> `
    if (result) shadow.getElementById('analysis').innerHTML += ` <h3 id='mb-yes'> &#10003; You should get membership </h3>`  
    else shadow.getElementById('analysis').innerHTML += `<h3 id='mb-no'> &#10007; You may not want to get membership </h3>`

    shadow.getElementById('analysis').innerHTML += `
      <p> Your average stats per active month: </p>
      <table id='avg-table'>
        <caption>Your Average Per Active Month</caption>
        <thead>
          <tr>
            <th></th>
            <th>#</th>
            <th>duration</th>
            <th>$</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
      `
      for (const obj in avg) {
        var body = shadow.getElementById('avg-table').getElementsByTagName('tbody')[0];
        var row = body.insertRow()
        var col1 = row.insertCell(0);
        col1.innerHTML = obj;
        avg[obj].map((d, i) => {
          var col = row.insertCell(i+1);
          col.innerHTML = d
        })
      }

      shadow.getElementById('analysis').innerHTML += `
        <div>
          <p>After sampling Lyft's public data, the average bike ride is as shown:</p>
          <table id='lyft-data-table'>
          <caption>Consumer's Average Bike Ride</caption>
          <thead>
            <tr>
              <th></th>
              <th>non-member</th>
              <th>member</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>classic bikes</td>
              <td>32 min</td>
              <td>17 min</td>
            </tr>
            <tr>
              <td>ebikes</td>
              <td>13-15 min</td>
              <td>12-13 min</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p> With membership at $13.25/month or $159 yearly, membership is worth it if <b>on average per month</b>, your bikeshare pattern is at least:</p>
        <ul>
          <li> 7 classic bikes a month </li>
          <li> 4 ebikes averaging 12-13 minutes </li>
          <li> Some combination of the two </li>
        </ul>
      <p>The following table displays the list of minimum combinations.*</p>
      <p id='note'>*Calculated based on the average classic bike rides of 32 minutes and average ebike rides of 12-13 min </p>
      <table id='num-rides-data-table'>
        <caption>Min. # of Rides / Month</caption>
        <thead>
          <tr>
            <th>classic bikes</th>
            <th>ebikes</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
    `
    const numRides = [[7,0], [6,1], [5,1], [4,2], [3,3], [2,3], [1,4], [0,4]];
    numRides.forEach((v,i) => {
      var body = shadow.getElementById('num-rides-data-table').getElementsByTagName('tbody')[0];
      var row = body.insertRow();
      numRides[i].map((d, j) => {
        var col = row.insertCell(j);
        col.innerHTML = d
      })
    })
    /*
    for (const obj in avg) {
      var body = shadow.getElementById('num-rides-data-table').getElementsByTagName('tbody')[0];
      var row = body.insertRow()
      var col1 = row.insertCell(0);
      col1.innerHTML = obj;
      avg[obj].map((d, i) => {
        var col = row.insertCell(i+1);
        col.innerHTML = d
      })
    }*/

    shadow.getElementById('default').click();
  }

  showTab(e, tabName) {
    // Declare all variables
    var i, tabContent, tabOption;
  
    // Get all elements with class="tabcontent" and hide them
    tabContent = this.getRootNode().querySelectorAll('.tab-content');
    for (i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tabOption = this.getRootNode().querySelectorAll('.tab-option');
    for (i = 0; i < tabOption.length; i++) {
      tabOption[i].className = tabOption[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    this.getRootNode().getElementById(tabName).style.display = "block"
    /*
    if (tabName === 'default') this.getRootNode().getElementById(tabName).style.display = "flex";
    else this.getRootNode().getElementById(tabName).style.display = "block";*/
    e.currentTarget.className += " active";
  }
}

const showPopup = () => {
  if (! document.getElementsByTagName('baywheels-analysis-popup').length) {
    const popup = document.createElement('baywheels-analysis-popup')
    popup.setAttribute('style', 'position: fixed; top: 140px; right: 25px; z-index: 2147483647; border-top-left-radius: 4px');
    document.body.appendChild(popup);
  }
}

// Define the new element
customElements.define('baywheels-analysis-popup', Popup);
customElements.define('tab-results', TabResults);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'show popup') showPopup();
  if (message.action === 'remove popup') {
    var popup = document.getElementsByTagName('baywheels-analysis-popup');
    if (popup.length) popup[0].remove();
  }
});