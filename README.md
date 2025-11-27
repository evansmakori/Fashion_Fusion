# Fashion Fusion 👗✨

AI-Powered Fashion Analysis & Style Generation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## 🎯 Overview

Fashion Fusion is a cutting-edge fashion technology platform that combines AI image generation with intelligent fashion analysis. Upload a photo and let AI transform it into multiple style variations (Professional, Casual, Streetwear, Dinner) with detailed outfit breakdowns and styling recommendations.

## ✨ Features

### 🎨 AI-Powered Style Generation
- **Image-to-Image Transformation** using Stability AI
- Generate 4 distinct style variations from a single photo
- Maintain person's features while changing outfit style
- High-quality 1024x1024 output images

### 🔍 Intelligent Fashion Analysis
- **Vultr AI-powered text analysis** for fashion descriptions
- Automatic item detection (shirts, pants, shoes, accessories)
- Price estimation for each detected item
- Confidence scoring for item recognition
- Context-aware styling tips based on selected style

### 💼 Complete E-commerce Flow
- Product catalog management
- User category organization
- Shopping cart functionality
- Order processing system
- Payment integration ready
- Address validation

### 🎭 Multiple Style Options
- **Professional** - Business attire and formal office fashion
- **Casual** - Relaxed everyday wear
- **Streetwear** - Urban trendy styles
- **Dinner** - Elegant evening outfits

## 🏗️ Architecture

### Microservices (Built on Raindrop Framework)

```
┌─────────────────────────────────────────┐
│         Frontend Service (React)        │
│     - User Interface                    │
│     - Authentication                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          API Gateway                    │
│     - Request routing                   │
│     - CORS handling                     │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌─────▼────────┐
│   Image     │  │    Image     │
│ Generation  │  │   Analysis   │
│  Service    │  │   Service    │
│             │  │              │
│ - Stability │  │ - Vultr AI   │
│   AI API    │  │ - Item       │
│ - Style     │  │   Detection  │
│   Transform │  │ - Price Est. │
└─────────────┘  └──────────────┘

┌─────────────────────────────────────────┐
│         Backend Services                │
│  - Product Service                      │
│  - Order Service                        │
│  - Payment Service                      │
│  - Fashion Database (SmartSQL)          │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Raindrop CLI (`npm install -g @liquidmetal-ai/raindrop-framework`)
- Stability AI API key (for image generation)
- Vultr Inference API key (for text analysis)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/fashion-fusion.git
cd fashion-fusion

# Install dependencies
npm install

# Install frontend dependencies
cd src/frontend-service
npm install
cd ../..

# Configure environment variables
# Edit raindrop.manifest and add your API keys
```

### Configuration

Update `raindrop.manifest` with your API keys:

```hcl
env "VULTR_API_KEY" {
  default = "your-vultr-api-key"
}

env "STABILITY_API_KEY" {
  default = "your-stability-api-key"
}
```

### Running Locally

```bash
# Build the project
npm run build

# Start all services
npm run start
```

The application will be available at the URLs shown in the deployment output.

## 📦 Project Structure

```
fashion-fusion/
├── src/
│   ├── _app/                    # Shared app utilities
│   │   ├── auth.ts             # Authentication helpers
│   │   └── cors.ts             # CORS configuration
│   ├── api-gateway/            # Main API gateway
│   ├── frontend-service/       # React frontend
│   │   ├── components/         # React components
│   │   │   ├── App.jsx
│   │   │   ├── AuthForm.jsx
│   │   │   ├── ImageForm.jsx
│   │   │   ├── FashionAI.jsx
│   │   │   ├── ui/            # UI components
│   │   │   └── hooks/         # Custom hooks
│   │   ├── index.ts           # Service entry
│   │   └── package.json
│   ├── image-generation-service/
│   │   └── index.ts           # Stability AI integration
│   ├── image-analysis-service/
│   │   └── index.ts           # Vultr AI & item detection
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   └── sql/
│       └── fashion-db.ts      # Database schema
├── raindrop.manifest          # Service configuration
├── package.json
└── tsconfig.json
```

## 🔑 API Endpoints

### Frontend Service

- `GET /` - Main application UI
- `POST /api/generate-styled-image` - Generate style variation
- `POST /api/analyze-image` - Analyze outfit
- `POST /api/generate-image` - Generate fashion description

### API Gateway

- `GET /health` - Health check
- `POST /api/products/analyze` - Product analysis
- `GET /api/categories` - Get user categories
- `POST /api/products/save` - Save product
- `POST /api/orders` - Create order
- `POST /api/checkout/validate-address` - Validate address

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

**Test Results:** 34/34 tests passing
- API Gateway: 20 tests
- Image Analysis: 9 tests
- Frontend Service: 1 test
- Other Services: 4 tests

## 🎨 Technologies Used

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Custom UI Components** - No external UI library

### Backend
- **Raindrop Framework** - Microservices platform
- **TypeScript** - Type-safe development
- **Cloudflare Workers** - Serverless runtime
- **SmartSQL** - Database layer

### AI/ML
- **Stability AI** - Image generation (Stable Diffusion XL)
- **Vultr Inference API** - Text generation (Qwen 2.5 Coder 32B)

### Storage
- **KV Store** - Session management
- **SmartSQL** - Relational data
- **Bucket Storage** - Image storage

## 💰 Cost Optimization

### Current Setup (Recommended for Testing)
- **Image Generation:** Placeholder images (FREE)
- **Text Analysis:** Vultr API (~$0.001-0.003 per analysis)
- **Total per session:** < $0.01

### Production Setup (Real AI Images)
- **Image Generation:** Stability AI (~$0.02-0.04 per image)
- **Text Analysis:** Vultr API (~$0.001-0.003 per analysis)
- **Total per session:** ~$0.08-0.16

## 🔒 Security

- **CORS:** Configured for cross-origin requests
- **Authentication:** Email/password + wallet integration ready
- **API Keys:** Stored in Raindrop environment variables
- **Input Validation:** Comprehensive request validation
- **Error Handling:** Secure error messages

**⚠️ Note:** Current setup uses `corsAllowAll` for development. Update for production:

```typescript
// src/_app/cors.ts
export const corsHandler = createCorsHandler({
  allowedOrigins: ['https://yourdomain.com'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
});
```

## 📈 Performance

- **Build Time:** ~15 seconds
- **Deployment Time:** ~30 seconds
- **API Response Time:** < 100ms (health check)
- **Image Analysis:** ~1-2 seconds
- **Style Generation:** ~5-10 seconds (with Stability AI)

## 🌐 Deployment

### Deploy to Raindrop Cloud

```bash
# Build and deploy
npm run deploy

# Deploy with start
npm run start
```

### Environment Variables

Required in production:
- `VULTR_API_KEY` - For AI text generation
- `STABILITY_API_KEY` - For AI image generation (optional)

## 🛠️ Development

### Adding a New Service

1. Create service directory in `src/`
2. Implement service in `index.ts`
3. Add service to `raindrop.manifest`
4. Run `raindrop gen` to generate types
5. Build and deploy

### Running Tests

```bash
# Watch mode
npm run test:watch

# Specific test file
npm test src/api-gateway/index.test.ts
```

## 📝 API Documentation

Detailed API documentation available in:
- [API Gateway Docs](docs/api-gateway.md)
- [Image Services Docs](docs/image-services.md)
- [Product Services Docs](docs/product-services.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Fashion Fusion Team**
- evansmakori - *Initial work*

## 🙏 Acknowledgments

- [Stability AI](https://stability.ai/) for image generation API
- [Vultr](https://www.vultr.com/) for inference API
- [Raindrop Framework](https://raindrop.dev/) for microservices platform
- [Unsplash](https://unsplash.com/) for placeholder images

## 📞 Support

For support, Open an issue in the GitHub repository.

## 🗺️ Roadmap

- [ ] Real-time collaboration features
- [ ] Social sharing capabilities
- [ ] Mobile app (React Native)
- [ ] Advanced filtering and search
- [ ] AI model fine-tuning
- [ ] Multi-language support
- [ ] Style recommendations engine
- [ ] Virtual try-on feature

---

**Built with ❤️ using Raindrop, React, and AI**
