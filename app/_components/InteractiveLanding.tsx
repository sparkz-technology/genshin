// "use client"

// import { useEffect, useRef } from "react"

// export default function InteractiveLanding() {
//   const contentContainerRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       if (!contentContainerRef.current) return

//       const mouseX = e.clientX / window.innerWidth
//       const mouseY = e.clientY / window.innerHeight
//       const moveX = (0.5 - mouseX) * 15
//       const moveY = (0.5 - mouseY) * 20

//       contentContainerRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`
//     }

//     const handleMouseLeave = () => {
//       if (!contentContainerRef.current) return
//       contentContainerRef.current.style.transform = "translate(0, 0)"
//     }

//     document.addEventListener("mousemove", handleMouseMove)
//     document.addEventListener("mouseleave", handleMouseLeave)

//     return () => {
//       document.removeEventListener("mousemove", handleMouseMove)
//       document.removeEventListener("mouseleave", handleMouseLeave)
//     }
//   }, [])

//   return (
//     <div className="m-0 p-0 overflow-hidden h-screen w-screen absolute top-0 left-0 flex items-center justify-center z-[-10]">
//       {/* Background */}
//       <div
//         className="fixed w-full h-screen bg-cover bg-no-repeat bg-fixed transition-filter duration-300 ease-in-out brightness-50"
//         style={{ backgroundImage: "url('/bg.jpg?height=1080&width=1920')" }}
//       />

//       {/* Content Container */}
//       <div
//         ref={contentContainerRef}
//         className="absolute top-0 left-0 w-full h-screen flex flex-row items-center justify-center z-10 transition-transform duration-200 ease-out md:flex-row flex-col"
//       >
//         {/* Image Section */}
//         <div className="flex-1 h-full flex items-center justify-center">
//           <div
//             className="w-full h-full bg-contain bg-no-repeat bg-center pointer-events-none"
//             style={{ backgroundImage: "url('/transparent-bg.png?height=800&width=600')" }}
//           />
//         </div>

//         {/* Title Section */}
//         <div className="flex-1 p-8 text-white flex flex-col items-start justify-center md:pl-[10%] md:items-start items-center">
//           <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-shadow md:text-left text-center">
//             Genshin Impact
//             <br />
//             Reward Dashboard &amp; Redeemer
//           </h1>
//           <p className="text-xl mb-8 opacity-90 md:text-left text-center">
//             Redeem codes, check-in daily, and track your rewards with ease.
//           </p>
        
//         </div>
//       </div>
//     </div>
//   )
// }

// "use client";

// import { useEffect, useRef } from "react";

// export default function InteractiveLanding() {
//   const contentContainerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       if (!contentContainerRef.current) return;

//       const mouseX = e.clientX / window.innerWidth;
//       const mouseY = e.clientY / window.innerHeight;
//       const moveX = (0.5 - mouseX) * 15;
//       const moveY = (0.5 - mouseY) * 20;

//       contentContainerRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
//     };

//     const handleMouseLeave = () => {
//       if (!contentContainerRef.current) return;
//       contentContainerRef.current.style.transform = "translate(0, 0)";
//     };

//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseleave", handleMouseLeave);

//     return () => {
//       document.removeEventListener("mousemove", handleMouseMove);
//       document.removeEventListener("mouseleave", handleMouseLeave);
//     };
//   }, []);

//   return (
//     <div className="m-0 p-0 overflow-hidden h-screen w-screen absolute top-0 left-0 flex items-center justify-center z-[-10]">
//       {/* Background */}
//       <div
//         className="fixed w-full h-screen bg-cover bg-no-repeat bg-fixed transition-filter duration-300 ease-in-out brightness-50"
//         style={{ backgroundImage: "url('/bg.jpg?height=1080&width=1920')" }}
//       />

//       {/* Content Container */}
//       <div
//         ref={contentContainerRef}
//         className="absolute top-0 left-0 w-full h-screen flex items-center justify-center z-10 transition-transform duration-200 ease-out md:flex-row flex-col"
//       >
//         {/* Image Section */}
//         <div className="flex-1 h-full flex items-center justify-center">
//           <div
//             className="md:w-full md:h-full w-screen h-screen bg-contain bg-no-repeat bg-center pointer-events-none"
//             style={{ backgroundImage: "url('/transparent-bg.png?height=800&width=600')" }}
//           />
//         </div>

//         {/* Title Section (Hidden on Mobile) */}
//         <div className="hidden md:flex flex-1 p-8 text-white flex-col items-start justify-center md:pl-[10%]">
//           <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-shadow md:text-left text-center">
//             Genshin Impact
//             <br />
//             Reward Dashboard &amp; Redeemer
//           </h1>
//           <p className="text-xl mb-8 opacity-90 md:text-left text-center">
//             Redeem codes, check-in daily, and track your rewards with ease.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

export default function InteractiveLanding() {
  const contentContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!contentContainerRef.current) return

      const mouseX = e.clientX / window.innerWidth
      const mouseY = e.clientY / window.innerHeight
      const moveX = (0.5 - mouseX) * 15
      const moveY = (0.5 - mouseY) * 20

      contentContainerRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`
    }

    const handleMouseLeave = () => {
      if (!contentContainerRef.current) return
      contentContainerRef.current.style.transform = "translate(0, 0)"
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div className="m-0 p-0 overflow-hidden h-screen w-screen absolute top-0 left-0 flex items-center justify-center z-[-10]">
      <div className="fixed w-full h-screen overflow-hidden">
        <Image
          src="/bg.jpg"
          alt="Background"
          fill
          priority
          quality={85}
          className="object-cover brightness-50"
          sizes="100vw"
        />
      </div>

      <div
        ref={contentContainerRef}
        className="absolute top-0 left-0 w-full h-screen flex items-center justify-center z-10 transition-transform duration-200 ease-out md:flex-row flex-col"
      >
        <div className="flex-1 h-full flex items-center justify-center relative">
          <div className="md:w-full md:h-full w-screen h-screen relative pointer-events-none">
            <Image
              src="/transparent-bg.png"
              alt="Character"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="hidden md:flex flex-1 p-8 text-white flex-col items-start justify-center md:pl-[10%]">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-shadow md:text-left text-center">
            Genshin Impact
            <br />
            Reward Dashboard &amp; Redeemer
          </h1>
          <p className="text-xl mb-8 opacity-90 md:text-left text-center">
            Redeem codes, check-in daily, and track your rewards with ease.
          </p>
        </div>
      </div>
    </div>
  )
}


