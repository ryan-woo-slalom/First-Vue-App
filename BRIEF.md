# First-Vue-App Dashboard

## Summary

A single-page analytics dashboard built for a sports marketing / advertising company (Vantage Sports Media). Users can filter by sport, league, channel, and time period to explore 12-month advertising performance data. A product snapshot table gives a cross-sport view of all advertised products in one place.

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`, TypeScript)
- **Vuetify 3** — layout, components, dark theme
- **Chart.js 4** via **vue-chartjs** — all chart rendering
- **Vite 8** — dev server and build tooling
- **Local JSON** — all data sourced from `src/data/metrics.json` (no API calls)
- **Single page** — no Vue Router needed

## Data (`src/data/metrics.json`)

Fake dataset covering Jan–Dec 2026, structured by sport → league → monthly rows:

- `revenue` — dollar amount
- `viewers` — count, seasonally weighted by event popularity
- `conversions` — percentage rate + dollar value
- `orders` — count, correlated with viewers
- `churn` — subscriber churn rate (%), inverse of engagement seasonality
- `engagementRate` — percentage of viewers who actively engaged with an ad
- `products` — per-product breakdown across sports (revenue, orders, conversions)

## Features

- **App header** — company logo/name left, user avatar menu right
- **Global filters** — Sport, League (scoped to selected sport), Channel (Internet, TV, Radio, Print, Podcast), Time period (Full year, H1/H2, Q1–Q4)
- **Six report cards** (Revenue, Viewers, Conversion Rate, Orders, Subscriber Churn, Engagement Rate) — each with a summary KPI chip and a Chart.js chart; churn card treats a positive delta as negative (red)
- **Details modal** — opened from any report card; shows monthly breakdown table + league-level progress bars for the selected metric
- **Product snapshot** — table listing all products with revenue, orders, and conversion rate for the active filters
- **Context label** — live summary of active filter state shown above the report grid

## Layout & Style

- Dark theme by default (Vuetify dark)
- Dark/grey colour palette; white card backgrounds for data
- Cohesive chart colour palette (blue, teal, orange, violet, pink, amber)
- Google Font: Open Sans
- Mobile-responsive grid (Vuetify `v-row` / `v-col`)