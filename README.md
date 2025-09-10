# Parking Reservations System - Frontend

A modern, responsive parking reservation system built with Next.js 15, featuring real-time updates, admin dashboard, and mobile-first design.

## 🚀 Features

### Core Functionality

- **Gate Management**: Multi-gate parking system with real-time zone monitoring
- **Visitor Reservations**: One-time parking reservations for visitors
- **Subscription Management**: Monthly/yearly parking subscriptions for employees
- **Real-time Updates**: WebSocket integration for live zone status updates
- **Admin Dashboard**: Comprehensive admin panel for system management

### User Experience

- **Responsive Design**: Mobile-first approach with hamburger menu for admin
- **Modern UI**: Glass morphism effects, gradients, and smooth animations
- **Real-time Notifications**: Toast notifications for user feedback
- **Optimized Performance**: Reduced animations and transitions for better performance

### Admin Features

- **Zone Management**: Open/close parking zones with real-time status updates
- **Employee Management**: Create and manage employee accounts (includes POST /admin/users API)
- **Category Management**: Update parking rates and categories
- **Live Audit Log**: Real-time monitoring of admin actions
- **Parking Reports**: Comprehensive parking state reports
- **Rush Hours & Vacations**: Manage special pricing periods

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom animations
- **State Management**: Zustand with persistence
- **Data Fetching**: React Query (TanStack Query)
- **Real-time**: WebSocket integration
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd parking-reservations-system-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard and login
│   ├── checkpoint/         # Employee checkpoint
│   ├── gate/[gateId]/     # Dynamic gate pages
│   └── page.tsx           # Landing page
├── components/             # Reusable React components
│   ├── CheckoutPanel.tsx  # Checkout functionality
│   ├── GateHeader.tsx     # Gate page header
│   ├── NotificationToast.tsx # Toast notifications
│   ├── SubscriptionInput.tsx # Subscription form
│   ├── TicketModal.tsx    # Ticket display modal
│   ├── ZoneCard.tsx       # Admin zone management
│   └── ZoneSelectionCard.tsx # Zone selection for gates
├── hooks/                  # Custom React hooks
│   ├── useApi.ts          # React Query hooks
│   └── useWebSocket.ts    # WebSocket integration
├── services/               # API services
│   └── api.ts             # API client functions
├── stores/                 # Zustand state management
│   └── authStore.ts       # Authentication store
└── styles/                # Global styles
    └── globals.css        # Tailwind CSS and custom animations
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### Backend Integration

This frontend connects to a Node.js backend server. Ensure the backend is running on port 3000.

**Data Source**: The backend uses `seed.json` as the data source, including employee management with email support.

## 🎯 Key Features Implementation

### 1. Responsive Design

- **Mobile-first approach** with hamburger menu for admin dashboard
- **Breakpoint optimization** for screens from 320px to desktop
- **Touch-friendly interfaces** with proper touch targets

### 2. Real-time Updates

- **WebSocket integration** for live zone status updates
- **Optimistic updates** for better user experience
- **Connection status monitoring** with visual indicators

### 3. State Management

- **Zustand with persistence** for authentication state
- **React Query** for server state management and caching
- **Hydration handling** to prevent SSR/client mismatches

### 4. Performance Optimizations

- **React.memo** for component optimization
- **useMemo** for expensive calculations
- **Reduced animations** for better performance
- **Code splitting** with Next.js App Router

## 🚦 Usage

### For Visitors

1. Navigate to the landing page
2. Select a gate (Gate 1 or Gate 2)
3. Choose "Visitor" tab
4. Select an available zone
5. Complete reservation and receive ticket

### For Subscribers

1. Navigate to a gate page
2. Choose "Subscriber" tab
3. Enter subscription details
4. Select available zone
5. Complete reservation

### For Admins

1. Navigate to `/admin/login`
2. Login with admin credentials
3. Access dashboard with full system control
4. Manage zones, employees, and system settings

### For Employees

1. Navigate to `/checkpoint`
2. Enter ticket number
3. View ticket details and checkout

## 🐛 Known Issues

1. **TypeScript Warnings**: Some `any` types in admin dashboard (non-critical)
2. **WebSocket Reconnection**: Manual refresh may be needed if connection drops
3. **Browser Compatibility**: Requires modern browsers with WebSocket support

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Setup

- Ensure backend server is running
- Update API URLs for production
- Configure WebSocket URLs for production

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of a hiring task submission.

---

**Built with ❤️ using Next.js, Tailwind CSS, and modern web technologies**
