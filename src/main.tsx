import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from "react-oidc-context";

const awsRegion = import.meta.env.VITE_AWS_REGION;
const congitoUserPoolID = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const congitoUserPoolClientID = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID;
const scope = import.meta.env.VITE_AWS_SCOPE;


const cognitoAuthConfig = {
  authority: `https://cognito-idp.${awsRegion}.amazonaws.com/${congitoUserPoolID}`,
  client_id: congitoUserPoolClientID,
  redirect_uri: import.meta.env.VITE_AWS_REDIRECT_URL,
  response_type: "code",
  scope: scope,
};


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig} revokeTokensOnSignout={true}>
      <App />
    </AuthProvider>
  </StrictMode>,
)
