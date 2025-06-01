import Image from 'next/image';
import transImage from '@/public/translate.png'

export default function TranslateImage(){

  return(
    <div className='w-1/2 h-full sm:hidden md:flex items-center justify-start'>
      <Image className='md:p-8 lg:p-16 object-cover' src={transImage} alt='translateImg' priority/>
    </div>
  )
}