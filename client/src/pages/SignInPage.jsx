import { SigninForm } from '@/components/auth/signin-form';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function SigninPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
      console.log(user);
    }
  }, [user, navigate, location]);
  return (
    <div className="min-h-screen w-full bg-white relative text-gray-800">
      {/* Crosshatch Art - Light Pattern */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #475569 100%)",
        }}
      />
      {/* Your Content/Components */}
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 relative z-10">
        <div className="w-full max-w-sm md:max-w-4xl">
          <SigninForm />
        </div>
      </div>
    </div>
  );
}
export default SigninPage;
