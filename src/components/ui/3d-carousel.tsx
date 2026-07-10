"use client"

import { memo, useEffect, useLayoutEffect, useMemo, useState } from "react"
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion"
import Image from "next/image"
import { type PortfolioItem } from "@/lib/store"

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

type UseMediaQueryOptions = {
  defaultValue?: boolean
  initializeWithValue?: boolean
}

const IS_SERVER = typeof window === "undefined"

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) {
      return defaultValue
    }
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query)
    }
    return defaultValue
  })

  const handleChange = () => {
    setMatches(getMatches(query))
  }

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query)
    handleChange()

    matchMedia.addEventListener("change", handleChange)

    return () => {
      matchMedia.removeEventListener("change", handleChange)
    }
  }, [query])

  return matches
}

const duration = 0.15
const transition = { duration, ease: [0.32, 0.72, 0, 1], filter: "blur(4px)" }
const transitionOverlay = { duration: 0.5, ease: [0.32, 0.72, 0, 1] }

const Carousel = memo(
  ({
    handleClick,
    controls,
    cards,
    isCarouselActive,
  }: {
    handleClick: (item: PortfolioItem, index: number) => void
    controls: any
    cards: PortfolioItem[]
    isCarouselActive: boolean
  }) => {
    const isScreenSizeSm = useMediaQuery("(max-width: 640px)")
    // Smaller cylinder for mobile to fit on screen
    const cylinderWidth = isScreenSizeSm ? 1100 : 1800
    const faceCount = cards.length || 1
    const faceWidth = cylinderWidth / faceCount
    const radius = cylinderWidth / (2 * Math.PI)
    const rotation = useMotionValue(0)
    const transform = useTransform(
      rotation,
      (value: number) => `rotate3d(0, 1, 0, ${value}deg)`
    )

    // Auto-scroll loop
    useEffect(() => {
      let rafId: number;
      let lastTime = 0;
      
      const animate = (time: number) => {
        if (!lastTime) lastTime = time;
        const delta = time - lastTime;
        lastTime = time;
        
        if (isCarouselActive) {
          // Adjust this value to change speed. Negative for right-to-left.
          rotation.set(rotation.get() - delta * 0.015);
        }
        rafId = requestAnimationFrame(animate);
      };
      
      rafId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafId);
    }, [isCarouselActive, rotation]);

    return (
      <div
        className="flex h-full items-center justify-center"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <motion.div
          drag={isCarouselActive ? "x" : false}
          className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
          style={{
            transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
          }}
          onDrag={(_: any, info: any) =>
            isCarouselActive &&
            rotation.set(rotation.get() + info.offset.x * 0.05)
          }
          onDragEnd={(_: any, info: any) =>
            isCarouselActive &&
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.05,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 30,
                mass: 0.1,
              },
            })
          }
          animate={controls}
        >
          {cards.map((item, i) => (
            <motion.div
              key={`key-${item.id}-${i}`}
              className="absolute flex h-[400px] sm:h-[500px] origin-center items-center justify-center p-3"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${
                  i * (360 / faceCount)
                }deg) translateZ(${radius}px)`,
              }}
              onClick={() => handleClick(item, i)}
            >
              <motion.div 
                className="relative w-full h-full rounded-[24px] overflow-hidden shadow-2xl group"
                initial={{ filter: "blur(4px)" }}
                animate={{ filter: "blur(0px)" }}
                transition={transition}
                layoutId={`card-${item.id}`}
              >
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="pointer-events-none object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-white font-bold text-xl md:text-2xl drop-shadow-md">{item.title}</h3>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  }
)

export function ThreeDPhotoCarousel({ items }: { items: PortfolioItem[] }) {
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null)
  const [isCarouselActive, setIsCarouselActive] = useState(true)
  const controls = useAnimation()

  const handleClick = (item: PortfolioItem) => {
    setActiveItem(item)
    setIsCarouselActive(false)
    controls.stop()
  }

  const handleClose = () => {
    setActiveItem(null)
    setIsCarouselActive(true)
  }

  if (!items || items.length === 0) return null;

  return (
    <motion.div layout className="relative w-full overflow-hidden py-10">
      <AnimatePresence mode="sync">
        {activeItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            layoutId={`card-${activeItem.id}`}
            layout="position"
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 md:p-20"
            style={{ willChange: "opacity" }}
            transition={transitionOverlay}
          >
            <motion.div
              className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl cursor-zoom-out bg-black"
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              transition={{
                delay: 0.1,
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                willChange: "transform",
              }}
            >
              <Image 
                src={activeItem.image_url} 
                alt={activeItem.title} 
                fill 
                className="object-contain" 
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                <h2 className="text-3xl font-bold text-white mb-2">{activeItem.title}</h2>
                <p className="text-white/80">Click anywhere to close</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative h-[450px] sm:h-[550px] w-full max-w-[100vw] overflow-hidden">
        <Carousel
          handleClick={handleClick}
          controls={controls}
          cards={items}
          isCarouselActive={isCarouselActive}
        />
      </div>
    </motion.div>
  )
}
