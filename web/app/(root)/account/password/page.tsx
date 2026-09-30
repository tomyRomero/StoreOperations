import ChangePasswordForm from '@/components/forms/ChangePasswordForm'
import { requireUser } from '@/lib/session';

const page = async () => {
  await requireUser('/account/password');

  return (
    <section className="md:pt-28 max-sm:pt-24 lg:pt-0 ">
        <ChangePasswordForm />
    </section>
  )
}

export default page
