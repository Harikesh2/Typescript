'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Checkbox,
  FormControl,
  Heading,
  Link,
  Stack,
  Text,
  TextInput,
} from '@primer/react';
import {
  EyeClosedIcon,
  EyeIcon,
  LockIcon,
  PersonIcon,
  StackIcon,
} from '@primer/octicons-react';
import { AuthShell } from '@/components/crm/auth-shell';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    non_field_errors?: string;
  }>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!username.trim()) {
      nextErrors.username = 'Username is required';
    }
    if (!password) {
      nextErrors.password = 'Password is required';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setErrors(data);
          setSubmitting(false);
          return;
        }
        router.push('/dashboard');
        router.refresh();
      })
      .catch(() => {
        setErrors({ non_field_errors: 'Something went wrong. Please try again.' });
        setSubmitting(false);
      });
  }

  return (
    <AuthShell>
      <Stack direction="vertical" gap="spacious" align="center">
        <Stack direction="vertical" gap="condensed" align="center">
          <div
            aria-hidden="true"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 'var(--borderRadius-medium)',
              backgroundColor: 'var(--bgColor-accent-emphasis)',
              color: 'var(--fgColor-onEmphasis)',
            }}
          >
            <StackIcon size={24} />
          </div>
          <Heading as="h1" variant="medium">
            Sign in to Relay CRM
          </Heading>
          <Text style={{ color: 'var(--fgColor-muted)' }}>
            Welcome back. Enter your details to continue.
          </Text>
        </Stack>

        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--bgColor-default)',
            border:
              'var(--borderWidth-thin) solid var(--borderColor-default)',
            borderRadius: 'var(--borderRadius-large)',
            boxShadow: 'var(--shadow-resting-medium)',
          }}
        >
          <Stack direction="vertical" gap="normal" padding="spacious">
            <form onSubmit={handleSubmit} noValidate>
              <Stack direction="vertical" gap="normal">
                <FormControl>
                  <FormControl.Label>Username</FormControl.Label>
                  <TextInput
                    type="text"
                    name="username"
                    block
                    leadingVisual={PersonIcon}
                    placeholder="Enter your username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    validationStatus={errors.username ? 'error' : undefined}
                  />
                  {errors.username ? (
                    <FormControl.Validation variant="error">
                      {errors.username}
                    </FormControl.Validation>
                  ) : null}
                </FormControl>

                <FormControl>
                  <FormControl.Label>Password</FormControl.Label>
                  <TextInput
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    block
                    leadingVisual={LockIcon}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    validationStatus={errors.password ? 'error' : undefined}
                    trailingAction={
                      <TextInput.Action
                        onClick={() => setShowPassword((v) => !v)}
                        icon={showPassword ? EyeClosedIcon : EyeIcon}
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                      />
                    }
                  />
                  {errors.password ? (
                    <FormControl.Validation variant="error">
                      {errors.password}
                    </FormControl.Validation>
                  ) : null}
                </FormControl>

                {errors.non_field_errors ? (
                  <FormControl.Validation variant="error">
                    {errors.non_field_errors}
                  </FormControl.Validation>
                ) : null}

                <Stack
                  direction="horizontal"
                  align="center"
                  justify="space-between"
                  wrap="wrap"
                  gap="condensed"
                >
                  <FormControl>
                    <Checkbox />
                    <FormControl.Label>Remember me</FormControl.Label>
                  </FormControl>
                  <Link href="#" muted>
                    Forgot password?
                  </Link>
                </Stack>

                <Button
                  type="submit"
                  variant="primary"
                  block
                  size="large"
                  loading={submitting}
                  loadingAnnouncement="Signing in…"
                >
                  Sign in
                </Button>
              </Stack>
            </form>
          </Stack>
        </div>

        <Text style={{ color: 'var(--fgColor-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register">Create one</Link>
        </Text>
      </Stack>
    </AuthShell>
  );
}