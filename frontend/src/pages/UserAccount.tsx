import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI, authAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { AlertCircle, User as UserIcon, Camera, Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const UserAccount: React.FC = () => {
  const { user, loading, login } = useAuth(); // Get login to update user in context
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    // Set initial preview if user already has an avatar
    if (user?.avatar && !previewUrl && !selectedFile) {
      setPreviewUrl(user.avatar);
    }
  }, [user, previewUrl, selectedFile]);

  useEffect(() => {
    // Clean up camera stream when component unmounts or camera is deactivated
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
        handleCameraToggle(); // Turn off camera if a file is selected
      }
    } else {
      setSelectedFile(null);
      setPreviewUrl(user?.avatar || null);
    }
  };

  const handleCameraToggle = async () => {
    if (isCameraActive) {
      // Stop camera
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
    } else {
      // Start camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
        setSelectedFile(null); // Clear selected file when camera is active
        setPreviewUrl(null); // Clear file preview
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
            handleCameraToggle(); // Turn off camera after capturing
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

      const response = await authAPI.uploadAvatar(formData); // This is a new API function

      // Update user in context with new avatar URL
      if (response.data.avatarUrl) {
        const updatedUser = { ...user, avatar: response.data.avatarUrl };
        login(localStorage.getItem('token') || '', updatedUser); // Re-login to update context and local storage
      }
      setSelectedFile(null); // Clear selected file after successful upload
      toast.success('Avatar uploaded successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to upload avatar.';
      toast.error(errorMessage);
      setPreviewUrl(user?.avatar || null); // Revert preview on error
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-lg">Loading user data...</div>;
  }

  if (!user) {
    return <div className="text-center py-8 text-lg text-red-600">Please log in to view your account.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar Upload Section */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          {isCameraActive ? (
            <video ref={videoRef} className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-green-500" autoPlay playsInline></video>
          ) : previewUrl ? (
            <img src={previewUrl} alt="User Avatar Preview" className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-green-500" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 border-2 border-green-500">
              <UserIcon className="w-16 h-16 text-gray-500" />
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-700 mb-4">{user.name}</h2>
          
          <div className="w-full space-y-3">
            <input
              type="file"
              id="avatarFile"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="avatarFile" className="w-full cursor-pointer bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center">
              <Upload className="w-5 h-5 mr-2" /> Choose File
            </label>

            <button
              onClick={handleCameraToggle}
              className={`w-full py-2 rounded-lg transition flex items-center justify-center ${
                isCameraActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              <Camera className="w-5 h-5 mr-2" /> {isCameraActive ? 'Stop Camera' : 'Enable Camera'}
            </button>

            {isCameraActive && (
              <button
                onClick={capturePhoto}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center"
              >
                <Camera className="w-5 h-5 mr-2" /> Capture Photo
              </button>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas> {/* Hidden canvas for photo capture */}


            <button
              onClick={handleUploadAvatar}
              disabled={isUploadingAvatar || !selectedFile}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
            </button>

            {user.avatar && (
                <button
                    onClick={() => { /* Implement remove avatar logic */ toast('Remove avatar not implemented yet.'); }}
                    className="w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    <Trash2 className="w-5 h-5 mr-2" /> Remove Avatar
                </button>
            )}

          </div>
        </div>

        {/* User Profile Section */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Profile Information</h2>
          <div className="space-y-3">
            <p className="text-gray-600"><strong>Name:</strong> {user.name}</p>
            <p className="text-gray-600"><strong>Email:</strong> {user.email}</p>
            <p className="text-gray-600"><strong>Phone:</strong> {user.phone}</p>
            {user.address && (
              <p className="text-gray-600">
                <strong>Address:</strong> {user.address.street}, {user.address.state}
                {user.address.city && `, ${user.address.city}`}
                {user.address.zipCode && `, ${user.address.zipCode}`}
              </p>
            )}
            <p className="text-gray-600"><strong>Role:</strong> {user.role}</p>
          </div>
        </div>

        {/* Order History Section */}
        <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Order History</h2>
          {isLoadingOrders ? (
            <div className="text-center py-4">Loading orders...</div>
          ) : ordersError ? (
            <div className="text-center py-4 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 mr-2" /> Error loading orders.
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold">Order ID: {order._id.substring(0, 8)}...</p>
                    <p className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {order.status}
                    </p>
                  </div>
                  <p className="text-gray-600">Total: ₦{order.totalAmount.toLocaleString()}</p>
                  <p className="text-gray-600 text-sm">Ordered on: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <Link to={`/order-tracking/${order._id}`} className="text-blue-600 hover:underline text-sm mt-2 block">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-600">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
