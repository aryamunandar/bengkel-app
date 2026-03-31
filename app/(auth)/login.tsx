import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import AuthFormCard from '../components/AuthFormCard';
import { useAuth } from '../context/AuthProvider';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    await signIn(email, password);
  };

  return (
    <AuthFormCard
      title="Login"
      subtitle="Masuk untuk lihat booking dan status servis kamu."
      submitLabel="Sign In"
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={submit}
      footerLabel="Create account"
      onFooterPress={() => router.push('/(auth)/register')}
    />
  );
}
