import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import AuthFormCard from '../components/AuthFormCard';
import { useAuth } from '../context/AuthProvider';

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    await register(email, password);
  };

  return (
    <AuthFormCard
      title="Register"
      subtitle="Buat akun baru untuk simpan booking dan riwayat servis."
      submitLabel="Create Account"
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={submit}
      footerLabel="Already have an account? Login"
      onFooterPress={() => router.replace('/(auth)/login')}
    />
  );
}
