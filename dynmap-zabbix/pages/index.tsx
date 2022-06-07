import type { NextPage } from 'next'
import Head from '../components/head'
import Image from 'next/image'

import dynamic from 'next/dynamic'

const DynamicMapComponent = dynamic(() => import('../components/map'), {ssr: false})

const Home: NextPage = () => {
  return (
    <div>
      <Head />
      <DynamicMapComponent />
    </div>
  )
}

export default Home
