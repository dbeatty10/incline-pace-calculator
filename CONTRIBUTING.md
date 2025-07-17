
# Contributing to Incline Pace Calculator

Thank you for your interest in contributing to the Incline Pace Calculator project! This guide will help you get started with local development.

## Local Development Setup

### Prerequisites

- Python 3.6 or higher installed on your system
- A web browser for testing

### Running the Project Locally

Since this is a static HTML/CSS/JavaScript project, you can serve it locally using Python's built-in HTTP server.

#### Option 1: Using Python 3 (Recommended)

```bash
# Navigate to the project directory
cd incline-pace-calculator

# Start the server on port 8080 (assuming port 8000 is already in use)
python -m http.server 8080
```

#### Option 2: Using Python 2 (if Python 3 is not available)

```bash
# Navigate to the project directory
cd incline-pace-calculator

# Start the server on port 8080
python -m SimpleHTTPServer 8080
```

### Accessing the Application

Once the server is running, open your web browser and navigate to:
```
http://localhost:8080
```

You should see the main calculator suite page with links to all available calculators.

### Alternative Ports

If port 8080 is also in use, you can specify any available port:

```bash
# Example using port 3000
python -m http.server 3000

# Example using port 9000
python -m http.server 9000
```

Then access the application at `http://localhost:[PORT]` where `[PORT]` is your chosen port number.

## Development Workflow

1. **Fork the repository** (if contributing to the main project)
2. **Clone your fork** or the main repository
3. **Start the local server** using the instructions above
4. **Make your changes** to the HTML, CSS, or JavaScript files
5. **Test your changes** by refreshing the browser
6. **Submit a pull request** with your improvements

## Project Structure

```
incline-pace-calculator/
├── index.html                        # Main landing page
├── flat_to_treadmill.html           # Flat pace to treadmill equivalents
├── hill_to_flat.html                # Hill pace to flat pace (GAP)
├── flat_to_hill.html                # Flat pace to hill pace
├── pace_to_grade.html               # Pace to grade estimator
├── elevation_to_gradient.html       # Elevation to gradient calculator
├── weight_adjusted_speed.html       # Weight-adjusted speed calculator
├── mph_to_pace.html                 # MPH to pace converter
├── kph_to_pace.html                 # KPH to pace converter
├── pace_adjusted_effort.html        # Pace adjusted effort calculator
├── README.md
└── CONTRIBUTING.md                  # This file
```

## Tips for Development

- Changes to HTML/CSS/JS files will be reflected immediately after refreshing the browser
- Use your browser's developer tools for debugging
- Test your changes across different browsers if possible
- Ensure all calculator links work correctly from the main page
- Test calculations with various input values to ensure accuracy

## Troubleshooting

### Port Already in Use Error
If you get an error that the port is already in use, try a different port number:
```bash
python -m http.server 8081
```

### Python Not Found
Make sure Python is installed and added to your system PATH. You can check by running:
```bash
python --version
```

### Browser Caching Issues
If changes aren't appearing, try:
- Hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache
- Use incognito/private browsing mode

## Hosting on GitHub Pages

If you want to host your own version of this project on GitHub Pages:

### Prerequisites
- A GitHub account
- Your code pushed to a GitHub repository

### Setup Steps

1. **Go to your repository settings** on GitHub
2. **Navigate to "Pages"** in the left sidebar
3. **Under "Source"**, select "Deploy from a branch"
4. **Choose "main" branch** and "/ (root)" folder
5. **Click "Save"**

### After Setup
- GitHub Pages will automatically build and deploy your site
- Your site will be available at: `https://[username].github.io/[repository-name]/`
- It may take a few minutes for the site to become available
- You'll see a green checkmark in the Pages settings when it's ready

### Updating the Live Site
- Any commits pushed to the main branch will automatically update the live site
- Changes typically take 1-2 minutes to appear on the live site

### Custom Domain (Optional)
If you want to use a custom domain:
1. Add a `CNAME` file to your repository root with your domain name
2. Configure your domain's DNS settings to point to GitHub Pages
3. Enable "Enforce HTTPS" in the Pages settings

## Questions or Issues?

If you encounter any problems or have questions about contributing, please open an issue on the project repository.
