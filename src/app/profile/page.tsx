import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-800 mb-8 text-center'>
          Store Profile
        </h1>

        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='bg-gradient-to-r from-blue-500 to-purple-600 h-32'></div>

          <div className='relative px-8 pb-8'>
            <div className='flex justify-center -mt-16 mb-6'>
              <div className='w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg'>
                <div className='w-28 h-28 bg-gray-200 rounded-full overflow-hidden'>
                  <Image
                    src='/wetkingcat.png'
                    alt='Cat Food Store Profile'
                    width={112}
                    height={112}
                    className='w-full h-full object-cover'
                  />
                </div>
              </div>
            </div>

            <div className='text-center space-y-4'>
              <div>
                <h2 className='text-2xl font-bold text-gray-800'>
                  Cat Food Store
                </h2>
                <p className='text-gray-600'>and Accessories</p>
              </div>

              <div className='bg-gray-50 rounded-lg p-6 text-left space-y-4'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                    About
                  </h3>
                  <p className='text-gray-600'>
                    Welcome to Cat Food Store, your one-stop destination for
                    premium cat food and accessories. We are passionate about
                    providing the highest quality nutrition and products for
                    your beloved feline companions. Our carefully curated
                    selection ensures that every cat gets the love, care, and
                    nutrition they deserve to live their happiest and healthiest
                    lives.
                  </p>
                </div>

                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                    Products
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {[
                      'Cat Food',
                      'Catnip',
                      'Cat Toys',
                      'Cat Sand',
                      'Cat Collar',
                      'Cat Treats',
                      'Cat Bowls',
                      'Cat Beds',
                    ].map((product) => (
                      <Link
                        key={product}
                        href='/products'
                        className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors cursor-pointer'
                      >
                        {product}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                    Why Choose Us
                  </h3>
                  <p className='text-gray-600'>
                    We understand that every cat is unique, which is why we
                    offer a diverse range of premium products tailored to meet
                    different dietary needs, preferences, and lifestyles. From
                    nutritious meals to engaging toys and comfortable
                    accessories, we ensure quality and safety in every product
                    we offer.
                  </p>
                </div>

                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                    Our Mission
                  </h3>
                  <p className='text-gray-600'>
                    To provide cat owners with access to the finest quality cat
                    food and accessories, ensuring every feline friend receives
                    the nutrition and care they need to thrive. We are committed
                    to building lasting relationships with our customers through
                    exceptional products and outstanding service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
