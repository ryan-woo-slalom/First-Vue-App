# First-Vue-App Dashboard

## Summary

A single page analytics dashboard for a company in the advertising business that is heavily driven towards the sports marketing. The team wants a dashboard that allows the user to select different sports where they are advertising their products, and then the breakdown of the leagues from the different sports. They also want to be able to see all their products in a single snapshot view on this dashboard. 


## Data
Generate a fake dataset as a JSON file (src/data/metrics) with 12 months of data (Jan-Dec 2026), each month containing: 
- revenue (dollara amount, trending direction)
- viewers (number, seasonal pattern including on event popularity)
- conversions (percentages, dollar value)
- orders (number, correlates with viewers)

## Layout (Vuetify)
- Working interactive prototype
- Header on top of dashboard including company logo on left and user profile menu on the right
- Global filters for sport, leagues within any given sport, channel (includes things like Internet, Radio, TV, etc) and time filter
- Four reports that default to showing time frame within the selected time filter
- Google font: Open Sans
- Have a button at the bottom of each report card that opens up details in a modal

## Style
- Dark theme by default
- Mobile responsive
- Lots of darks and greys for colour palette but white background for data
- Charts should have a cohesive colour palette

## Tech
- Vue 3 + TypeScript + Vuetify3
- Chart.js via vue-chartjs for all charts
- Fake data from a local JSON (no API calls)
- Single page - no routing needed for this app