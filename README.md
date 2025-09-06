# ModelWhiz Frontend

A Next.js-based frontend for machine learning model evaluation and management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (see backend README)

### Environment Setup

1. **Copy environment template:**
   ```bash
   cp env.example .env.local
   ```

2. **Configure your .env.local file:**
   ```bash
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   NEXT_PUBLIC_ASSET_BASE_URL=http://localhost:8000

   # Supabase Configuration (if using Supabase)
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api` | Backend API base URL |
| `NEXT_PUBLIC_ASSET_BASE_URL` | `http://localhost:8000` | Backend asset base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | - | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | - | Supabase anonymous key |

### Next.js Configuration

The application uses Next.js 14 with the following features:
- App Router
- TypeScript
- Chakra UI for components
- Bundle analyzer for optimization
- SWC minification

## 🏗️ Architecture

### Core Components

- **Next.js App Router**: Modern routing with app directory
- **Chakra UI**: Component library for consistent design
- **TypeScript**: Type-safe development
- **Context API**: State management
- **API Client**: HTTP client for backend communication

### Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── config/             # Configuration files
├── contexts/           # React contexts
├── lib/                # Utility libraries
└── types/              # TypeScript type definitions
```

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run analyze` - Analyze bundle size

## 🧪 Development

### Code Quality

The project uses:
- **ESLint**: Code linting (configured for Next.js)
- **TypeScript**: Static type checking
- **Prettier**: Code formatting (recommended)

### Component Development

Components are built using Chakra UI primitives and follow these principles:
- **Composition**: Use Chakra's composition patterns
- **Accessibility**: Built-in accessibility features
- **Responsive**: Mobile-first design approach
- **Themeable**: Consistent with design system

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Clear `.next` directory: `rm -rf .next`
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run lint`

2. **API Connection Issues**
   - Verify backend is running
   - Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
   - Ensure CORS is configured on backend

3. **Port Already in Use**
   - Kill existing process: `npx kill-port 3000`
   - Use different port: `npm run dev -- -p 3001`

4. **TypeScript Errors**
   - Check type definitions in `src/types/`
   - Ensure all dependencies are properly typed
   - Run `npm run lint` to see all errors

### Development Tips

- **Hot Reload**: Changes automatically refresh the browser
- **Error Overlay**: Next.js shows errors in browser overlay
- **Type Checking**: TypeScript errors appear in terminal and editor
- **Bundle Analysis**: Use `npm run analyze` to optimize bundle size

## 🚀 Deployment

### Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm run start
   ```

### Vercel Deployment

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Performance

### Optimization Features

- **Bundle Analysis**: Built-in bundle analyzer
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Unused code elimination

### Monitoring

- **Core Web Vitals**: Built-in performance metrics
- **Bundle Size**: Monitor with analyze scripts
- **Runtime Performance**: Use React DevTools

## 🔒 Security

### Best Practices

- **Environment Variables**: Never expose sensitive data to client
- **API Security**: Use HTTPS in production
- **Content Security Policy**: Configure CSP headers
- **Input Validation**: Validate all user inputs

### Environment Variables

- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Sensitive data should be kept server-side
- Use `.env.local` for local development secrets

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

### Development Guidelines

- Follow TypeScript best practices
- Use Chakra UI components consistently
- Maintain responsive design principles
- Write self-documenting code

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Chakra UI Documentation](https://chakra-ui.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

## 📄 License

This project is licensed under the MIT License.
