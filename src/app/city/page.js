import CareerCity from '../../components/city/CareerCity'

const title = 'Career City | Drive through Kavin Pasupathy’s resume'
const description =
  'A small 3D driving game: steer a car around a low-poly city where each building is a part of Kavin Pasupathy’s resume (experience, projects, skills, education and contact). Includes an auto tour and a plain-list version.'

export const metadata = {
  title,
  description,
  alternates: { canonical: '/city' },
  openGraph: {
    type: 'website',
    url: '/city',
    siteName: 'Kavin Pasupathy',
    title,
    description,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function CityPage() {
  return <CareerCity />
}
