import { useState } from 'react';
import { Footer } from '@/components/Footer';
import Header from '@/components/Header';
import { createFileRoute } from '@tanstack/react-router'
import * as motion from "motion/react-client";
import CustomerForm from '@/components/CustomerForm';
import DriverForm from '@/components/DriverForm';
import StoreForm from '@/components/StoreForm';

export const Route = createFileRoute('/register')({
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedTab, setSelectedTab] = useState('customer')
  const tabs = [
    { id: 'customer', label: 'Customers ' },
    { id: 'driver', label: 'Drivers ' },
    { id: 'store', label: 'Stores ' },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center py-4"
        style={{
          backgroundImage: "url('/delivery.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.2,
            scale: { type: "spring", visualDuration: 0.8, bounce: 0.2, ease: "easeInOut" },
          }}
        >
          <div className=" lg:max-w-3xl rounded-2xl shadow-2xl md:w-full">
            <div className="flex justify-center space-x-4 bg-white rounded-lg p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${selectedTab === tab.id
                    ? 'border-[#189AB4] text-[#189AB4]'
                    : 'border-transparent text-gray-500 hover:text-[#05445E] hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {selectedTab === 'store' && <StoreForm />}
            {selectedTab === 'driver' && <DriverForm />}
            {selectedTab === 'customer' && <CustomerForm />}
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

