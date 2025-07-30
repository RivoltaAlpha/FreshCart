import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroSection = ({ navigate }: { navigate: any }) => {
    const carouselImages = [
        'https://www.vmcdn.ca/f/files/moosejawtoday/images/business/shopping/gettyimages-1217134622.jpg',
        '/hero.png',
        'https://images.squarespace-cdn.com/content/v1/5e840cdefef4234737e568f0/1585745898091-ZGMAEQSVKL0B2WHNBF80/fresh.jpg',
        'https://static.vecteezy.com/system/resources/previews/011/591/493/large_2x/supermarket-vegetables-view-free-photo.jpg',
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDirection(1);
            setCurrentImageIndex((prevIndex) =>
                (prevIndex + 1) % carouselImages.length
            );
        }, 8000);

        return () => clearInterval(interval);
    }, [carouselImages.length]);

    const goToSlide = (index: number) => {
        const newDirection = index > currentImageIndex ? 1 : -1;
        setDirection(newDirection);
        setCurrentImageIndex(index);
    };

    const goToPrevious = () => {
        setDirection(-1);
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setDirection(1);
        setCurrentImageIndex((prevIndex) =>
            (prevIndex + 1) % carouselImages.length
        );
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '20%' : '-20%',
            opacity: 0,
            zIndex: 1
        }),
        center: {
            x: 0,
            opacity: 1,
            zIndex: 2
        },
        exit: (direction: number) => ({
            x: direction > 0 ? '-20%' : '20%',
            opacity: 0,
            zIndex: 1
        })
    };

    return (
        <section
            className="relative max-h-screen text-white py-20 lg:py-32 overflow-hidden"
            id="hero-section"
            aria-label="Hero Section"
        >
            {/* Image Carousel Container */}
            <div className="absolute inset-0">
                <AnimatePresence mode="popLayout" custom={direction}>
                    <motion.div
                        key={currentImageIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            duration: 0.7,
                            ease: "easeInOut",
                            opacity: { duration: 0.5 },
                            x: { duration: 0.7 }
                        }}
                        className="absolute inset-0 bg-no-repeat bg-cover bg-center"
                        style={{
                            backgroundImage: `url('${carouselImages[currentImageIndex]}')`
                        }}
                    />
                </AnimatePresence>
            </div>

            {/* Dark overlay - stays constant */}
            <div className="absolute inset-0 bg-black/60 z-[3]"></div>

            {/* Carousel Navigation Arrows */}
            <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Previous image"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Next image"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Carousel Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
                {carouselImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImageIndex
                                ? 'bg-[#75E6DA] scale-125'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.8,
                    rotate: { duration: 0.8, ease: "easeOut" }
                }}
                className="relative z-10"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
                        <div className='text-white space-y-6'>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                                Fresh
                                <span className="block text-[#75E6DA]">Groceries,</span>
                                <span className="block">Delivered Fast</span>
                            </h1>
                            <p className="text-xl lg:text-2xl text-gray-100 max-w-xl">
                                Get farm-fresh produce, quality groceries, and daily essentials delivered to your doorstep in under 30 minutes.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={() => navigate({ to: '/products' })}
                                    className="bg-[#189AB4] hover:bg-[#75E6DA] hover:text-white px-10 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-xl"
                                >
                                    Shop Now
                                </button>
                                <button className="border-2 p-4 border-[#75E6DA] text-[#75E6DA] hover:bg-[#75E6DA] hover:px-10 py-4 rounded-full text-lg font-semibold transition-all">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default HeroSection;