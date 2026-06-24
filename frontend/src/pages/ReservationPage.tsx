import React from 'react';
import Layout from '../components/Layout';
import { useCreateReservation } from '../hooks/useReservations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod schema definition for CreateReservationRequest
const reservationSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
  reservationTime: z.string().refine((val) => {
    const now = new Date();
    const reservationDate = new Date(val);
    // Check if the date is valid and in the future
    return !isNaN(reservationDate.getTime()) && reservationDate > now;
  }, 'Reservation time must be in the future'),
  partySize: z.number().min(1, 'Party size must be at least 1'),
  specialRequests: z.string().optional(),
});

// Infer the TypeScript type from the Zod schema
type ReservationFormInputs = z.infer<typeof reservationSchema>;

const ReservationPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReservationFormInputs>({
    resolver: zodResolver(reservationSchema),
  });

  const { mutate, isPending, isSuccess, isError } = useCreateReservation();

  const onSubmit = (data: ReservationFormInputs) => {
    mutate(data, {
      onSuccess: () => {
        reset(); // Clear the form fields on successful reservation
      }
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5] p-8">
        <h1 className="text-5xl font-bold text-center mb-12 font-serif">
          Reserve Your Experience at Filament
        </h1>

        {isSuccess ? (
          <div className="max-w-md mx-auto bg-[#2A2A2A] p-8 rounded-lg shadow-lg text-center">
            <p className="text-xl text-[#FFB800]">Thank you! Your reservation request has been received. We will confirm with you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto bg-[#2A2A2A] p-8 rounded-lg shadow-lg">
            <div className="mb-4">
              <label htmlFor="customerName" className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="customerName"
                {...register('customerName')}
                className="w-full p-3 rounded-md bg-[#3A3A3A] text-[#F5F5F5] border border-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
              />
              {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="customerEmail" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="customerEmail"
                {...register('customerEmail')}
                className="w-full p-3 rounded-md bg-[#3A3A3A] text-[#F5F5F5] border border-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
              />
              {errors.customerEmail && <p className="text-red-500 text-sm mt-1">{errors.customerEmail.message}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="customerPhone" className="block text-sm font-medium mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="customerPhone"
                {...register('customerPhone')}
                className="w-full p-3 rounded-md bg-[#3A3A3A] text-[#F5F5F5] border border-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
              />
              {errors.customerPhone && <p className="text-red-500 text-sm mt-1">{errors.customerPhone.message}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="partySize" className="block text-sm font-medium mb-2">
                Party Size
              </label>
              <input
                type="number"
                id="partySize"
                {...register('partySize', { valueAsNumber: true })}
                min="1"
                className="w-full p-3 rounded-md bg-[#3A3A3A] text-[#F5F5F5] border border-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
              />
              {errors.partySize && <p className="text-red-500 text-sm mt-1">{errors.partySize.message}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="reservationTime" className="block text-sm font-medium mb-2">
                Reservation Time
              </label>
              <input
                type="datetime-local"
                id="reservationTime"
                {...register('reservationTime')}
                className="w-full p-3 rounded-md bg-[#3A3A3A] text-[#F5F5F5] border border-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
              />
              {errors.reservationTime && <p className="text-red-500 text-sm mt-1">{errors.reservationTime.message}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="specialRequests" className="block text-sm font-medium mb-2">
                Special Requests (optional)
              </label>
              <textarea
                id="specialRequests"
                {...register('specialRequests')}
                rows={4}
                className="w-full p-3 rounded-md bg-[#3A3A3A] text-[#F5F5F5] border border-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
              ></textarea>
              {errors.specialRequests && <p className="text-red-500 text-sm mt-1">{errors.specialRequests.message}</p>}
            </div>

            {isError && (
              <p className="text-red-500 text-center mb-4">Sorry, we couldn't process your reservation. Please try again later.</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 rounded-md bg-[#FFB800] text-[#1A1A1A] font-semibold text-lg hover:bg-[#E0A000] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-[#1A1A1A]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Confirming...
                </span>
              ) : (
                'Confirm Your Spot'
              )}
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default ReservationPage;