import { FC, ReactNode } from 'react';
import { Button } from '../ui/button';
import { signIn } from 'next-auth/react';
import { toast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';

interface GithubSignInButtonProps {
  children: ReactNode;
}

const GoogleSignInButton: FC<GithubSignInButtonProps> = ({ children }) => {
  const router = useRouter()

  const  loginWithGoogle = async () => {
    const signInData = await signIn('github');

    if(signInData?.error)
      {
        toast({
          title: "Failed to Login",
          description: "Something went wrong with Github.", 
          variant: "destructive",
        })

        setTimeout(() => {
          router.push('/sign-in');
        }, 2000);
      }else{
        toast({
          title: "Success!",
          description: "Welcome back, heading home!", 
        })
          router.push('/');

      }
    
  };

  return (
    <Button onClick={loginWithGoogle} className='w-full'>
      {children}
    </Button>
  );
};

export default GoogleSignInButton;