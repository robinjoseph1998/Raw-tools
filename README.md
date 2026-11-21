# RAW — Developer Utility & Data Transformation Platform

**RAW** is a modern, lightweight, client-facing developer utility platform engineered to streamline JSON inspection, structural validation, data serialization, format interoperability, and JWT token analysis through a unified interface.

Built on **Next.js 15, React 19, TypeScript, and Tailwind CSS**, RAW provides a modular, component-driven application architecture with dedicated processing utilities, reusable editor abstractions, and an optimized static deployment pipeline.

The platform consolidates frequently used developer workflows into a single workspace, minimizing context switching while maintaining a consistent and responsive user experience.

---

## Core Capabilities

### 1. JSON Processing & Structural Validation

A dedicated JSON processing environment designed for efficient inspection, transformation, and validation of structured data.

- **Pretty Printing:** Normalizes JSON structures with configurable indentation and hierarchical formatting.
- **Minification:** Removes unnecessary whitespace to produce compact serialized JSON output.
- **Syntax Validation:** Performs JSON parsing and structural validation with immediate error feedback.
- **Syntax Highlighting:** Improves readability through differentiated syntax representation.
- **Data Inspection:** Provides structured visibility into JSON content and processing statistics.

### 2. Multi-Format Data Serialization

A unified data transformation engine supporting conversion between commonly used serialization and data interchange formats.

| Source Format | Target Formats |
|---|---|
| JSON | YAML |
| JSON | CSV |
| JSON | XML |

Key capabilities:

- Structured data transformation.
- Format-specific serialization.
- One-click conversion workflows.
- Dedicated output rendering.
- Clipboard-based extraction of transformed content.

### 3. JWT Token Inspection & Analysis

A dedicated JSON Web Token inspection utility for examining token structures and understanding their encoded claims.

- **Token Decoding:** Decodes Base64URL-encoded JWT header and payload segments.
- **Header Inspection:** Displays token metadata and algorithm declarations.
- **Payload Analysis:** Exposes encoded claims and associated token attributes.
- **Signature Segment Inspection:** Displays the encoded signature component.
- **Expiration Analysis:** Evaluates token expiration information and identifies expired tokens.

**Security Note:** JWT decoding is intended for inspection and debugging. Decoding a token does not verify its cryptographic signature or establish its authenticity.

### 4. Developer Productivity & Interaction Layer

- Keyboard-driven formatting workflows using `Ctrl + Enter` and `⌘ + Enter`.
- One-click clipboard integration for processed outputs.
- Contextual toast notifications for user feedback.
- Tab-based tool navigation.
- Consistent input/output editor abstractions.

### 5. Interface & Experience Engineering

- Dark-first visual design system.
- Responsive two-panel desktop workspace.
- Adaptive stacked mobile layout.
- Consistent component styling through Tailwind CSS.
- Reusable interface components and centralized interaction patterns.

---

## Technology Stack & Engineering Components

| Layer | Technology | Responsibility |
|---|---|---|
| Application Framework | Next.js 15 | Application routing, rendering, and build orchestration |
| UI Runtime | React 19 | Component lifecycle and declarative UI rendering |
| Programming Language | TypeScript | Static typing and compile-time type checking |
| Styling System | Tailwind CSS v3 | Utility-first styling and responsive design |
| YAML Serialization | js-yaml | YAML parsing and serialization |
| JSON Processing | Custom TypeScript utilities | Parsing, formatting, validation, and syntax processing |
| CSV Transformation | Custom implementation | Structured JSON-to-CSV conversion |
| XML Transformation | Custom implementation | Structured JSON-to-XML conversion |
| JWT Processing | Custom implementation | Token segmentation, Base64URL decoding, and expiry inspection |
| Application State | React Hooks | Local state and notification lifecycle management |

### Architectural Characteristics

- Component-oriented UI architecture.
- Separation of presentation and processing logic.
- Reusable editor and notification abstractions.
- Centralized utility modules for data transformations.
- Type-driven application interfaces.
- Static export compatibility.
- Minimal external dependency footprint.

---

## System Architecture

RAW follows a modular frontend architecture that separates application composition, reusable UI components, domain-specific processing logic, and shared type definitions.

### High-Level Architecture

```text
                    RAW APPLICATION
                           |
             +-------------+-------------+
             |                           |
        Application Layer           UI Layer
             |                           |
       +-----+------+             +------+------+
       |            |             |             |
     Layout        Page        Navbar       ToolTabs
       |            |             |             |
       |       Tool Routing        +------+------+
       |                                  |
       |                           Editor Components
       |                                  |
       |                    +-------------+-------------+
       |                    |             |             |
       |                Formatter     Converter      JWT
       |                    |             |             |
       +--------------------+-------------+-------------+
                                    |
                             Processing Layer
                                    |
                         +----------+----------+
                         |          |          |
                       JSON      Converter     JWT
                       Utils       Utils      Utils
                         |
                    Shared Types
```

### Architectural Responsibilities

| Module | Responsibility |
|---|---|
| `src/app/` | Application entry points, root layout, metadata, and global styling |
| `src/components/` | Reusable presentation components and interface composition |
| `src/components/tools/` | Feature-specific developer utility interfaces |
| `src/lib/` | Core processing logic, parsing, serialization, and token inspection |
| `src/hooks/` | Reusable React state-management hooks |
| `src/types/` | Shared TypeScript contracts and application-level type definitions |

---

## Project Directory Structure

```text
RAW/
│
├── public/
│
├── src/
│   │
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ToolTabs.tsx
│   │   ├── EditorPanel.tsx
│   │   ├── Toast.tsx
│   │   │
│   │   └── tools/
│   │       ├── JsonFormatter.tsx
│   │       ├── JsonConverter.tsx
│   │       └── JwtDecoder.tsx
│   │
│   ├── lib/
│   │   ├── json.ts
│   │   ├── converter.ts
│   │   └── jwt.ts
│   │
│   ├── hooks/
│   │   └── useToast.ts
│   │
│   └── types/
│       └── index.ts
│
├── package.json
├── package-lock.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── README.md
```

---

## Application Setup & Local Development

### Prerequisites

Ensure the following development tools are available:

- Node.js (compatible with the selected Next.js 15 release).
- npm package manager.
- Git.
- A modern Chromium-based or standards-compliant web browser.

### 1. Repository Initialization

Clone the repository and navigate to the application directory.

```bash
git clone <repository-url>
cd RAW
```

### 2. Dependency Resolution

Install the project dependencies using the package lockfile.

```bash
npm install
```

For reproducible dependency installation in CI environments:

```bash
npm ci
```

### 3. Development Server

Start the Next.js development environment.

```bash
npm run dev
```

The application will be accessible at:

```text
http://localhost:3000
```

The development server supports iterative development with Next.js Fast Refresh.

---

## Production Build & Deployment

RAW is configured to support static site generation and static export through Next.js.

### Production Build

Generate the optimized production artifacts:

```bash
npm run build
```

With static export configured, the generated deployment artifacts are written to:

```text
out/
```

### Deployment Considerations

The generated static output can be deployed to compatible static hosting infrastructure, including:

- Nginx
- Apache HTTP Server
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 with CloudFront

No dedicated Node.js application server is required to serve the exported static files.

The deployment environment must correctly handle asset paths, static resources, and client-side application routing.

---

## Application Processing Workflow

The application organizes its functionality into independent processing workflows:

**JSON Formatting Workflow**

```text
User Input
    |
    v
JSON Parser
    |
    v
Syntax Validation
    |
    v
Formatting / Minification
    |
    v
Syntax Highlighting
    |
    v
Output Rendering
```

**Data Conversion Workflow**

```text
JSON Input
    |
    v
Input Parsing
    |
    v
Data Transformation
    |
    +------ YAML Serialization
    |
    +------ CSV Serialization
    |
    +------ XML Serialization
    |
    v
Converted Output
```

**JWT Inspection Workflow**

```text
JWT Input
    |
    v
Token Segmentation
    |
    v
Base64URL Decoding
    |
    +------ Header Extraction
    |
    +------ Payload Extraction
    |
    +------ Signature Extraction
    |
    v
Expiration Analysis
    |
    v
Structured Token Inspection
```

---

## Engineering & Implementation Principles

The application is organized around the following engineering principles:

- **Separation of Concerns:** UI composition and data-processing responsibilities are maintained in separate modules.
- **Reusability:** Shared editor and notification components reduce duplicated presentation logic.
- **Type Safety:** TypeScript interfaces provide explicit contracts across application modules.
- **Modularity:** Individual developer utilities maintain dedicated processing and presentation components.
- **Dependency Minimization:** Custom implementations handle CSV, XML, and JWT processing without introducing additional dedicated libraries.
- **Deployment Portability:** Static export enables deployment across conventional static hosting platforms.

---

## Future Engineering Roadmap

Potential areas for further platform evolution:

- Advanced JSON schema validation.
- JSON diff and comparison engine.
- YAML-to-JSON and XML-to-JSON conversion.
- JWT cryptographic signature verification.
- JSON tree-view visualization.
- Configurable formatting and indentation profiles.
- Extended keyboard shortcut registry.
- Comprehensive unit and integration test coverage.
- Accessibility compliance and keyboard navigation enhancements.
- Automated CI/CD build and deployment workflows.

---

## License

This project is distributed under the **MIT License**.

See the `LICENSE` file for applicable terms and conditions.
