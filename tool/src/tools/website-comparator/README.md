# Website Comparator Tool

## Overview

The Website Comparator Tool is a powerful utility that allows users to compare two websites by analyzing their meta tags, titles, and other HTML properties. It provides a visual diff-like interface to highlight differences between websites.

## Features

### Core Functionality
- **URL Input Validation**: Validates and ensures both URLs are properly formatted
- **Meta Tags Comparison**: Extracts and compares all meta tags from both websites
- **Title Comparison**: Compares page titles between websites
- **Visual Diff Highlighting**: Highlights only the different parts of text using intelligent diff algorithm
- **Real-time Validation**: Provides immediate feedback on input validation

### UI/UX Features
- **Responsive Design**: Full-width layout optimized for comparison tables
- **Interactive Tables**: Clean table format for easy comparison
- **Status Indicators**: Color-coded tags showing match/difference status
- **Loading States**: Visual feedback during website fetching
- **Error Handling**: Clear error messages for various failure scenarios

## How to Use

### Basic Usage
1. **Enter URLs**: Input two different website URLs in the provided fields
2. **Select Options**: Choose what to compare (Meta Tags, Title, or both)
3. **Compare**: Click "Compare Websites" button
4. **Review Results**: View the comparison results in organized tables

### Input Requirements
- **Valid URLs**: Must be properly formatted URLs (e.g., `https://example.com`)
- **Different URLs**: Cannot compare the same URL
- **At least one option**: Must select either Meta Tags or Title comparison

### Example URLs
```
Website 1: https://example.com
Website 2: https://example.org
```

## Technical Implementation

### Architecture
- **Frontend**: Vue 3 with TypeScript
- **UI Framework**: Naive UI components
- **Proxy Service**: Uses `api.allorigins.win` to bypass CORS restrictions
- **HTML Parsing**: Client-side DOM parsing for meta tag extraction

### Key Components

#### Validation System
```typescript
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
```

#### Diff Algorithm
```typescript
const highlightDifferences = (text1: string, text2: string) => {
  // Finds the exact character positions where texts differ
  // Returns HTML with highlighted differences
};
```

#### Meta Tag Extraction
```typescript
doc.querySelectorAll('meta').forEach(meta => {
  const name = meta.getAttribute('name') || meta.getAttribute('property');
  const content = meta.getAttribute('content');
  if (name && content) {
    metaTags[name] = content;
  }
});
```

### Data Flow
1. **Input Validation** → URL format and uniqueness check
2. **Proxy Request** → Fetch website content via CORS proxy
3. **HTML Parsing** → Extract meta tags and title using DOMParser
4. **Comparison** → Compare extracted data using diff algorithm
5. **Visual Rendering** → Display results in formatted tables

## File Structure

```
website-comparator/
├── index.ts                 # Tool configuration and export
├── website-comparator.vue   # Main component
└── README.md               # This documentation
```

### Component Structure

#### Template Sections
- **Instructions**: User guidance and tool description
- **URL Inputs**: Two validated URL input fields
- **Comparison Options**: Checkboxes for meta tags and title
- **Validation Summary**: Error messages and validation feedback
- **Results Tables**: 
  - Summary table with overview
  - Title comparison table
  - Meta tags comparison table

#### Script Logic
- **Reactive State**: URL inputs, options, results, loading states
- **Computed Properties**: Validation status, comparison results, diff calculations
- **Methods**: Website fetching, HTML parsing, diff highlighting

#### Styling
- **Full-width Layout**: Custom CSS to override default tool width
- **Table Styling**: Clean, readable table design
- **Highlight Styling**: Yellow background for different text parts

## API Integration

### Proxy Service
- **Service**: `https://api.allorigins.win/get?url=`
- **Purpose**: Bypass CORS restrictions for cross-origin requests
- **Response Format**: JSON with `contents` field containing HTML

### Error Handling
- **Network Errors**: Failed fetch requests
- **HTTP Errors**: Non-200 status codes
- **Parsing Errors**: Invalid HTML content
- **Validation Errors**: Invalid URLs or missing options

## Browser Compatibility

### Supported Features
- **DOMParser**: For HTML parsing
- **Fetch API**: For HTTP requests
- **ES6+ Features**: Template literals, arrow functions, destructuring
- **CSS Grid/Flexbox**: For responsive layout

### Minimum Requirements
- Modern browsers with ES6 support
- Internet connection for proxy service
- JavaScript enabled

## Performance Considerations

### Optimization Techniques
- **Lazy Loading**: Results only computed when needed
- **Memoization**: Computed properties for expensive operations
- **Debounced Validation**: URL validation on input change
- **Efficient Diff**: Character-level diff algorithm

### Limitations
- **Proxy Dependency**: Requires external proxy service
- **Network Latency**: Depends on website response times
- **CORS Restrictions**: Some websites may block proxy access

## Future Enhancements

### Potential Features
- **More Comparison Types**: Headers, scripts, styles
- **Batch Comparison**: Compare multiple websites
- **Export Results**: Download comparison as CSV/JSON
- **Custom Proxy**: Self-hosted proxy service
- **Screenshot Comparison**: Visual website comparison
- **Performance Metrics**: Load time, size comparison

### Technical Improvements
- **Caching**: Cache results for repeated comparisons
- **Web Workers**: Background processing for large comparisons
- **Service Worker**: Offline functionality
- **PWA Support**: Installable web app

## Troubleshooting

### Common Issues

#### "Failed to fetch websites"
- Check internet connection
- Verify URLs are accessible
- Try different websites

#### "Invalid URL" Error
- Ensure URLs start with `http://` or `https://`
- Check for typos in URL
- Verify URL format

#### "No meta tags found"
- Website may not have meta tags
- Try comparing titles instead
- Check if website is accessible

#### Localhost Issues
- Ensure localhost server is running
- Check if proxy can access localhost
- Try using ngrok for localhost exposure

### Debug Mode
Enable debug information by uncommenting the debug card in the template:
```vue
<n-card size="small" v-if="true"> <!-- Change to true -->
  <n-text>Debug: canCompare = {{ canCompare }}, validation1 = {{ validation1 }}, validation2 = {{ validation2 }}</n-text>
</n-card>
```

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Navigate to `/website-comparator`

### Code Style
- **TypeScript**: Strict type checking enabled
- **Vue 3**: Composition API with `<script setup>`
- **ESLint**: Follow project linting rules
- **Prettier**: Consistent code formatting

### Testing
- **Unit Tests**: Test validation and diff functions
- **Integration Tests**: Test full comparison workflow
- **E2E Tests**: Test user interactions and results

## License

This tool is part of the IT Tools collection and follows the same licensing terms as the main project.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintainer**: IT Tools Team 