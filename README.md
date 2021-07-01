# baywheels-membership
Evaluate whether membership is worthwhile based on user ride history pattern 

## Problem statement:
As a resident in SF without a personal vehicle, my friend started using Baywheels ride share bikes and eventually decided to subscribe, believing it'd be worth it in the long run.
I was curious whether subscription is actually worth it.

## Implementation:
Tools used: shadow DOM, chart.js, CSS, Javascript

## Chrome Extension design:
User Flow:
Navigate to https://account.baywheels.com/ride-history. By default, the extension popup will appear. User can close the popup and summon as needed by clicking on the extension again.
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
  * Gives recommendation of whether the person should subscribe to the membership
  * Your Average Per Active Month table

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
