# Biergartenradius

**Biergartenradius** helps you find the perfect meeting point for your group. Upload addresses, calculate the geographic center, and discover beer gardens, restaurants, and other locations nearby.

## Features

-   **Address Management:** Add multiple addresses to find a central meeting spot.
-   **Midpoint Calculation:** Automatically calculates the geographic center of all added locations.
-   **POI Search:** Find Points of Interest (POIs) like beer gardens, restaurants, cafes, parks, and bars around the midpoint.
-   **Direct API Integration:** Uses OpenStreetMap (Nominatim) for geocoding and Overpass API for searching places directly from your browser.
-   **Responsive Design:** Works seamlessly on desktop and mobile devices.

## Tech Stack

-   **Frontend:** React, TypeScript, Vite
-   **Styling:** Tailwind CSS, shadcn/ui
-   **Mapping:** Leaflet, React Leaflet
-   **Data Sources:** OpenStreetMap (Nominatim & Overpass API)

## Getting Started

### Prerequisites

-   Node.js (v20 or later recommended)
-   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/LetsDrinkSomeTea/biergartenradius.git
    cd biergartenradius
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and visit `http://localhost:5000`.

## Building for Production

To build the project for static hosting (e.g., GitHub Pages):

```bash
npm run build
```

The output will be in the `dist` directory.

## Deployment

This project is configured for automatic deployment to **GitHub Pages** using GitHub Actions.

1.  Push your changes to the `main` branch.
2.  Go to your repository settings on GitHub: **Settings > Pages**.
3.  Under **Build and deployment**, select **GitHub Actions** as the source.
4.  The workflow defined in `.github/workflows/deploy.yml` will automatically build and deploy the site.

## License

MIT
