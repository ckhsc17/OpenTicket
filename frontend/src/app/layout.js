'use client';
import 'bootstrap/dist/css/bootstrap.min.css'
import "./globals.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { AuthProvider } from './context/AuthContext';
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
    <html lang="en">
      <head>
        <title>OpenTicket</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" /> 
        {/* 這裡添加 Material Icons 的 Google Web Fonts */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
 
      </head>
      <body>
        {children}
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" strategy="lazyOnload" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossOrigin="anonymous"></Script>
      </body>
    </html>
    </AuthProvider>
  );
}

