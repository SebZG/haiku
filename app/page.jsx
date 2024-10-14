import Link from 'next/link';

import RegisterForm from '../components/registerForm';

export default function Page() {
    return (
        <>

            <p className='text-center text-2xl text-gray-600 mb-5'>
                Don't have an account? <strong>Create One</strong>
            </p>

            <RegisterForm />

        </>
    )
}