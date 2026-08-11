'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Checkbox,
  FormControl,
  Heading,
  Link,
  Stack,
  Text,
  TextInput,
} from '@primer/react'
import {
  EyeClosedIcon,
  EyeIcon,
  LockIcon,
  MailIcon,
  StackIcon,
} from '@primer/octicons-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  )

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: { email?: string; password?: string } = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address'
    }
    if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    // UI-only: simulate a sign-in request before redirecting.
    setTimeout(() => router.push('/dashboard'), 600)
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--base-size-24)',
        backgroundColor: 'var(--bgColor-inset)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
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
                    <FormControl.Label>Email</FormControl.Label>
                    <TextInput
                      type="email"
                      name="email"
                      block
                      leadingVisual={MailIcon}
                      placeholder="you@company.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      validationStatus={errors.email ? 'error' : undefined}
                    />
                    {errors.email ? (
                      <FormControl.Validation variant="error">
                        {errors.email}
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
            <Link href="#">Request access</Link>
          </Text>
        </Stack>
      </div>
    </main>
  )
}
