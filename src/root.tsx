import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from 'react-router';

import './index.css';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta 
                    name="viewport" 
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
                />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <link rel="manifest" href="/manifest.webmanifest" />
                <link rel="icon" href="/favicon.ico" sizes="48x48" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <meta name="theme-color" content="#FEF7FF" />
                <meta name="apple-mobile-web-app-title" content="Charni POS" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <title>Charni POS v2</title>
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export function HydrateFallback() {
  return (
    <div className="flex h-dvh items-center justify-center bg-surface">
      <p className="text-on-surface-variant">Loading...</p>
    </div>
  );
}

export default function Root() {
    return <Outlet />;
}
