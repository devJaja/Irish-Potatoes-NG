import React, { useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

interface GalleryImage {
  id: number;
  title: string;
  description: string;
  category: string;
  color: string;
  gradient: string;
}

const images: GalleryImage[] = [
  { 
    id: 1, 
    title: 'Fresh Irish Potatoes', 
    description: 'Premium quality potatoes harvested daily from Jos Plateau',
    category: 'Products',
    color: '#8B4513',
    gradient: 'from-amber-900 to-amber-700'
  },
  { 
    id: 2, 
    title: 'Jos Plateau Farm', 
    description: 'Our sustainable farming practices on the fertile Jos Plateau',
    category: 'Farm',
    color: '#2d5016',
    gradient: 'from-green-900 to-green-700'
  },
  { 
    id: 3, 
    title: 'Quality Sorting', 
    description: 'Careful selection ensuring only the best potatoes reach you',
    category: 'Process',
    color: '#a8d08d',
    gradient: 'from-green-400 to-green-600'
  },
  { 
    id: 4, 
    title: 'Bulk Packaging', 
    description: 'Professional packaging for wholesale and retail distribution',
    category: 'Packaging',
    color: '#6B8E23',
    gradient: 'from-lime-700 to-lime-900'
  },
  { 
    id: 5, 
    title: 'Farm Harvest', 
    description: 'Peak harvest season bringing the freshest produce',
    category: 'Farm',
    color: '#556B2F',
    gradient: 'from-green-800 to-green-600'
  },
  { 
    id: 6, 
    title: 'Premium Selection', 
    description: 'Hand-picked potatoes meeting strict quality standards',
    category: 'Products',
    color: '#8FBC8F',
    gradient: 'from-green-300 to-green-500'
  },
  { 
    id: 7, 
    title: 'Storage Facility', 
    description: 'Climate-controlled storage maintaining optimal freshness',
    category: 'Facility',
    color: '#4a5f3a',
    gradient: 'from-slate-700 to-green-800'
  },
  { 
    id: 8, 
    title: 'Distribution Ready', 
    description: 'Ready for delivery across Nigeria',
    category: 'Packaging',
    color: '#7d8f69',
    gradient: 'from-green-600 to-green-400'
  },
  { 
    id: 9, 
    title: 'Organic Farming', 
    description: 'Chemical-free cultivation for healthier produce',
    category: 'Farm',
    color: '#3d5a2c',
    gradient: 'from-green-900 to-lime-700'
  }
];

const categories = ['All', 'Products', 'Farm', 'Process', 'Packaging', 'Facility'];

const GalleryPage: React.FC = () => {
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const filteredImages = filter === 'All' 
    ? images 
    : images.filter(img => img.category === filter);

  const handleNext = () => {
    if (!selected) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selected.id);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelected(filteredImages[nextIndex]);
  };

  const handlePrev = () => {
    if (!selected) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selected.id);
    const prevIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1;
    setSelected(filteredImages[prevIndex]);
  };

  return (
    <section id="gallery" className="py-20 bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <Camera className="w-8 h-8 text-green-700" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-800 via-green-600 to-green-800 bg-clip-text text-transparent animate-gradient">
            Photo Gallery
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-600 text-xl leading-relaxed">
              Explore our journey from farm to table. Quality potatoes grown with care on the Jos Plateau.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>{filteredImages.length} {filteredImages.length === 1 ? 'Photo' : 'Photos'} Available</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 transform ${
                filter === cat
                  ? 'bg-gradient-to-r from-green-700 to-green-600 text-white shadow-xl scale-110 ring-4 ring-green-200'
                  : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-700 hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredImages.map(img => (
            <div
              key={img.id}
              className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl"
              onClick={() => setSelected(img)}
              onMouseEnter={() => setHoveredId(img.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Main Card */}
              <div className={`absolute inset-0 bg-gradient-to-br ${img.gradient} transition-transform duration-700 group-hover:scale-110`}>
                {/* Animated Pattern Overlay */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 group-hover:animate-pulse"></div>
                </div>
              </div>

              {/* Shine Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 group-hover:via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Category Badge */}
              <div className="absolute top-5 left-5 z-20">
                <span className="bg-white/95 backdrop-blur-md text-gray-800 px-4 py-2 rounded-full text-xs font-bold shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white">
                  {img.category}
                </span>
              </div>

              {/* Zoom Icon with Animation */}
              <div className={`absolute top-5 right-5 z-20 bg-white/95 backdrop-blur-md p-3 rounded-full shadow-lg transition-all duration-500 ${
                hoveredId === img.id 
                  ? 'opacity-100 scale-100 rotate-0' 
                  : 'opacity-0 scale-50 rotate-180'
              }`}>
                <ZoomIn className="w-6 h-6 text-green-700" />
              </div>

              {/* Content Overlay with Slide-Up Animation */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent translate-y-8 group-hover:translate-y-0 transition-all duration-500 flex flex-col justify-end p-8">
                {/* Title with Slide Animation */}
                <h3 className="text-white text-3xl font-bold mb-3 transform translate-y-12 group-hover:translate-y-0 transition-all duration-500 delay-100">
                  {img.title}
                </h3>
                
                {/* Description with Fade and Slide */}
                <p className="text-white/90 text-base leading-relaxed transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                  {img.description}
                </p>

                {/* View Details Button */}
                <div className="mt-4 transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-300">
                  <span className="inline-flex items-center gap-2 text-green-400 font-semibold text-sm group/btn hover:gap-3 transition-all">
                    View Details
                    <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Decorative Corner Elements */}
              <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-white/20 rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-white/20 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl shadow-xl">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="bg-gray-100 p-6 rounded-full">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <p className="text-gray-500 text-2xl font-semibold">No images found in this category</p>
            <p className="text-gray-400 mt-2">Try selecting a different filter</p>
          </div>
        )}

        {/* Lightbox Modal */}
        {selected && (
          <div 
            className="fixed inset-0 bg-black/97 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fadeIn"
            onClick={() => setSelected(null)}
          >
            {/* Close Button */}
            <button 
              className="absolute top-8 right-8 text-white/80 hover:text-white transition-all z-50 bg-white/10 hover:bg-white/20 rounded-full p-3 transform hover:scale-110 hover:rotate-90 duration-300 shadow-xl"
              onClick={(e) => {
                e.stopPropagation();
                setSelected(null);
              }}
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation Buttons */}
            {filteredImages.length > 1 && (
              <>
                <button
                  className="absolute left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-all bg-white/10 hover:bg-white/20 rounded-full p-4 z-50 transform hover:scale-110 hover:-translate-x-1 duration-300 shadow-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-all bg-white/10 hover:bg-white/20 rounded-full p-4 z-50 transform hover:scale-110 hover:translate-x-1 duration-300 shadow-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Modal Content */}
            <div 
              className="relative max-w-5xl w-full animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Card */}
              <div 
                className={`relative h-96 md:h-[600px] rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br ${selected.gradient} transform transition-all duration-500`}
              >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 animate-pulse"></div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center max-w-3xl animate-slideUp">
                    <div className="bg-white/98 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 transform hover:scale-105 transition-transform duration-500">
                      <span className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
                        {selected.category}
                      </span>
                      <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 leading-tight">
                        {selected.title}
                      </h2>
                      <p className="text-gray-600 text-lg md:text-2xl leading-relaxed">
                        {selected.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Counter */}
              <div className="text-center mt-6">
                <span className="inline-block bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                  {filteredImages.findIndex(img => img.id === selected.id) + 1} / {filteredImages.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.5s ease-out; }
      `}</style>
    </section>
  );
};

export default GalleryPage;