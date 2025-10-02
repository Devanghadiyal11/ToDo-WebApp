# TaskFlow - Professional Todo Management App

A comprehensive todo application built with Next.js 15, featuring categories, priorities, analytics, and modern UI components.

## Features

- 🔐 User Authentication (Login/Register)
- 📝 Task Management with Categories
- 📊 Analytics Dashboard
- 🎨 Modern Dark Theme UI
- 📱 Responsive Design
- 🔍 Advanced Filtering
- 📈 Progress Tracking

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or pnpm

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd todo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/ToDoList
   MONGODB_DB=ToDoList

   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Next.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
   ```

4. **Set up MongoDB**
   
   Make sure MongoDB is running locally or update the `MONGODB_URI` to point to your MongoDB instance.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
todo-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── analytics/         # Analytics pages
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── auth/             # Authentication components
│   ├── tasks/            # Task-related components
│   └── analytics/        # Analytics components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
└── styles/               # Global styles
```

## Technologies Used

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Database**: MongoDB
- **Authentication**: JWT
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: SWR

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `MONGODB_DB` | Database name | No (defaults to ToDoList) |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `NEXTAUTH_URL` | Base URL for the application | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth | Yes |

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your `MONGODB_URI` in `.env.local`
   - Verify network connectivity

2. **Build Errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

3. **Port Already in Use**
   - Kill process using port 3000
   - Or use different port: `npm run dev -- -p 3001`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
