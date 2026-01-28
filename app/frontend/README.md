<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">BookGraph Frontend</h3>

  <p align="center">
    Minimalistic cyberpunk interface for visualizing book connections and recommendations
    <br />
    <a href="http://localhost:3000"><strong>View Demo »</strong></a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#features">Features</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

BookGraph is a modern web application that helps users discover hidden connections in their reading. The frontend is built with a minimalistic neon cyberpunk aesthetic, featuring:

- **Interactive Graph Visualization**: Network graph showing connections between books and themes
- **Library Management**: Personal library with reading progress tracking
- **Smart Recommendations**: AI-powered book recommendations based on reading patterns
- **Search Functionality**: Search and add new books to your collection
- **Responsive Design**: Fully adaptive interface for all screen sizes

### Built With

The frontend is built using modern web technologies:

* [![Next.js][Next.js]][Next-url] - React framework for production
* [![React][React.js]][React-url] - JavaScript library for building user interfaces
* [![TypeScript][TypeScript]][TypeScript-url] - Typed superset of JavaScript
* [![Tailwind CSS][Tailwind]][Tailwind-url] - Utility-first CSS framework
* [react-force-graph-2d][React-force-graph-url] - Force-directed graph visualization
* [lucide-react][Lucide-url] - Beautiful & consistent icon toolkit

### Features

- 📊 **Interactive Graph**: Force-directed graph visualization with zoom and pan controls
- 📚 **Library Panel**: View and manage your book collection with progress tracking
- 🔍 **Search Modal**: Search for books and add them to your graph
- 💡 **Smart Recommendations**: Get personalized book recommendations

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

* [Node.js](https://nodejs.org/) (version 18 or higher)
* [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)

### Installation

1. Navigate to the frontend directory
   ```sh
   cd app/frontend
   ```

2. Install dependencies
   ```sh
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server
   ```sh
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

### Key Features Usage

1. **Search Books**: Enter a search query in the header and click "Search" to open the search modal
2. **Add Books**: In the search modal, click "Add to Graph" to add books to your library
3. **View Graph**: The center panel displays an interactive graph of your books and their connections
4. **Select Books**: Click on a book in the library panel or on a node in the graph to highlight it
5. **Analyze**: Click "Analies" button to analyze connections and generate recommendations



<!-- PROJECT STRUCTURE -->
## Project Structure

```
app/frontend/
├── app/
│   ├── components/          # React components
│   │   ├── GraphField.tsx   # Graph visualization component
│   │   ├── Header.tsx       # Header with search and buttons
│   │   ├── LibraryPanel.tsx # Library sidebar component
│   │   ├── RecommendationsPanel.tsx # Recommendations sidebar
│   │   └── SearchModal.tsx  # Search modal component
│   ├── hooks/               # Custom React hooks
│   │   ├── useBooks.ts      # Books state management
│   │   └── useGraph.ts      # Graph data generation
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Shared types
│   ├── utils/               # Utility functions
│   │   └── classNames.ts    # CSS class name utility
│   ├── globals.css          # Global styles and Tailwind config
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main page component
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration
└── README.md               # This file
```



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Tailwind]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[React-force-graph-url]: https://github.com/vasturiano/react-force-graph
[Lucide-url]: https://lucide.dev/

