'use client'

import { notFound } from 'next/navigation'
import { servicesData } from '@/lib/services-data'
import ServiceDetails from '@/components/ServiceDetails'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ServicePage({ params }: PageProps) {
  const { id: serviceId } = await params

  // Find the service in our data
  const service = servicesData.find(s => s.id === serviceId)

  if (!service) {
    notFound()
  }

  return <ServiceDetails service={service} />
}
