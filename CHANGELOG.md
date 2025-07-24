# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Chart format display option for visual data representation
- Daily cost trend graphs with ASCII bar charts
- Service comparison charts showing relative costs
- Model comparison charts with cost breakdowns
- Daily token usage trend with input/output visualization
- Enhanced summary statistics with average cost per 1K tokens

## [0.1.0] - 2025-01-23

### Added
- Initial release of gemini-cost-tracker CLI tool
- Token usage tracking for Gemini API and Vertex AI
- Cost calculation based on current pricing models
- Period-based filtering (today, week, month, custom)
- Multiple output formats (table, JSON, CSV)
- Currency conversion support (USD, JPY)
- Secure authentication management
- Configuration management via CLI
- Data export functionality
- Project and model filtering
- Comprehensive help documentation

### Features
- **Authentication Management**
  - Secure storage of API keys and credentials
  - Support for environment variables
  - Interactive configuration setup
  - Credential validation

- **Usage Tracking**
  - Real-time token usage monitoring
  - Input and output token separation
  - Historical data analysis
  - Project-based filtering

- **Cost Calculation**
  - Accurate pricing based on official rate tables
  - Multi-currency support (USD, JPY)
  - Model-specific pricing
  - Cost breakdown by service and model

- **Data Export**
  - JSON format export
  - CSV format export
  - Customizable date ranges
  - Filtered exports

- **CLI Interface**
  - Intuitive command structure
  - Comprehensive help system
  - Progress indicators
  - Error handling and user feedback

### Supported Models
- **Gemini API**
  - gemini-pro
  - gemini-pro-vision
  - gemini-1.5-pro
  - gemini-1.5-flash

- **Vertex AI**
  - text-bison-001, text-bison-002
  - chat-bison-001, chat-bison-002
  - code-bison-001, code-bison-002
  - codechat-bison-001, codechat-bison-002

### Technical Details
- Built with TypeScript 5.x
- Supports Node.js 16+
- ESM module support
- Comprehensive error handling
- Configurable logging
- Type-safe implementation

### Installation Options
- npx execution: `npx gemini-cost-tracker@latest`
- Global installation: `npm install -g gemini-cost-tracker`

[Unreleased]: https://github.com/username/gemini-cost-tracker/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/username/gemini-cost-tracker/releases/tag/v0.1.0