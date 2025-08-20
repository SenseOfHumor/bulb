# BULB - Authentication Setup

This project uses [Clerk](https://clerk.com/) for authentication. Follow these steps to set up authentication in your development environment.

## Quick Setup

1. **Install Dependencies** (already done)
   ```bash
   npm install @clerk/clerk-react@latest
   ```

2. **Environment Variables**
   The project is already configured with a Clerk publishable key in `.env.local`:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_dXAtY2hlZXRhaC05OC5jbGVyay5hY2NvdW50cy5kZXYk
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## How Authentication Works

### For Signed-Out Users
- Users see the marketing landing page with all sections (Home, About, Pricing, Contact)
- Navigation bar shows "Sign In" and "Sign Up" buttons
- Call-to-action encourages users to sign up

### For Signed-In Users
- Users are redirected to a personalized dashboard
- Dashboard shows welcome message with user's name
- Features for uploading transcripts, viewing projects, accessing knowledge graph, and interacting with TRACE AI assistant
- Navigation bar shows user profile button with account management options

### Authentication Components

#### Clerk Components Used:
- `<ClerkProvider>` - Wraps the entire app in `main.jsx`
- `<SignedIn>` - Renders content only for authenticated users
- `<SignedOut>` - Renders content only for non-authenticated users
- `<SignInButton>` - Triggers sign-in modal
- `<SignUpButton>` - Triggers sign-up modal
- `<UserButton>` - Shows user avatar and account management options

#### Key Features:
- **Modal Authentication**: Sign-in/sign-up forms appear in modals over the current page
- **Responsive Design**: Authentication buttons adapt to mobile and desktop layouts
- **Automatic Redirects**: Users are redirected after sign-out via `afterSignOutUrl="/"`
- **User Profile Management**: Built-in profile management via UserButton component

## File Changes Made

### Core Authentication Setup:
- `main.jsx` - Added ClerkProvider wrapper
- `.env.local` - Added Clerk publishable key
- `package.json` - Added @clerk/clerk-react dependency

### UI Components:
- `App.jsx` - Added conditional rendering based on authentication state
- `components/Navbar.jsx` - Integrated authentication buttons and user profile
- `components/Dashboard.jsx` - Created authenticated user dashboard

### Authentication Flow:
1. App loads with ClerkProvider context
2. Navbar shows appropriate auth buttons based on user state
3. Signed-out users see marketing content
4. Signed-in users see personalized dashboard
5. Modal-based sign-in/sign-up experience
6. Automatic user session management

## Customization

### Styling
The authentication components use Tailwind CSS classes that match the existing design:
- Glassmorphism effects with `bg-white/10` and `backdrop-blur-xl`
- Consistent color scheme with sky blue accents
- Responsive design patterns

### User Experience
- Sign-in and sign-up use modal overlays to maintain context
- User button includes avatar and dropdown for account management
- Dashboard provides clear next steps for new users

## Production Deployment

For production, you'll need to:
1. Create a production Clerk application
2. Update the `VITE_CLERK_PUBLISHABLE_KEY` with your production key
3. Configure your domain in Clerk dashboard
4. Set up any additional authentication providers (Google, GitHub, etc.)

## Documentation

For more advanced Clerk features, visit: https://clerk.com/docs/quickstarts/react
