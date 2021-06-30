// assuming no lost bike charges, out of service fees

// arrays are [#, duration, $]

//var appData.summary, appData.chartData, appData.monthlyAnalysis, appData.startDate, appData.endDate

class dataClass {
    constructor() {
        this.data = {
            summary: {
                full: {
                    'firstDate': 0, 'lastDate': 0, 'days': 0, 'activeDays': 0, 
                    'classic bikes': [0,0,0], 'ebikes': [0,0,0], 'total': [0,0,0]
                },
                year: {
                    'days': 0, 'activeDays': 0, 
                    'classic bikes': [0,0,0], 'ebikes': [0,0,0], 'total': [0,0,0]
                }
            },
            chartData: { 
                monthAll: {
                    'ebikes': [0,0,0,0,0,0,0,0,0,0,0,0],
                    'classic bikes': [0,0,0,0,0,0,0,0,0,0,0,0]
                },
                daysAll: [0,0,0,0,0,0,0],
                monthSelected: {
                    'ebikes': [0,0,0,0,0,0,0,0,0,0,0,0],
                    'classic bikes': [0,0,0,0,0,0,0,0,0,0,0,0]
                },
                daysSelected: [0,0,0,0,0,0,0]
            },
            monthlyAnalysis: {},
            startDate: '',
            endDate: ''
        }
    }

    reset() {
        this.data = {
            summary: {
                full: {
                    'firstDate': 0, 'lastDate': 0, 'days': 0, 'activeDays': 0, 
                    'classic bikes': [0,0,0], 'ebikes': [0,0,0], 'total': [0,0,0]
                },
                year: {
                    'firstDate': 0, 'lastDate': 0, 'days': 0, 'activeDays': 0, 
                    'classic bikes': [0,0,0], 'ebikes': [0,0,0], 'total': [0,0,0]
                }
            },
            chartData: { 
                monthAll: {
                    'ebikes': [0,0,0,0,0,0,0,0,0,0,0,0],
                    'classic bikes': [0,0,0,0,0,0,0,0,0,0,0,0]
                },
                daysAll: [0,0,0,0,0,0,0],
                monthSelected: {
                    'ebikes': [0,0,0,0,0,0,0,0,0,0,0,0],
                    'classic bikes': [0,0,0,0,0,0,0,0,0,0,0,0]
                },
                daysSelected: [0,0,0,0,0,0,0]
            },
            monthlyAnalysis: {},
            startDate: '',
            endDate: ''
        }
        return this.data
    }
}

/*
const resetData = (appData) => {
    console.log(Object.getOwnPropertyNames(appData))
    Object.getOwnPropertyNames(appData).forEach( key => {
        console.log('key: ', key)
        if (typeof(appData[key]) === 'object') {
            if (key === 'monthlyAnalysis') appData[key] = {};
            else if (key === 'summary') {
                Object.getOwnPropertyNames(appData[key]).forEach( (subkey) => {
                    console.log('subkey: ', subkey)
                    Object.getOwnPropertyNames(appData[key][subkey]).forEach( (d) => {
                        if (d === 'classic bikes' || d === 'ebikes' || d === 'total') {
                            appData[key][subkey][d] = appData[key][subkey][d].map((v) => 0);
                            console.log('test: ', ppData[key][subkey][d])
                        }
                        else appData[key][subkey][d] = 0;
                    })
                })
            }
            else {
                Object.getOwnPropertyNames(appData[key]).forEach( (subkey) => {
                    if (subkey === 'monthAll' || subkey === 'monthSelected') {
                        console.log(appData[key][subkey])
                        appData[key][subkey] = {
                            'ebikes': [0,0,0,0,0,0,0,0,0,0,0,0],
                            'classic bikes': [0,0,0,0,0,0,0,0,0,0,0,0]
                        }
                    }
                    else appData[key][subkey] = [0,0,0,0,0,0,0]
                })
            }
        }
        else appData[key] = '';
    });
}*/

function getData(start, end) {
    var dClass = new dataClass();
    var appData = dClass.data
    appData.startDate = new Date(start.concat('T00:00:00'));
    if (!end) {
        appData.endDate = new Date(start.concat('T00:00:00'));
        appData.endDate.setFullYear(appData.endDate.getFullYear() + 1)
    }
    else appData.endDate = new Date(end.concat('T00:00:00'));

    const showMoreButton = document.querySelector("button[data-testid=DATA_TESTID_SHOW_MORE]");
    while (!showMoreButton.hasAttribute('disabled')) {
        showMoreButton.click();
    }
    const dataCard = document.querySelectorAll("div[data-testid=DATA_TESTID_RIDE_OVERVIEW_CARD]")
    // const data_card = document.querySelectorAll("div[data-testid=DATA_TESTID_RIDE_DETAILS_CONTAINER]")

    appData = analyze(dataCard, appData)
    
    var average = { 'classic bikes': [0,0,0], 'ebikes': [0,0,0] };
    
    for (bike_type in appData.monthlyAnalysis) {
        Object.keys(appData.monthlyAnalysis[bike_type]).forEach((month) => {
            average[bike_type] = appData.monthlyAnalysis[bike_type][month].map((v,i) => {
                return ( i === 2 ? roundToTwo(v + average[bike_type][i]) : v + average[bike_type][i] )
            })
        })
    };

    for (bike_type in average) {
        if (!(bike_type in appData.monthlyAnalysis)) continue;

        const num = Object.keys(appData.monthlyAnalysis[bike_type]).length
        average[bike_type] = average[bike_type].map((v,i) => {
            return ( i === 2 
                ? roundToTwo(v / num) 
                    :( i === 1
                        ? secondsToDhms( Math.round(v / num) )
                        : Math.round(v / num) 
                    ) 
            )
        })
    }

    var result = false;
    // {bike: ebike}
    const numRides = {7:0, 6:1, 5:1, 4:2, 3:3, 2:3, 1:4, 0:4}
    const temp = [average['classic bikes'], average['ebikes']];
    if (temp[1] >= numRides[temp[0]]) result = true;

    return {summary: appData.summary, chartData: appData.chartData, average: average, result: result};
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/*const analysisDataRange = (appData.startDate, appData.endDate) => {
    var start      = appData.startDate.split('-');
    var end        = appData.endDate.split('-');
    var startYear  = parseInt(start[0]);
    var endYear    = parseInt(end[0]);
  
    for(var i = startYear; i <= endYear; i++) {
      var endMonth = i != endYear ? 11 : parseInt(end[1]);
      var startMon = i === startYear ? parseInt(start[1]): 0;
      for(var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j+1) {
        var month = j+1;
        var displayMonth = month < 10 ? '0'+month : month;
        const d = new Date([i, displayMonth, '01'].join('-'));
        appData.monthlyAnalysis[monthNames[d.getMonth()]] = [0,0,0]
      }
    }
  }*/

const secondsToDhms = (seconds) => {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 3600 % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return (dDisplay + hDisplay + mDisplay + sDisplay).replace(/,\s*$/, "");
}

const roundToTwo = (num) => +(Math.round(num + "e+2")  + "e-2");

const analyze = (data, appData) => {
    const trips = data.length;
    const firstDate = new Date(data[0].innerText.split('\n')[0])
    appData.summary.full['firstDate'] = firstDate;
    const lastDate = new Date(data[trips-1].innerText.split('\n')[0])
    appData.summary.full['lastDate'] = lastDate;
    const today = new Date();
    const oneDay = 1000 * 60 * 60 * 24; // (in milliseconds)
    appData.summary.full['days'] = Math.floor((today - lastDate) / oneDay);
    var activeDaysSet = new Set();
    var activeDaysSelectedSet = new Set();

    const keys = ['total', 'classic bikes', 'ebikes']
    
    for (row of data) {
        // 1) get type of bike to calculate
        // 2) use duration 
        const split = row.innerText.split('\n');
        const date = split[0];
            activeDaysSet.add(date);
            var [month, day, year] = date.split(' ');
            day = day.slice(0,-1);
        var price = Number(split[1].split(':')[1].trim().replace('$', ''));
        const time = split[2].match(/(\d{1,2}):(\d{1,2}) (\w{2})/);
        var duration = split[3].split(':')[1].trim();
            var hms = duration.match(/\d+/g).map(v => Number(v));
            if (hms.length === 2) hms = [0].concat(hms);
            [hr, min, sec] = hms
            duration = (hr * 60 * 60) + (min * 60) + sec;
        var bike = split[4];
            const values = [1, duration, price]
            const isEbike = bike.includes('-');
            for (var i = 0; i < keys.length; i++) {
                if ((isEbike && i === 1) || (!isEbike && i === 2)) continue;
                appData.summary.full[keys[i]] = appData.summary.full[keys[i]].map((v, j) => {
                    if (j === 2) return roundToTwo(v + values[j]);
                    else return v + values[j];
                })
            }

        // Count # of rides per weekday
        //ar weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var currentDate = getCurrentDate(date, time);
            appData.chartData.daysAll[currentDate.getDay()] += 1;
        
        // Add to month appData.summary
        const monthName = monthNames[currentDate.getMonth()];
        if (isEbike) appData.chartData.monthAll['ebikes'][currentDate.getMonth()] += 1
        else appData.chartData.monthAll['classic bikes'][currentDate.getMonth()] += 1

        if (withinRange(currentDate, appData.startDate, appData.endDate)) {
            if (isEbike) appData.chartData.monthSelected['ebikes'][currentDate.getMonth()] += 1
            else appData.chartData.monthSelected['classic bikes'][currentDate.getMonth()] += 1
            appData.chartData.daysSelected[currentDate.getDay()] += 1;

            activeDaysSelectedSet.add(date);
            appData.summary.year['days'] = Math.floor((appData.endDate - appData.startDate) / oneDay);

            for (var i = 0; i < keys.length; i++) {
                if ((isEbike && i === 1) || (!isEbike && i === 2)) continue;
                appData.summary.year[keys[i]] = appData.summary.year[keys[i]].map((v, j) => {
                    if (j === 2) return roundToTwo(v + values[j]);
                    else return v + values[j];
                })
            }
            
            if (isEbike) {
                if (! ('ebikes' in appData.monthlyAnalysis)) 
                    appData.monthlyAnalysis['ebikes'] = {[monthName]: values}
                else {
                    if (!(monthName in appData.monthlyAnalysis['ebikes']))
                        appData.monthlyAnalysis['ebikes'] = {...appData.monthlyAnalysis['ebikes'], ...{[monthName]: values} };
                    appData.monthlyAnalysis['ebikes'][monthName] = appData.monthlyAnalysis['ebikes'][monthName].map((v, i) => {
                        return (i === 2 ? roundToTwo(v + values[i]) : v + values[i]);
                    })
                }
            }
            else {
                if (! ('classic bikes' in appData.monthlyAnalysis))
                    appData.monthlyAnalysis['classic bikes'] = {[monthName]: values}
                else {
                    if (!(monthName in appData.monthlyAnalysis['classic bikes']))
                        appData.monthlyAnalysis['classic bikes'] = {...appData.monthlyAnalysis['classic bikes'], ...{[monthName]: values} };
                    else {
                        appData.monthlyAnalysis['classic bikes'][monthName] = appData.monthlyAnalysis['classic bikes'][monthName].map((v, i) => {
                            return (i === 2 ? roundToTwo(v + values[i]) : v + values[i]);
                        })
                    }
                }
                /*
                appData.monthlyAnalysis['classic bikes'][monthName] = appData.monthlyAnalysis[monthName].map((v, i) => {
                    if (i === 2) return roundToTwo(v + values[i]);
                    else return v + values[i];
                });*/
            }
            /*var monthYear = month.concat(' ', year)
            if (!yearappData.summary.hasOwnProperty(monthYear)) yearappData.summary[monthYear] = calculate(bike, duration);
            else yearappData.summary[monthYear] += calculate(bike, duration);*/
        }
        
    }
    
    appData.summary.full['activeDays'] = activeDaysSet.size;
    appData.summary.year['activeDays'] = activeDaysSelectedSet.size;

    for (var i = 0; i < keys.length; i++) {
        if (appData.summary.full[keys[i]][1] !== 0) appData.summary.full[keys[i]][1] = secondsToDhms(appData.summary.full[keys[i]][1])
        if (appData.summary.year[keys[i]][1] !== 0) appData.summary.year[keys[i]][1] = secondsToDhms(appData.summary.year[keys[i]][1])
    }
    return appData
}

const getCurrentDate = (date, time) => {
    var [startHr, startMin, ampm]= time.slice(1,4);
    if (ampm == "PM" && startHr < 12) startHr = String(Number(startHr) + 12);
    if (ampm == "AM" && startHr == 12) startHr = String(Number(startHr) - 12);
    var militaryTime = startHr.concat(':', startMin);
    var currentDate = new Date(date.concat(" ", militaryTime));
    return currentDate;
}

const withinRange = (date, start, end) =>  (date <= end && date >= start) ? true: false;
//const withinRange = (date) =>  (date < appData.endDate && date >= appData.startDate) ? true: false;

/*
const regular = {rideFee: 0.20, overage: 3, includedTime: 30};
const mb = {rideFee: 0.15, overage: 2, includedTime: 45};

const calculateCost = ( type, [hr, min, sec], ebike=false ) => {
    var cost = 0;
    var time = (hr * 60 * 60) + (min * 60) + sec;
    if (time < type.includedTime * 60 ) {
        (ebike) ? cost += parseFloat((min * type.rideFee).toFixed(2)) : cost += 0;
    }
    else {
        if (ebike) cost += type.includedTime * type.rideFee;
        time -= type.includedTime * 60;
        while (time > 0) {
            cost += type.overage;
            time -= 15 * 60;
        }
    }
    return cost;
}

// date is in format of month year

const calculate = (bike, duration) => {
    var unlock_fee = 2;
    var time = duration.match(/\d+/g).map(v => Number(v));
    if (time.length === 2) time = [0].concat(time);

    if (bike.includes('-')) {
        console.log("this is an ebike");
        var nonMb = unlock_fee + calculateCost(regular, time, true);
        data['total-without-mb'] += nonMb;
        data['total-with-mb'] += calculateCost(mb, time, true);
    }
    else {
        console.log("this is a normal bike")
        var nonMb = unlock_fee + calculateCost(regular, time);
        data['total-without-mb'] += nonMb;
        data['total-with-mb'] += calculateCost(mb, time);
    }
    return nonMb;
} */