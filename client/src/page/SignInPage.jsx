import { SigninForm } from '@/components/auth/signin-form';
import { useAuth } from '@/context/authContext';
import { useNavigate } from 'react-router-dom';

function SigninPage() {
  const navigate = useNavigate();
  const {user} = useAuth();
  if (user){
    navigate('/');
  }
  return (
    <div className="min-h-screen w-full bg-white relative text-gray-800">
  {/* Crosshatch Art - Light Pattern */}
  <div
    className="absolute inset-0 z-0 pointer-events-none"
    style={{
      backgroundImage: `
        repeating-linear-gradient(22.5deg, transparent, transparent 2px, rgba(75, 85, 99, 0.06) 2px, rgba(75, 85, 99, 0.06) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(67.5deg, transparent, transparent 2px, rgba(107, 114, 128, 0.05) 2px, rgba(107, 114, 128, 0.05) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(112.5deg, transparent, transparent 2px, rgba(55, 65, 81, 0.04) 2px, rgba(55, 65, 81, 0.04) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(157.5deg, transparent, transparent 2px, rgba(31, 41, 55, 0.03) 2px, rgba(31, 41, 55, 0.03) 3px, transparent 3px, transparent 8px)
      `,
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