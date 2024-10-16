import { getUserFromCookie } from '../lib/getUser';

import Dashboard from '../components/Dashboard';
import RegisterForm from '../components/RegisterForm';

export default async function Page() {
    const user = await getUserFromCookie();

    return (
        <>
            {user && <Dashboard user={user} />}

            {!user && (
                <>
                    <p className='text-center text-2xl text-gray-600 mb-5'>
                        Don't have an account? <strong>Create One</strong>
                    </p>

                    <RegisterForm />
                </>
            )}
        </>
    )
}