import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  title: 'RaisoVoice — The Vishanti Petition | MNNIT Allahabad',
  description:
    'Anonymous, tamper-evident student grievance and complaint resolution platform for MNNIT Allahabad. Protected with SHA-256 cryptographic audit chaining and automated SLA escalation. Built by Team ByteForge for Webster 2026.',
  keywords: [
    'MNNIT Allahabad',
    'Student Grievance',
    'Anonymous Complaint',
    'RaisoVoice',
    'Vishanti Petition',
    'ByteForge',
    'Webster 2026',
    'Tamper Evident Audit',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
