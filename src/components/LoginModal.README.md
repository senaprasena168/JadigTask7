# LoginModal Component

A popup modal version of the LoginCard component that can be used on any page for user authentication. Features the same animated design with compact/expanded states and full authentication functionality.

## Features

- **Animated Design**: Starts compact (300×80px) and expands on hover/focus (380×550px)
- **Multiple Auth Methods**: Email/password, Google OAuth, and user registration
- **OTP Verification**: Email-based verification for new registrations
- **Modal Functionality**: Overlay with backdrop blur, ESC key support, click-outside-to-close
- **Responsive**: Adapts to different screen sizes
- **Auto-close**: Closes automatically on successful authentication

## Usage

### Basic Implementation

```tsx
import LoginModal from '../components/LoginModal';
import { useLoginModal } from '../hooks/useLoginModal';

function MyComponent() {
  const { isOpen, openModal, closeModal } = useLoginModal();

  const handleLoginSuccess = () => {
    // Handle successful login (optional)
    console.log('User logged in successfully!');
  };

  return (
    <div>
      <button onClick={openModal}>
        Login
      </button>
      
      <LoginModal 
        isOpen={isOpen} 
        onClose={closeModal} 
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Callback when modal should close |
| `onLoginSuccess` | `() => void` | No | Callback when login succeeds |

### Hook: useLoginModal

The `useLoginModal` hook provides convenient state management:

```tsx
const { isOpen, openModal, closeModal, toggleModal } = useLoginModal();
```

Returns:
- `isOpen`: Current modal state
- `openModal`: Function to open the modal
- `closeModal`: Function to close the modal  
- `toggleModal`: Function to toggle modal state

## Integration Examples

### 1. Navbar Integration

```tsx
// Already integrated in src/components/Navbar.tsx
import { useLoginModal } from '../hooks/useLoginModal';

// Shows "Login" button for unauthenticated users
// Opens modal instead of navigating to /login page
```

### 2. Protected Content

```tsx
function ProtectedContent() {
  const { data: session } = useSession();
  const { isOpen, openModal, closeModal } = useLoginModal();

  if (!session) {
    return (
      <div>
        <p>Please log in to view this content.</p>
        <button onClick={openModal}>Login</button>
        <LoginModal isOpen={isOpen} onClose={closeModal} />
      </div>
    );
  }

  return <div>Protected content here...</div>;
}
```

### 3. Call-to-Action

```tsx
function CallToAction() {
  const { isOpen, openModal, closeModal } = useLoginModal();

  return (
    <div className="cta-section">
      <h2>Ready to get started?</h2>
      <button onClick={openModal} className="cta-button">
        Sign Up Now
      </button>
      <LoginModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
}
```

## Animation Behavior

1. **Initial State**: Compact card showing only "LOGIN" text
2. **Hover/Focus**: Expands to show full form with smooth transitions
3. **Modal Entry**: Fade-in overlay with slide-in animation
4. **Background**: Rotating gradient animations continue throughout

## Authentication Flow

1. **Login Mode**: Email/password authentication
2. **Registration Mode**: New user signup with email verification
3. **OTP Verification**: 6-digit code sent via email
4. **Google OAuth**: One-click Google sign-in
5. **Success**: Modal closes automatically, optional callback triggered

## Styling

The component uses CSS Modules (`LoginModal.module.css`) with:
- Modal overlay with backdrop blur
- Responsive breakpoints for mobile devices
- Same gradient animations as original LoginCard
- Dark theme with cyan accents

## Demo

Visit `/demo-modal` to see the component in action with usage examples.

## Files

- `src/components/LoginModal.tsx` - Main component
- `src/components/LoginModal.module.css` - Styles
- `src/hooks/useLoginModal.ts` - State management hook
- `src/app/demo-modal/page.tsx` - Demo page

## Notes

- The original `/login` page remains unchanged
- Modal prevents body scrolling when open
- ESC key and click-outside-to-close supported
- Fully accessible with proper focus management
- Works with existing NextAuth.js configuration