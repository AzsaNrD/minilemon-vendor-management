import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'

interface Props {
  fullName: string
  tempPassword: string
  loginUrl: string
}

export function InviteVendorEmail({ fullName, tempPassword, loginUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Selamat datang di Minilemon — Setup akun Anda</Preview>
      <Body style={{ background: '#FAFAF5', fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 600, padding: '32px 24px', background: 'white', margin: '24px auto', borderRadius: 16 }}>
          <Heading style={{ fontFamily: 'serif', fontSize: 22, color: '#1A1814' }}>
            Selamat datang di Minilemon
          </Heading>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>Halo {fullName},</Text>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>
            Tim Minilemon telah mengundang Anda untuk bergabung sebagai vendor. Berikut kredensial sementara Anda:
          </Text>
          <Section style={{ background: '#FFF9D6', padding: 16, borderRadius: 8, margin: '16px 0' }}>
            <Text style={{ margin: 0, fontSize: 14 }}>
              <strong>Password sementara:</strong>{' '}
              <code style={{ background: 'white', padding: '2px 8px', borderRadius: 4 }}>{tempPassword}</code>
            </Text>
          </Section>
          <Button
            href={loginUrl}
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
            Login Sekarang
          </Button>
          <Text style={{ color: '#9C9384', fontSize: 12, marginTop: 24 }}>
            Anda akan diminta mengganti password saat login pertama. Jika Anda tidak mengharapkan email ini, abaikan saja.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

InviteVendorEmail.subject = 'Selamat datang di Minilemon — Setup akun Anda'
