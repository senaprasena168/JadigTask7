import Link from 'next/link';

export default function Home() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-gray-800 mb-6'>
          Welcome to Cat Food Store
        </h1>
        <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
          A comprehensive cat food management system built with Next.js, Redux, 
          Tailwind CSS, and Neon Database. Explore our premium cat food products and manage your inventory efficiently.
        </p>
        
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12'>
          <Link 
            href='/products' 
            className='bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg shadow-lg transition-colors'
          >
            <h3 className='text-xl font-semibold mb-2'>View Products</h3>
            <p className='text-blue-100'>Browse our product catalog</p>
          </Link>
          
          <Link 
            href='/admin' 
            className='bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg shadow-lg transition-colors'
          >
            <h3 className='text-xl font-semibold mb-2'>Admin Panel</h3>
            <p className='text-green-100'>Manage products and inventory</p>
          </Link>
          
          <Link 
            href='/about' 
            className='bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-lg shadow-lg transition-colors'
          >
            <h3 className='text-xl font-semibold mb-2'>About Us</h3>
            <p className='text-purple-100'>Learn more about our mission</p>
          </Link>
          
          <Link 
            href='/profile' 
            className='bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-lg shadow-lg transition-colors'
          >
            <h3 className='text-xl font-semibold mb-2'>Profile</h3>
            <p className='text-orange-100'>View your profile information</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
