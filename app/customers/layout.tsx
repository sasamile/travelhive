import CustomersNav from '@/components/customers/CustomersNav'
import React from 'react'

function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        <CustomersNav />
        {children}
    </div>
  )
}

export default CustomerLayout