import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface InvitationEmailProps {
  registerUrl: string;
  roleName: string;
  inviterName?: string;
}

export function InvitationEmail({ registerUrl, roleName, inviterName }: InvitationEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Fuiste invitado a unirte a Flowy como {roleName}</Preview>
      <Body style={main}>
        <Container style={wrapper}>
          <Section style={header}>
            <Text style={brandName}>Flowy</Text>
          </Section>

          <Section style={body}>
            <Heading style={heading}>¡Te esperamos en Flowy!</Heading>

            <Text style={paragraph}>
              {inviterName ? (
                <>
                  <strong>{inviterName}</strong> te invitó a unirte al equipo como{' '}
                  <strong>{roleName}</strong>.
                </>
              ) : (
                <>
                  Recibiste una invitación para unirte a Flowy como{' '}
                  <strong>{roleName}</strong>.
                </>
              )}
            </Text>

            <Text style={paragraph}>
              Hacé clic en el botón para crear tu cuenta y empezar a trabajar.
            </Text>

            <Section style={buttonContainer}>
              <Button href={registerUrl} style={button}>
                Crear mi cuenta
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={fallbackLabel}>O copiá este enlace en tu navegador:</Text>
            <Link href={registerUrl} style={fallbackLink}>
              {registerUrl}
            </Link>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Este enlace es personal e intransferible. Expira en 7 días.
            </Text>
            <Text style={footerText}>
              Si no esperabas esta invitación, podés ignorar este correo.
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerCopy}>© {new Date().getFullYear()} Flowy</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const wrapper: React.CSSProperties = {
  margin: '40px auto',
  maxWidth: '560px',
};

const header: React.CSSProperties = {
  backgroundColor: '#18181b',
  borderRadius: '12px 12px 0 0',
  padding: '28px 40px',
  textAlign: 'center',
};

const brandName: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '26px',
  fontWeight: '700',
  letterSpacing: '-0.5px',
  margin: '0',
};

const body: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '40px 48px 32px',
};

const heading: React.CSSProperties = {
  color: '#18181b',
  fontSize: '22px',
  fontWeight: '700',
  letterSpacing: '-0.3px',
  margin: '0 0 20px',
};

const paragraph: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 14px',
};

const buttonContainer: React.CSSProperties = {
  margin: '28px 0 32px',
};

const button: React.CSSProperties = {
  backgroundColor: '#f59e0b',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '15px',
  fontWeight: '600',
  padding: '13px 28px',
  textDecoration: 'none',
};

const divider: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '0 0 24px',
};

const fallbackLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  margin: '0 0 6px',
};

const fallbackLink: React.CSSProperties = {
  color: '#f59e0b',
  fontSize: '12px',
  wordBreak: 'break-all',
};

const footer: React.CSSProperties = {
  backgroundColor: '#fafafa',
  borderRadius: '0 0 12px 12px',
  padding: '24px 48px 28px',
  border: '1px solid #e4e4e7',
  borderTop: 'none',
};

const footerText: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 4px',
};

const footerDivider: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '16px 0',
};

const footerCopy: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '12px',
  margin: '0',
};
