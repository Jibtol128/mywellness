import './globals.css'
import ClientWrapper from '../components/ClientWrapper'

export const metadata = {
  title: 'My Wellness Doctor - Online Medical Consultation',
  description: 'Get instant AI-powered wellness insights based on your symptoms',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ]
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}
