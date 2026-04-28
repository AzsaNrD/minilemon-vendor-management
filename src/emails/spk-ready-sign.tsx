import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'

interface Props {
  vendorName: string
  docNumber: string
  projectUrl: string
}

export function SPKReadySignEmail({ vendorName, docNumber, projectUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>SPK {docNumber} siap untuk Anda tandatangani</Preview>
      <Body style={{ background: '#FAFAF5', fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        <Container
          style={{ maxWidth: 600, padding: '32px 24px', background: 'white', margin: '24px auto', borderRadius: 16 }}
        >
          <Heading style={{ fontFamily: 'serif', fontSize: 22, color: '#1A1814' }}>SPK siap untuk TTD</Heading>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>Halo {vendorName},</Text>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>
            SPK <code>{docNumber}</code> telah ditandatangani admin Minilemon. Mohon TTD final untuk memulai
            pengerjaan project.
          </Text>
          <Button
            href={projectUrl}
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
            TTD SPK
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

SPKReadySignEmail.subject = 'SPK siap untuk Anda tandatangani — Minilemon'
