import React, { useState, useEffect, useRef } from 'react';
import './Carousel.css';

interface CarouselProps {
    images: Array<string>;
    switchingSpeed?: number;
    videoAutoplay?: boolean;
    [x:string]: any;
}

const Carousel: React.FC<CarouselProps> = ({ images, switchingSpeed = 5000, videoAutoplay = false, ...rest}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!images || images.length === 0 || paused) return;

        const timer = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, switchingSpeed);

        return () => {
            clearTimeout(timer);
        };
    }, [currentIndex, images, switchingSpeed, paused]);

    const handleMouseEnter = () => {
        setPaused(true);
    };

    const handleMouseLeave = () => {
        setPaused(false);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const togglePause = () => {
        setPaused(!paused);
    };

    if (!images || images?.length === 0) {
        return (
            <div className="carousel-container empty-carousel">
                <span className="sad-face">No Image Yet</span>
            </div>
        );
    }

    return (
        <div className="carousel-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={carouselRef} {...rest}>
            {images.map((src, index) => {
                const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
                return isVideo ? (
                    <video
                        key={index}
                        src={src}
                        className={`carousel-slide${currentIndex === index ? ' active' : ''}`}
                        autoPlay={videoAutoplay}
                        muted
                        loop
                    />
                ) : (
                    <img key={index} src={src} alt={`Slide ${index + 1}`} className={`carousel-slide${currentIndex === index ? ' active' : ''}`} />
                );
            })}
            {images.length > 1 && ( <div className="carousel-controls">
                <button className="carousel-control prev" onClick={() => goToSlide((currentIndex - 1 + images.length) % images.length)}>
                    &#10094;
                </button>
                <button className="carousel-control play-pause" onClick={togglePause}>
                    {paused ? '▶' : '⏸'}
                </button>
                <button className="carousel-control next" onClick={() => goToSlide((currentIndex + 1) % images.length)}>
                    &#10095;
                </button>
            </div>)}
            <div className="carousel-progress">
                <div className="carousel-progress-bar" style={{ width: `${((currentIndex + 1) * 100) / images.length}%` }} />
            </div>
        </div>
    );
};

export default Carousel;
