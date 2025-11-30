import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Save, Info, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface RegistrationProduct {

  id: number;

  name: string;

  price: number;

  unit: string;

  description: string;

  category: string;

}



interface CheckEmailResponse {

  exists: boolean;

}



interface SubmitRegistrationResponse {

  success: boolean;

  registrationId: string;

  message: string;

}



interface API {

  checkEmail: (email: string) => Promise<CheckEmailResponse>;

  submitRegistration: (data: FormData) => Promise<SubmitRegistrationResponse>;

}



// Mock API for email checking and submission

const API: API = {
  checkEmail: async (email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingEmails = ['test@example.com', 'john@mail.com'];
        resolve({ exists: existingEmails.includes(email.toLowerCase()) });
      }, 500);
    });
  },
  
  submitRegistration: async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          registrationId: 'NSPD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          message: 'Registration successful!'
        });
      }, 1500);
    });
  }
};

// Nigerian States
export const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

// Courses/Products (renamed to avoid confusion with actual products)
const registrationProducts: RegistrationProduct[] = [
  { id: 1, name: 'Premium Fresh Irish Potatoes', price: 1500, unit: 'per kg', description: 'Grade A potatoes, perfect for restaurants and homes', category: 'Fresh' },
  { id: 2, name: 'Organic Irish Potatoes', price: 2000, unit: 'per kg', description: 'Certified organic, pesticide-free potatoes', category: 'Organic' },
  { id: 3, name: 'Wholesale Bulk Pack', price: 28000, unit: 'per 25kg bag', description: 'Best value for retailers and bulk buyers', category: 'Wholesale' },
  { id: 4, name: 'Baby Potatoes', price: 1800, unit: 'per kg', description: 'Small, tender potatoes ideal for roasting', category: 'Fresh' },
  { id: 5, name: 'Red Potatoes', price: 1600, unit: 'per kg', description: 'Colorful variety with rich flavor', category: 'Fresh' },
  { id: 6, name: 'Seed Potatoes', price: 2500, unit: 'per kg', description: 'Quality seeds for farming and cultivation', category: 'Seeds' },
  { id: 7, name: 'Washed & Packed Potatoes', price: 1700, unit: 'per kg', description: 'Ready-to-cook, pre-washed potatoes', category: 'Fresh' },
  { id: 8, name: 'Wholesale Premium Pack', price: 35000, unit: 'per 25kg bag', description: 'Premium grade for high-end restaurants', category: 'Wholesale' },
  { id: 9, name: 'Monthly Subscription Box', price: 6000, unit: 'per month', description: '5kg delivered weekly to your doorstep', category: 'Subscription' },
  { id: 10, name: 'Retailer Starter Pack', price: 50000, unit: 'per pack', description: '50kg mixed varieties for new retailers', category: 'Wholesale' }
];

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

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  state: string;
  address: string;
  businessType: string;
  businessName: string;
  yearsInBusiness: string;
  monthlyVolume: string;
  selectedProducts: number[];
  paymentMethod: string;
  agreedToTerms: boolean;
}

type FormErrors = {
  [key in keyof FormData]?: string;
} & { selectedProducts?: string }; // Add selectedProducts specifically if it's not a keyof FormData

export default function Register() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    // Step 1: Personal Information
    fullName: '',
    email: '',
    phone: '',
    state: '',
    address: '',
    
    // Step 2: Business Background
    businessType: '',
    businessName: '',
    yearsInBusiness: '',
    monthlyVolume: '',
    
    // Step 3: Product Selection
    selectedProducts: [],
    
    // Step 4: Payment
    paymentMethod: '',
    agreedToTerms: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key in keyof FormData]?: boolean}>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [registrationId, setRegistrationId] = useState<string>('');
  const [emailChecking, setEmailChecking] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const totalSteps: number = 4;
  const estimatedTime: number = 5; // minutes

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setInterval(() => {
      localStorage.setItem('registrationDraft', JSON.stringify(formData));
      setLastSaved(new Date());
    }, 30000); // 30 seconds

    return () => clearInterval(autoSave);
  }, [formData]);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('registrationDraft');
    if (savedDraft) {
      const shouldRestore = window.confirm('We found a saved draft. Would you like to continue where you left off?');
      if (shouldRestore) {
        setFormData(JSON.parse(savedDraft));
      }
    }
  }, []);

  // Validation functions
  const validatePhone = (phone: string): boolean => {
    const pattern = /^(\+234|0)[789]\d{9}$/;
    return pattern.test(phone.replace(/\s/g, ''));
  };

  const validateEmail = (email: string): boolean => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  const checkEmailAvailability = async (email: string) => {
    if (!validateEmail(email)) return;
    
    setEmailChecking(true);
    const result: CheckEmailResponse = await API.checkEmail(email);
    
    if (result.exists) {
      setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
    } else {
      setErrors(prev => {
        const newErrors: FormErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
    setEmailChecking(false);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
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
      if (!formData.state) newErrors.state = 'Please select your state';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }

    if (step === 2) {
      if (!formData.businessType) newErrors.businessType = 'Business type is required';
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.yearsInBusiness) newErrors.yearsInBusiness = 'Please select years in business';
      if (!formData.monthlyVolume) newErrors.monthlyVolume = 'Monthly volume is required';
    }

    if (step === 3) {
      if (formData.selectedProducts.length === 0) {
        newErrors.selectedProducts = 'Please select at least one product';
      }
    }

    if (step === 4) {
      if (!formData.paymentMethod) newErrors.paymentMethod = 'Please select a payment method';
      if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));

    // Real-time validation
    if (touched[field]) {
      const newErrors: FormErrors = { ...errors };
      
      if (field === 'email' && typeof value === 'string') {
        if (!validateEmail(value)) {
          newErrors.email = 'Invalid email format';
        } else {
          delete newErrors.email;
          checkEmailAvailability(value);
        }
      }
      
      if (field === 'phone' && typeof value === 'string') {
        if (!validatePhone(value)) {
          newErrors.phone = 'Invalid phone format';
        } else {
          delete newErrors.phone;
        }
      }

      setErrors(newErrors);
    }
  };

  const toggleProductSelection = (productId: number) => { // Renamed from toggleCourseSelection
    setFormData(prev => {
      const isSelected = prev.selectedProducts.includes(productId);
      return {
        ...prev,
        selectedProducts: isSelected
          ? prev.selectedProducts.filter(id => id !== productId)
          : [...prev.selectedProducts, productId]
      };
    });
  };

  const calculateTotal = (): number => {
    return formData.selectedProducts.reduce((sum, productId) => { // Renamed from selectedCourses
      const product = registrationProducts.find(c => c.id === productId); // Renamed from courses
      return sum + (product?.price || 0);
    }, 0);
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAndContinue = () => {
    localStorage.setItem('registrationDraft', JSON.stringify(formData));
    setLastSaved(new Date());
    alert('Your progress has been saved! You can continue later.');
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const result: SubmitRegistrationResponse = await API.submitRegistration(formData);
      if (result.success) {
        setRegistrationId(result.registrationId);
        setSubmitSuccess(true);
        localStorage.removeItem('registrationDraft');
      }
    } catch (error) {
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your registration has been completed successfully.
          </p>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Registration ID:</p>
            <p className="text-2xl font-bold text-green-700">{registrationId}</p>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            We'll contact you within 24 hours to confirm your order and arrange delivery.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Register Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Irish Potatoes Registration
          </h1>
          <p className="text-gray-600">Complete your registration to start ordering</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Estimated time: {estimatedTime} minutes</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step < currentStep
                        ? 'bg-green-600 text-white'
                        : step === currentStep
                        ? 'bg-green-600 text-white ring-4 ring-green-200'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step < currentStep ? <Check className="w-5 h-5" /> : step}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 hidden sm:block">
                    {step === 1 && 'Personal'}
                    {step === 2 && 'Business'}
                    {step === 3 && 'Products'}
                    {step === 4 && 'Payment'}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                  <Tooltip text="We'll use this to send order confirmations and updates" />
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={(e) => checkEmailAvailability(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                />
                {emailChecking && (
                  <p className="text-blue-500 text-sm mt-1">Checking email availability...</p>
                )}
                {errors.email && touched.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                  <Tooltip text="Format: +234XXXXXXXXXX or 0XXXXXXXXXXX" />
                </label>
                <input
                  type="tel"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    errors.state && touched.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your state</option>
                  {nigerianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && touched.state && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.state}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    errors.address && touched.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full delivery address"
                />
                {errors.address && touched.address && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.address}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Business Background */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    errors.businessType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select business type</option>
                  <option value="individual">Individual Consumer</option>
                  <option value="restaurant">Restaurant/Hotel</option>
                  <option value="retailer">Retailer/Shop</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="farmer">Farmer/Agro-business</option>
                </select>
                {errors.businessType && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.businessType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name <span className="text-red-500">*</span>
                  <Tooltip text="If individual, enter your name" />
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    errors.businessName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter business name"
                />
                {errors.businessName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.businessName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years in Business <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.yearsInBusiness}
                  onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    errors.yearsInBusiness ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select years</option>
                  <option value="new">New Business (Less than 1 year)</option>
                  <option value="1-2">1-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </select>
                {errors.yearsInBusiness && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.yearsInBusiness}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Monthly Volume <span className="text-red-500">*</span>
                  <Tooltip text="Approximate monthly purchase volume in kg" />
                </label>
                <select
                  value={formData.monthlyVolume}
                  onChange={(e) => handleInputChange('monthlyVolume', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    errors.monthlyVolume ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select volume</option>
                  <option value="0-50">0-50 kg (Individual)</option>
                  <option value="50-200">50-200 kg (Small Business)</option>
                  <option value="200-500">200-500 kg (Medium Business)</option>
                  <option value="500+">500+ kg (Large Business)</option>
                </select>
                {errors.monthlyVolume && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.monthlyVolume}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Product Selection */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Products</h2>
              
              {errors.selectedProducts && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {errors.selectedProducts}
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {registrationProducts.map(product => ( // Renamed from courses
                  <div
                    key={product.id}
                    onClick={() => toggleProductSelection(product.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.selectedProducts.includes(product.id)
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{product.name}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          formData.selectedProducts.includes(product.id)
                            ? 'bg-green-600 border-green-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {formData.selectedProducts.includes(product.id) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-green-700">
                        ₦{product.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">{product.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {formData.selectedProducts.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">
                      Selected: {formData.selectedProducts.length} product(s)
                    </span>
                    <span className="text-xl font-bold text-green-700">
                      Total: ₦{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Payment and Review */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment & Review</h2>

              {/* Review Section */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <p className="font-semibold">Full Name:</p>
                    <p>{formData.fullName}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p>{formData.email}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Phone:</p>
                    <p>{formData.phone}</p>
                  </div>
                  <div>
                    <p className="font-semibold">State:</p>
                    <p>{formData.state}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-semibold">Delivery Address:</p>
                    <p>{formData.address}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Business Type:</p>
                    <p>{formData.businessType}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Business Name:</p>
                    <p>{formData.businessName}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Years in Business:</p>
                    <p>{formData.yearsInBusiness}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Monthly Volume:</p>
                    <p>{formData.monthlyVolume}</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4">Selected Products</h3>
                {formData.selectedProducts.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {formData.selectedProducts.map(productId => {
                      const product = registrationProducts.find(p => p.id === productId);
                      return product ? (
                        <li key={product.id}>
                          {product.name} (₦{product.price.toLocaleString()} {product.unit})
                        </li>
                      ) : null;
                    })}
                  </ul>
                ) : (
                  <p className="text-gray-600">No products selected.</p>
                )}
                <p className="text-right text-2xl font-bold text-green-700 mt-4">
                  Total: ₦{calculateTotal().toLocaleString()}
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col space-y-2">
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
                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.paymentMethod}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                    className="form-checkbox h-4 w-4 text-green-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-gray-700">
                    I agree to the <a href="#" className="text-green-600 hover:underline">terms and conditions</a> <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.agreedToTerms && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.agreedToTerms}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition flex items-center"
            >
              <ChevronLeft className="w-5 h-5 mr-2" /> Back
            </button>
          )}
          {currentStep < totalSteps && (
            <button
              onClick={handleNext}
              className={`px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center ${
                currentStep === 1 && !formData.fullName && 'ml-auto' // Push to right if on step 1 and no input
              }`}
            >
              Next <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          )}
          {currentStep === totalSteps && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" /> Submit Registration
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Save and Continue Button */}
        {currentStep < totalSteps && (
          <div className="text-center mt-6">
            <button
              onClick={handleSaveAndContinue}
              className="text-gray-600 hover:text-green-600 flex items-center justify-center mx-auto text-sm"
            >
              <Save className="w-4 h-4 mr-1" /> Save & Continue Later
            </button>
            {lastSaved && (
              <p className="text-xs text-gray-500 mt-1">Last saved: {lastSaved.toLocaleTimeString()}</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}