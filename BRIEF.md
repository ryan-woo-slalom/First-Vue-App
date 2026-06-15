# Design Brief

## Summary

FastForward Logistics is a mid-size freight and supply chain company. Their ops team is drowning in spreadsheets. The VP of Operations wants a single internal dashboard she can pull up in leadership meetings to see how the business is running: shipment volume, on-time delivery rates, regional performance, and open exceptions. With no in-house dev team, they came to you.

## Tech
- Pure HTML, CSS, and JavaScript - no frameworks, no build tools
- Single index.html file (CSS and JS can be separate files)
- Deploys to Vercel as a static site
- Create a fake dataset as a JSON file (src/data/metrics.json) 
- Add an interactive region picker

## Design
- Working interactive prototype
- Google font: Open Sans
- Use a purple and white color scheme for the company branding but use others colors for the charts and data
- Header with the name of the company, FastForward Logistics, in the top left with an icon that represents "speed". On the top right of the Header should be the user's profile menu. The Header should have a purple to white gradient background. Header text should be purple like the company's branding.
- Separate cards that track shipment volume, on-time delivery rates, regional performance, and open exceptions
- For each of these KPI cards, add controls that allow the user to change date ranges and view data for different date ranges
- Section titles should be dark grey
- Have a button at the right bottom of each card labeled "See Details" for every card. On click, it should open a right panel containing details and further breakdowns of the KPI metric.

## Nice to Have
- Footer with copyright and FastForward Logistics logo doing the opposite gradient of the Header
