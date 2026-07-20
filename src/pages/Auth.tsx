import { getId } from '../utils/aws-utils';
import { useEffect } from 'react';
import { useAuth } from "react-oidc-context";

function Auth() {
  const auth = useAuth();

  useEffect(() => {
    const fetchIdentityId = async () => {
           if (auth.user?.id_token) {
            await getId(auth.user?.id_token);
            window.location.href = "/";
           }
        }
        if (auth.isAuthenticated) fetchIdentityId();
  }, [auth.isAuthenticated]);

  return (
    <div>
      <h1>Auth Page</h1>
    </div>
  )
}

export default Auth
