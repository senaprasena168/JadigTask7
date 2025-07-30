import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-8'>
      <div className='text-center max-w-2xl'>
        <h1 className='text-6xl md:text-8xl font-bold mb-4 text-yellow-600'>
          404
        </h1>

        {/* Big centered doge image */}
        <div className='relative w-64 h-64 md:w-80 md:h-80 mb-4 mx-auto'>
          <Image
            src='/not-found/doge.jpg'
            alt='Doge meme'
            fill
            className='object-cover rounded-lg'
          />
        </div>

        <div className='bg-yellow-100 p-6 rounded-lg mb-4'>
          <h2 className='mt-2 text-xl md:text-2xl font-semibold text-yellow-800 mb-4'>
            Much Error. Very 404. Wow.
          </h2>
          <p className='text-base md:text-lg text-center text-gray-700'>
            Such page not found. Very sorry. Much confusion.
          </p>
        </div>

        <Link
          href='/'
          className='inline-block mt-4 text-base md:text-lg text-blue-600 hover:text-blue-800 font-semibold underline'
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
