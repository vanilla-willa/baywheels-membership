# baywheels-membership
Evaluate whether membership is worthwhile based on user ride history pattern 

## Problem statement:
As a resident in SF without a personal vehicle, my friend started using Baywheels ride share bikes and eventually decided to subscribe, believing it'd be worth it in the long run.
I was curious whether subscription is actually worth it.

## Implementation:
Tools used: shadow DOM, chart.js, CSS, Javascript

## User Flow:
Navigate to https://account.baywheels.com/ride-history.  
By default, the extension popup will appear. User can close the popup and summon as needed by clicking on the extension again.  
Choose a date range. Only required to pick a start date.  
Earliest start date is restricted to the first bike ride in the user's history.  
The latest end date that can be selected is restricted to either the current date (user's local time) or a year after the selected start date, whichever occurs first.  

After submitting the date ranges, the result section appears underneath with three tabs and the following data for the selected date ranges:
* Summary
  * Days Table
    * days - calculates # of days between the selected start and end date
    * active days - calculates # of days user had at least one bike ride
  * Bike Table - shows total number of bikes, total duration, and total cost separated by bike type
    * classic bikes 
    * ebikes
    * total - classic bikes + ebikes data
* Visualizations
  * Month Frequency bar chart - shows the aggregate number of bikes taken per month
  * Day Frequency pie chart - shows the aggregate number of bikes taken per day of the week
* Worth it?
  * Only analyzes the selected date range
  * Gives recommendation of whether the person should subscribe to the membership based on the following analysis
    * Your Average Per Active Month table
      * Calculated based on up to a year's worth of data and calculated on a per month basis within the year 
      * Active month means only months where the user had at least one bike ride. For example, a date range of February to May where the user was only active in February and March would result in calculating the total in February and the total in March, adding the totals, and dividing the result by 2, since there are only 2 active months.
    * Consumer's Average Bike Data was calculated with Lyft's public data in 2021 (Note: Lyft only started segregating by bike type in April 2020)
    * Based on the consumer's average bike data, with membership at $13.25/month or $159 yearly, the minimum # of rides per month should be at least: 
      * 7 classic bikes a month
      * 4 ebikes averaging 12-13 minutes
      * Some combination of the two
      * Reference Table
        classic bikes  | ebikes
        ------------- | -------------
        7 | 0
        6 | 1
        5 | 1
        4 | 2
        3 | 3
        2 | 3
        1 | 4
        0 | 4


By default, the data displayed is the selected date range. There is a checkbox that the user can use to toggle between the selected date range and the user's entire ride history date range. The toggles update the data for the Summary and Visualization tabs.

## Demo:

![demo](https://github.com/vanilla-willa/baywheels-membership/blob/main/demo.gif)

## Improvements / TBD:
Extension is functional and does what I intended it to do, but there are potential improvements to the experience and design, such as:
- currently there are chrome extension error messages (app is still functional)
- bug: selecting end date does not include the date ie. selecting 02/14/2021 does not include 02/14/2021 data in analysis
- bug: add feedback to UI when user does not select a start date
- tooltip not working in charts
- show values on charts
- calculate total saved if membership recommended
- test on more comprehensive ride history (only tested on my personal ride history, but I don't live in SF)
- personalize the membership recommendation (since calculations were based on average consumer data rather than individual personal data for time-saving purposes)
