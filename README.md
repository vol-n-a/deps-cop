# deps-cop

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful dependency management tool that helps you maintain a whitelist of project dependencies, ensuring consistent and secure dependency usage across your project.

## Features

- 🔍 Dependency tree analysis
- 📋 Whitelist configuration for dependencies
- 🛡️ Version control and management
- ⚡ Fast and efficient dependency mapping

## Installation

```bash
npm install deps-cop
```

## Usage

1. Create a `whitelist.json` file in your project root:

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

2. Run the tool:

```bash
npx deps-cop
```

## Configuration

The tool uses a `whitelist.json` file to specify allowed dependencies and their versions. You can customize this file according to your project's needs.

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/deps-cop.git
cd deps-cop
```

2. Install dependencies:
```bash
npm install
```

3. Run the tool:
```bash
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

- **vol-n-a**

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for inspiration and support
