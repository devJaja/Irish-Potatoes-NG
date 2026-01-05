import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI, authAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { AlertCircle, User, Camera, Upload, Trash2, Package, Clock, CheckCircle, Mail, Phone, MapPin, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const UserAccount: React.FC = () => {
  const { user, loading, login } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user?.avatar && !previewUrl && !selectedFile) {
      setPreviewUrl(user.avatar);
    }
  }, [user, previewUrl, selectedFile]);

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const { data: orders, isLoading: isLoadingOrders, error: ordersError } = useQuery({
    queryKey: ['userOrders', user?._id],
    queryFn: ordersAPI.getUsersOrders,
    enabled: !!user,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (isCameraActive) {
        handleCameraToggle();
      }
    } else {
      setSelectedFile(null);
      setPreviewUrl(user?.avatar || null);
    }
  };

  const handleCameraToggle = async () => {
    if (isCameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
        setSelectedFile(null);
        setPreviewUrl(null);
      } catch (err) {
        toast.error('Could not access camera. Please check permissions.');
        console.error('Error accessing camera:', err);
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            const capturedFile = new File([blob], "avatar.png", { type: "image/png" });
            setSelectedFile(capturedFile);
            setPreviewUrl(URL.createObjectURL(capturedFile));
            handleCameraToggle();
          }
        }, 'image/png');
      }
    }
  };

  const handleUploadAvatar = async () => {
    if (!user?._id) {
      toast.error('User not authenticated.');
      return;
    }
    if (!selectedFile) {
      toast.error('Please select a file or capture a photo first.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      const response = await authAPI.uploadAvatar(formData);

      if (response.data.avatarUrl) {
        const updatedUser = { ...user, avatar: response.data.avatarUrl };
        login(localStorage.getItem('token') || '', updatedUser);
      }
      setSelectedFile(null);
      toast.success('Avatar uploaded successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to upload avatar.';
      toast.error(errorMessage);
      setPreviewUrl(user?.avatar || null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?._id) {
      toast.error('User not authenticated.');
      return;
    }

    try {
      const response = await authAPI.removeAvatar();
      const updatedUser = { ...user, avatar: undefined };
      login(localStorage.getItem('token') || '', updatedUser);
      setPreviewUrl(null);
      setSelectedFile(null);
      toast.success(response.data.message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove avatar.';
      toast.error(errorMessage);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'shipped':
      case 'processing':
        return <Package className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-800 mb-4">Please log in to view your account</p>
          <Link to="/login" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile and view your orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Avatar Section */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white text-center relative">
                <div className="relative inline-block">
                  {isCameraActive ? (
                    <video 
                      ref={videoRef} 
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl" 
                      autoPlay 
                      playsInline
                    />
                  ) : previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="User Avatar" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl" 
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white shadow-xl">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  {selectedFile && !isCameraActive && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
                <p className="text-blue-100 text-sm capitalize mt-1">{user.role}</p>
              </div>

              {/* Avatar Controls */}
              <div className="p-6 space-y-3">
                <input
                  type="file"
                  id="avatarFile"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label 
                  htmlFor="avatarFile" 
                  className="w-full cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center font-medium shadow-md hover:shadow-lg"
                >
                  <Upload className="w-5 h-5 mr-2" /> Choose Photo
                </label>

                <button
                  onClick={handleCameraToggle}
                  className={`w-full py-3 rounded-xl transition flex items-center justify-center font-medium shadow-md hover:shadow-lg ${
                    isCameraActive 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                  }`}
                >
                  <Camera className="w-5 h-5 mr-2" /> {isCameraActive ? 'Stop Camera' : 'Use Camera'}
                </button>

                {isCameraActive && (
                  <button
                    onClick={capturePhoto}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition flex items-center justify-center font-medium shadow-md hover:shadow-lg"
                  >
                    <Camera className="w-5 h-5 mr-2" /> Capture Photo
                  </button>
                )}

                <button
                  onClick={handleUploadAvatar}
                  disabled={isUploadingAvatar || !selectedFile}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  {isUploadingAvatar ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" /> Upload Avatar
                    </>
                  )}
                </button>

                {user.avatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center font-medium"
                  >
                    <Trash2 className="w-5 h-5 mr-2" /> Remove Avatar
                  </button>
                )}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <User className="w-6 h-6 mr-2 text-blue-600" />
                  Profile Information
                </h2>
                <button className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium">
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                    <p className="text-gray-800 font-medium">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-gray-800 font-medium break-all">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                    <p className="text-gray-800 font-medium">{user.phone}</p>
                  </div>
                </div>

                {user.address && (
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
                      <p className="text-gray-800 font-medium">
                        {user.address.street}, {user.address.state}
                        {user.address.city && `, ${user.address.city}`}
                        {user.address.zipCode && `, ${user.address.zipCode}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Package className="w-6 h-6 mr-2 text-blue-600" />
                Order History
              </h2>

              {isLoadingOrders ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your orders...</p>
                </div>
              ) : ordersError ? (
                <div className="text-center py-12 bg-red-50 rounded-xl">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 font-medium">Error loading orders</p>
                  <p className="text-gray-600 text-sm mt-2">Please try again later</p>
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div 
                      key={order._id} 
                      className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition bg-gradient-to-r from-white to-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            order.status === 'delivered' ? 'bg-green-100' :
                            order.status === 'shipped' ? 'bg-indigo-100' :
                            order.status === 'processing' ? 'bg-blue-100' :
                            'bg-yellow-100'
                          }`}>
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">Order #{order._id.substring(0, 8).toUpperCase()}</p>
                            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</p>
                          </div>
                        </div>
                        
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <p className="text-lg font-bold text-gray-800">₦{order.totalAmount.toLocaleString()}</p>
                        <Link 
                          to={`/order-tracking/${order._id}`} 
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center hover:underline"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">No orders yet</p>
                  <p className="text-gray-500 text-sm mb-4">Start shopping to see your orders here</p>
                  <Link 
                    to="/shop" 
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Browse Products
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
