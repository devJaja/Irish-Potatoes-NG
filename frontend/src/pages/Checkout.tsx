import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { ordersAPI } from '../services/api';
import { nigerianStates } from '../utils/nigerianStates';

// Mock API for order submission
// const API = {
//   submitOrder: async (data: CheckoutFormData) => {
//     return new Promise<{ success: boolean; orderId: string; message: string }>((resolve) => {
//       setTimeout(() => {
//         resolve({
//           success: true,
//           orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
//           message: 'Order placed successfully!'
//         });
//       }, 1500);
//     });
//   }
// };

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => (
  <div className="group relative inline-block ml-1">
    <Info className="w-4 h-4 text-gray-400 cursor-help" />
    <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg -left-28">
      {text}
    </div>
  </div>
);

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  deliveryState: string; // For Nigerian delivery
  deliveryAddress: string;
  isInternationalDelivery: boolean;
  internationalCountry: string;
  internationalAddress: string;
  paymentMethod: 'paystack' | 'bank_transfer' | '';
}

type CheckoutFormErrors = {
  [key in keyof CheckoutFormData]?: string;
};

const Checkout: React.FC = () => {
  const { items: cartItems, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    deliveryState: '',
    deliveryAddress: '',
    isInternationalDelivery: false,
    internationalCountry: '',
    internationalAddress: '',
    paymentMethod: '',
  });

  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [touched, setTouched] = useState<{[key in keyof CheckoutFormData]?: boolean}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState(0);

  // Mock delivery cost calculation
  useEffect(() => {
    if (formData.isInternationalDelivery) {
      setDeliveryCost(50000); // Higher cost for international
    } else if (formData.deliveryState) {
      // Basic mock based on state
      if (['Lagos', 'Abuja', 'Plateau'].includes(formData.deliveryState)) {
        setDeliveryCost(2000);
      } else {
        setDeliveryCost(5000);
      }
    } else {
      setDeliveryCost(0);
    }
  }, [formData.isInternationalDelivery, formData.deliveryState]);

  const validatePhone = (phone: string): boolean => {
    const pattern = /^(\+234|0)[789]\d{9}$/;
    return pattern.test(phone.replace(/\s/g, ''));
  };

  const validateEmail = (email: string): boolean => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: CheckoutFormErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid Nigerian phone format (+234 or 0)';
    }

    if (formData.isInternationalDelivery) {
      if (!formData.internationalCountry.trim()) newErrors.internationalCountry = 'Country is required';
      if (!formData.internationalAddress.trim()) newErrors.internationalAddress = 'International address is required';
    } else {
      if (!formData.deliveryState) newErrors.deliveryState = 'Please select a state';
      if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = 'Delivery address is required';
    }

    if (!formData.paymentMethod) newErrors.paymentMethod = 'Please select a payment method';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CheckoutFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));

    // Real-time validation (basic)
    if (touched[field]) {
      const newErrors: CheckoutFormErrors = { ...errors };
      if (field === 'email' && typeof value === 'string' && !validateEmail(value)) {
        newErrors.email = 'Invalid email format';
      } else if (field === 'phone' && typeof value === 'string' && !validatePhone(value)) {
        newErrors.phone = 'Invalid phone format';
      } else {
        delete newErrors[field];
      }
      setErrors(newErrors);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Please add products before checking out.');
      navigate('/products');
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      // 1. RENAME `products` to `items` to match backend
      items: cartItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      // 2. RESTRUCTURE `shippingAddress` to match backend model
      shippingAddress: {
        street: formData.isInternationalDelivery ? formData.internationalAddress : formData.deliveryAddress,
        city: formData.isInternationalDelivery ? formData.internationalCountry : formData.deliveryState, // Note: FE 'city' maps to BE 'state' for Nigeria
        state: formData.isInternationalDelivery ? '' : formData.deliveryState,
        zipCode: '', // This field is in the BE model but not the FE form
        phone: formData.phone,
      },
      // 3. REMOVE fields the backend calculates or doesn't use on creation
      // totalAmount is recalculated on the backend for security
      // paymentMethod is not used in the Order creation schema
    };

    try {
      const response = await ordersAPI.createOrder(orderData);
      if (response.data) {
        toast.success('Order placed successfully! You will receive a confirmation email shortly.');
        clearCart();
        navigate('/order-tracking', { state: { orderId: response.data.order._id } });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Order submission failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Checkout</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-gray-700">Your cart is empty!</h2>
            <p className="text-gray-500 mt-2">Add some delicious Plateau potatoes to your cart to proceed to checkout.</p>
            <button
              onClick={() => navigate('/products')}
              className="mt-6 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Go to Products
            </button>
          </div>
        ) : (
          <>
            {/* Personal Information & Delivery */}
            <div className="space-y-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Delivery Information</h2>
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    errors.fullName && touched.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && touched.fullName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && touched.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                  <Tooltip text="Format: +234XXXXXXXXXX or 0XXXXXXXXXXX" />
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    errors.phone && touched.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+234 803 456 7890"
                />
                {errors.phone && touched.phone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* International Delivery Toggle */}
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="internationalDelivery"
                  checked={formData.isInternationalDelivery}
                  onChange={(e) => handleInputChange('isInternationalDelivery', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-green-600 transition duration-150 ease-in-out"
                />
                <label htmlFor="internationalDelivery" className="ml-2 text-gray-700 font-medium">
                  Deliver outside Nigeria
                </label>
              </div>

              {/* Conditional Delivery Fields */}
              {formData.isInternationalDelivery ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="internationalCountry"
                      value={formData.internationalCountry}
                      onChange={(e) => handleInputChange('internationalCountry', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                        errors.internationalCountry && touched.internationalCountry ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter country"
                    />
                    {errors.internationalCountry && touched.internationalCountry && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.internationalCountry}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      International Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="internationalAddress"
                      value={formData.internationalAddress}
                      onChange={(e) => handleInputChange('internationalAddress', e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                        errors.internationalAddress && touched.internationalAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter full international address"
                    />
                    {errors.internationalAddress && touched.internationalAddress && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.internationalAddress}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State in Nigeria <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="deliveryState"
                      value={formData.deliveryState}
                      onChange={(e) => handleInputChange('deliveryState', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                        errors.deliveryState && touched.deliveryState ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a State</option>
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {errors.deliveryState && touched.deliveryState && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.deliveryState}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                        errors.deliveryAddress && touched.deliveryAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full delivery address within Nigeria"
                    />
                    {errors.deliveryAddress && touched.deliveryAddress && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.deliveryAddress}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Method</h2>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paystack"
                    checked={formData.paymentMethod === 'paystack'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="form-radio h-4 w-4 text-green-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-gray-700">Paystack (Card/Bank Transfer)</span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="form-radio h-4 w-4 text-green-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-gray-700">Direct Bank Transfer</span>
                </label>
              </div>
              {errors.paymentMethod && touched.paymentMethod && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.paymentMethod}
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-2">
                {cartItems.map(item => (
                  <div key={item.product._id} className="flex justify-between text-gray-700">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>₦{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t border-gray-200">
                  <span>Subtotal</span>
                  <span>₦{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-800">
                  <span>Delivery Cost</span>
                  <span>₦{deliveryCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-primary-600 pt-2 border-t border-gray-300">
                  <span>Total Payable</span>
                  <span>₦{(totalAmount + deliveryCost).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Info className="w-5 h-5 mr-2 animate-spin" /> Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;

