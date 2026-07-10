import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import { registerSW } from 'virtual:pwa-register';
import './index.css';

registerSW({ immediate: true });

hydrateRoot(document, 
    <StrictMode>
        <HydratedRouter />
    </StrictMode>,
);