import React, { useState } from 'react';

interface GalleryImage {
  id: number;
  title: string;
  src: string;
}

const images: GalleryImage[] = [
  { id: 1, title: 'Fresh Plateau Potatoes', src: '/nicolas-potatoes.jpeg' },
  { id: 2, title: 'Jos Plateau Farm', src: '/connect-potato.jpeg' },
  { id: 3, title: 'Quality Sorting', src: '/marabel.jpeg' },
  { id: 4, title: 'Bulk Packaging', src: '/marabel-potatotoes.jpeg' },
  { id: 5, title: 'Farm Harvest', src: '/bg-pic.jpeg' },
  { id: 6, title: 'Premium Selection', src: '/marabel.jpeg' }
];

function Gallery() {
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  return (
    <section id="gallery" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-10 text-primary-800">Our Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map(img => (
            <div
              key={img.id}
              className="relative h-64 rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105 group"
              onClick={() => setSelected(img)}
            >
              <img src={img.src} alt={img.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xl font-semibold">{img.title}</p>
              </div>
            </div>
          ))}
        </div>
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-lg shadow-xl p-6 relative max-w-lg w-full">
              <button className="absolute top-3 right-3 text-black text-3xl font-bold" onClick={() => setSelected(null)}>&times;</button>
              <img src={selected.src} alt={selected.title} className="w-full h-auto max-h-[80vh] object-contain" />
              <h3 className="text-black text-2xl font-bold text-center mt-4">{selected.title}</h3>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Gallery;
