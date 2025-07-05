# Setup Guide

Complete setup guide for the Dhanesh B.B. Portfolio website.

## Prerequisites

### System Requirements

| Requirement | Minimum Version | Recommended           |
| ----------- | --------------- | --------------------- |
| **Node.js** | 14.0.0          | 18.17.0+              |
| **NPM**     | 6.0.0           | 9.0.0+                |
| **Git**     | 2.20.0          | Latest                |
| **Browser** | Modern browser  | Chrome/Firefox latest |

### Development Tools (Optional)

- **Visual Studio Code** with extensions:
  - Live Server
  - Prettier
  - ESLint
  - HTML CSS Support
- **Chrome DevTools** for debugging
- **Figma** for design reference

## Installation Steps

### 1. Clone Repository

```bash
# HTTPS
git clone https://github.com/dhaneshbb/dhanesh-portfolio.git

# GitHub CLI
gh repo clone dhaneshbb/dhanesh-portfolio

cd dhanesh-portfolio
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Alternative: Clean install
npm ci

# Verify installation
npm list --depth=0
```

### 3. Environment Setup

Create environment configuration (if needed):

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### 4. Verify Setup

```bash
# Check Node.js version
node --version

# Check NPM version
npm --version

# Run health check
npm run version
```

## Development Server

### Start Development

```bash
# Method 1: NPM script
npm start

# Method 2: Live server
npm run dev

# Method 3: Python server
python -m http.server 3000

# Method 4: VS Code Live Server
# Right-click index.html > "Open with Live Server"
```

### Access Website

- **Local URL**: http://localhost:3000
- **Network URL**: http://[YOUR_IP]:3000

### Development Features

- ✅ **Hot Reload** - Automatic refresh on changes
- ✅ **Error Overlay** - Display errors in browser
- ✅ **Source Maps** - Debug original code
- ✅ **Live CSS** - Instant CSS updates

## 📁 Project Structure Deep Dive

```
dhanesh-portfolio/
├── 📄 index.html                 # Main homepage
├── 📄 about.html                 # About page
├── 📄 projects.html              # Projects showcase
├── 📄 experience.html            # Work experience
├── 📄 contact.html               # Contact information
├── 📄 offline.html               # Offline fallback page
│
├── 📁 assets/                    # Static assets
│   ├── 📁 images/               # Images and graphics
│   │   ├── 📄 dhanesh_profile.jpg    # Profile photo
│   │   ├── 📄 favicon.ico            # Site icon
│   │   ├── 📁 projects/              # Project screenshots
│   │   ├── 📁 certificates/          # Certificate images
│   │   └── 📁 icons/                 # Custom icons
│   │
│   ├── 📁 files/                # Downloadable files
│   │   ├── 📄 Dhanesh_BB_Resume.pdf  # Resume PDF
│   │   └── 📁 project-docs/          # Project documentation
│   │
│   └── 📁 data/                 # Data files
│       └── 📄 portfolio-data.json    # Portfolio content data
│
├── 📁 css/                      # Stylesheets
│   ├── 📄 main.css              # Main styles and variables
│   ├── 📄 components.css        # Reusable components
│   ├── 📄 responsive.css        # Responsive design rules
│   └── 📄 animations.css        # Animation definitions
│
├── 📁 js/                       # JavaScript files
│   ├── 📄 main.js               # Main application logic
│   ├── 📄 components.js         # Component functionality
│   ├── 📄 animations.js         # Animation controllers
│   └── 📄 utils.js              # Utility functions
│
├── 📁 docs/                     # Documentation
│   ├── 📄 SETUP.md              # This file
│   ├── 📄 DEPLOYMENT.md         # Deployment guide
│   ├── 📄 MAINTENANCE.md        # Maintenance procedures
│   └── 📄 CHANGELOG.md          # Version history
│
├── 📁 .github/                  # GitHub specific
│   ├── 📁 workflows/            # GitHub Actions
│   │   └── 📄 deploy.yml        # CI/CD pipeline
│   └── 📄 ISSUE_TEMPLATE.md     # Issue template
│
├── 📁 dist/                     # Built files (generated)
├── 📁 reports/                  # Test reports (generated)
├── 📁 node_modules/             # Dependencies (generated)
│
├── 📄 package.json              # NPM configuration
├── 📄 package-lock.json         # Dependency lock file
├── 📄 .gitignore                # Git ignore rules
├── 📄 .editorconfig             # Editor configuration
├── 📄 robots.txt                # SEO robots file
├── 📄 sitemap.xml               # SEO sitemap
├── 📄 sw.js                     # Service worker
├── 📄 README.md                 # Main documentation
├── 📄 LICENSE                   # MIT License
└── 📄 CHANGELOG.md              # Version history
```

## Customization Guide

### 1. Personal Information

Update your personal details:

**File**: `assets/data/portfolio-data.json`

```json
{
  "name": "Your Name",
  "title": "Your Title",
  "email": "your.email@example.com",
  "phone": "+1-234-567-8900",
  "location": "Your City, Country"
}
```

### 2. Profile Image

Replace profile image:

1. Add your photo to `assets/images/`
2. Update image references in HTML files
3. Optimize image for web (WebP format recommended)

### 3. Resume/CV

Replace resume file:

1. Add your resume to `assets/files/`
2. Update download links in HTML
3. Ensure PDF is optimized for web

### 4. Projects Data

Update projects:

**File**: `projects.html`

- Modify project cards
- Update GitHub links
- Add project screenshots

### 5. Color Scheme

Customize colors:

**File**: `css/main.css`

```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
  --accent-color: #your-color;
}
```

### 6. Typography

Change fonts:

**File**: `css/main.css`

```css
:root {
  --font-family-sans-serif: 'Your Font', sans-serif;
  --font-family-monospace: 'Your Mono Font', monospace;
}
```

### 7. Social Links

Update social media links:

**Files**: All HTML files

```html
<a href="https://linkedin.com/in/yourprofile">LinkedIn</a>
<a href="https://github.com/yourusername">GitHub</a>
```

## Development Workflow

### Daily Development

1. **Start Development Server**

   ```bash
   npm start
   ```

2. **Make Changes**
   - Edit HTML, CSS, or JS files
   - Browser auto-refreshes with changes

3. **Test Changes**

   ```bash
   npm run lint       # Check code quality
   npm run format     # Format code
   npm test           # Run tests
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: your description"
   git push origin main
   ```

### Code Quality Tools

```bash
# Lint CSS
npm run lint:css

# Lint JavaScript
npm run lint:js

# Format all files
npm run format

# Validate HTML
npm run validate:html

# Check accessibility
npm run test:accessibility

# Performance audit
npm run test:lighthouse
```

### Build for Production

```bash
# Create production build
npm run build

# Serve production build locally
npm run serve:dist

# Clean build files
npm run clean
```

## Troubleshooting

### Common Issues

#### 1. Dependencies Not Installing

**Error**: `npm install` fails
**Solutions**:

```bash
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use different registry
npm install --registry https://registry.npmjs.org/
```

#### 2. Port Already in Use

**Error**: Port 3000 is already in use
**Solutions**:

```bash
# Kill process on port 3000
npx kill-port 3000

# Use different port
npm start -- --port 3001

# Find and kill process manually
lsof -ti:3000 | xargs kill -9
```

#### 3. Permission Errors

**Error**: Permission denied during install
**Solutions**:

```bash
# Fix NPM permissions (Linux/Mac)
sudo chown -R $(whoami) ~/.npm

# Use Node Version Manager
nvm use node

# Install with different permissions
npm install --unsafe-perm=true
```

#### 4. CSS Not Loading

**Error**: Styles not appearing
**Solutions**:

- Check file paths in HTML
- Verify CSS syntax
- Clear browser cache (Ctrl+F5)
- Check browser console for errors

#### 5. JavaScript Errors

**Error**: Scripts not working
**Solutions**:

- Check browser console (F12)
- Verify script paths in HTML
- Check for syntax errors
- Ensure external libraries load first

### Browser Issues

#### Chrome DevTools Setup

1. Open DevTools (F12)
2. Enable source maps in Settings
3. Use Console tab for errors
4. Use Network tab for loading issues
5. Use Lighthouse tab for performance

#### Cross-Browser Testing

Test in multiple browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (if on Mac)
- Edge (latest)

### Performance Issues

#### Slow Loading

**Solutions**:

- Optimize images (use WebP format)
- Minify CSS and JavaScript
- Enable browser caching
- Use CDN for external resources

#### Large Bundle Size

**Solutions**:

```bash
# Analyze bundle size
npm run build
npm run analyze

# Remove unused dependencies
npm uninstall unused-package

# Optimize images
npm run optimize:images
```


## 🔒 Security Setup

### Basic Security

1. **Environment Variables**
   - Never commit secrets to Git
   - Use `.env.local` for local secrets
   - Use environment variables in production

2. **Dependencies**

   ```bash
   # Check for vulnerabilities
   npm audit

   # Fix automatically
   npm audit fix

   # Check specific package
   npm audit --package-lock-only
   ```

3. **Content Security Policy**
   - Configure CSP headers
   - Test with browser DevTools
   - Monitor for violations

## Performance Optimization

### Image Optimization

```bash
# Install imagemin
npm install -g imagemin-cli

# Optimize images
imagemin assets/images/* --out-dir=assets/images/optimized

# Convert to WebP
cwebp input.jpg -q 80 -o output.webp
```

### CSS Optimization

```bash
# Minify CSS
npm run minify:css

# Remove unused CSS
npm install -g purify-css
purifycss css/*.css *.html --min --out dist/css/styles.min.css
```

### JavaScript Optimization

```bash
# Minify JavaScript
npm run minify:js

# Tree shake unused code
# (Configure in build tools)
```

## Next Steps

After setup completion:

1. **Customize Content**
   - Update personal information
   - Add your projects
   - Replace placeholder images

2. **Test Everything**
   - Run all tests
   - Check responsive design
   - Verify all links work

3. **Deploy**
   - Choose hosting platform
   - Configure domain
   - Set up SSL certificate

4. **Monitor**
   - Set up analytics
   - Monitor performance
   - Track user feedback

---

**Happy Coding! 🚀**
