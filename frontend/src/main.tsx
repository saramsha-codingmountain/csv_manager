import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={{
      fontFamily: 'Inter, sans-serif',
      defaultRadius: 'lg',
      primaryColor: 'green',

    }}>
      <Notifications />
      <App />
    </MantineProvider>
  </React.StrictMode>,
)

