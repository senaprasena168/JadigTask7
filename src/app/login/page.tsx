// src/app/login/page.jsx

import LoginCard from '../../components/LoginCard'; // Fixed import path

export const metadata = {
  title: 'PetStore Login',
  description: 'Login to your PetStore account',
};

export default function LoginPage() {
  return (
    <main className="login-page">
      <LoginCard />
    </main>
  );
}