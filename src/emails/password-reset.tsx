import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'

interface Props {
  fullName: string
  resetUrl: string
}

export function PasswordResetEmail({ fullName, resetUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Reset password Minilemon</Preview>
      <Body style={{ background: '#FAFAF5', fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 600, padding: '32px 24px', background: 'white', margin: '24px auto', borderRadius: 16 }}>
          <Heading style={{ fontFamily: 'serif', fontSize: 22, color: '#1A1814' }}>Reset password Anda</Heading>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>Halo {fullName},</Text>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>
            Klik tombol berikut untuk reset password. Tautan akan kedaluwarsa dalam 1 jam.
          </Text>
          <Button
            href={resetUrl}
            style={{
              background: '#1A1814',
              color: '#FFD93D',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Reset Password
          </Button>
          <Text style={{ color: '#9C9384', fontSize: 12, marginTop: 24 }}>
            Jika Anda tidak meminta reset password, abaikan email ini.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

PasswordResetEmail.subject = 'Reset password Minilemon'
