export default function AboutPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-4xl font-bold text-gray-800 mb-8 text-center'>
          About Cat Food Store
        </h1>
        
        <div className='bg-white rounded-lg shadow-md p-8 space-y-6'>
          <section>
            <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
              Project Overview
            </h2>
            <p className='text-gray-600 leading-relaxed'>
              This is a comprehensive cat food management system built as part of the 
              Jabar Istimewa Digital Academy (JIDA) Fullstack Development program. 
              The application demonstrates modern web development practices for managing 
              premium cat food products using cutting-edge technologies.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
              Our Mission
            </h2>
            <p className='text-gray-600 leading-relaxed'>
              We are dedicated to providing the highest quality cat food products 
              for your beloved feline companions. Our store offers a curated selection 
              of nutritious and delicious options to keep your cats healthy and happy.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
              Features
            </h2>
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='bg-blue-50 p-4 rounded-lg'>
                <h4 className='font-medium text-blue-800 mb-2'>Cat Food Management</h4>
                <p className='text-blue-600 text-sm'>Full CRUD operations for cat food products with image support</p>
              </div>
              <div className='bg-green-50 p-4 rounded-lg'>
                <h4 className='font-medium text-green-800 mb-2'>Admin Dashboard</h4>
                <p className='text-green-600 text-sm'>Comprehensive admin interface for managing cat food inventory</p>
              </div>
              <div className='bg-purple-50 p-4 rounded-lg'>
                <h4 className='font-medium text-purple-800 mb-2'>Responsive Design</h4>
                <p className='text-purple-600 text-sm'>Mobile-first design that works on all devices</p>
              </div>
              <div className='bg-orange-50 p-4 rounded-lg'>
                <h4 className='font-medium text-orange-800 mb-2'>State Management</h4>
                <p className='text-orange-600 text-sm'>Redux Toolkit for predictable state updates</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
