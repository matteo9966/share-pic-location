import { getId } from '../utils/aws-utils';
import { useEffect } from 'react';
import { useAuth } from "../providers/AuthProvider";

function Auth() {
  const auth = useAuth();

  useEffect(() => {
    const fetchIdentityId = async () => {
           if (auth.user?.id_token) {
            await getId(auth.user?.id_token);
            window.location.href = "/dashboard";
           }
        }
        if (auth.isAuthenticated) fetchIdentityId();
  }, [auth.isAuthenticated]);

  return (
    <div>
      <h1>Auth Page</h1>
      here you can handle authentication logic, such as redirecting to the dashboard after successful login.
    </div>
  )
}

export default Auth
