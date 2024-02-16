import ChangePasswordForm from '@/components/forms/ChangePasswordForm'
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { redirect } from "next/navigation";

const page = async () => {

  const session = await getServerSession(authOptions);

  if(session)
  {
    return (
      <section className="md:pt-28 max-sm:pt-24 lg:pt-0 ">
          <ChangePasswordForm userId={session.user.id}/>
      </section>
    )
  }
}

export default page