# Deployment Guide

This document outlines the deployment process for the personal portfolio website hosted on GitHub Pages.

## Deployment Method

The website uses **manual deployment** through GitHub Pages with static HTML/CSS/JavaScript files. No build process or external dependencies are required.

## Prerequisites

- Git installed locally
- GitHub account with repository access
- Text editor for file modifications

## GitHub Pages Setup

### Initial Setup

1. Navigate to repository Settings
2. Scroll to "Pages" section
3. Set Source to "Deploy from a branch"
4. Select "main" branch and "/ (root)" folder
5. Click Save

### Configuration

The website is automatically deployed from the main branch root directory. GitHub Pages serves the following pages:

- `index.html` - Homepage
- `about.html` - About page  
- `projects.html` - Projects showcase
- `experience.html` - Experience page
- `contact.html` - Contact page

## Deployment Process

### Making Changes

1. Clone the repository locally:
```bash
git clone https://github.com/dhaneshbb/dhaneshbb.github.io.git
cd dhaneshbb.github.io
```

2. Edit files directly using any text editor:
   - HTML files for content changes
   - CSS files for styling updates
   - JavaScript files for functionality modifications

3. Test changes locally by opening HTML files in a browser

### Publishing Changes

1. Stage changes:
```bash
git add .
```

2. Commit changes:
```bash
git commit -m "Update website content"
```

3. Push to GitHub:
```bash
git push origin main
```

4. Changes will be live within 2-3 minutes at: https://dhaneshbb.github.io

## Automated Testing

### Lighthouse CI

The repository includes automated performance testing via GitHub Actions:

- Tests run automatically on every push to main branch
- Tests both mobile and desktop performance
- Generates detailed reports for all pages
- Reports available in Actions tab under "Lighthouse CI"

### Accessing Test Results

1. Go to repository Actions tab
2. Click on latest "Lighthouse CI" workflow run
3. View results in job logs:
   - Mobile reports in "Lighthouse Mobile" job
   - Desktop reports in "Lighthouse Desktop" job
4. Download detailed reports from Artifacts section

## File Structure

### Static Assets

All assets are served directly without processing:
- Images in `/assets/images/`
- Downloadable files in `/assets/files/`
- Stylesheets in `/css/`
- JavaScript files in `/js/`

### Configuration Files

- `.github/workflows/lighthouse.yml` - Automated testing configuration
- `LICENSE` - MIT License file
- `README.md` - Project documentation
- `robots.txt` - Search engine instructions
- `sitemap.xml` - Site structure for SEO

## Domain Configuration

### Custom Domain (Optional)

To use a custom domain:

1. Add CNAME file to repository root with domain name
2. Configure DNS settings with domain provider
3. Update GitHub Pages settings to use custom domain

### Default Domain

Current deployment URL: https://dhaneshbb.github.io

## Troubleshooting

### Common Issues

**Changes not appearing:**
- Wait 2-3 minutes for GitHub Pages to update
- Check GitHub Actions for build status
- Verify files are committed to main branch

**Performance issues:**
- Review Lighthouse CI reports in Actions tab
- Optimize images and reduce file sizes
- Minimize CSS and JavaScript files

**Page not loading:**
- Check file paths are correct and case-sensitive
- Ensure all referenced assets exist
- Validate HTML syntax

### Support

For deployment issues:
- Check GitHub Pages documentation
- Review repository Actions tab for errors
- Create issue in repository for specific problems

## Security

### Best Practices

- Keep repository public for GitHub Pages free tier
- Review all changes before committing
- Use descriptive commit messages
- Test changes locally before deployment

### Automated Monitoring

Lighthouse CI provides ongoing monitoring:
- Performance regression detection
- Accessibility compliance checking
- SEO optimization validation
- Best practices enforcement