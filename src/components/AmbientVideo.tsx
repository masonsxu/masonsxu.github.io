import { useEffect, useRef } from 'react'

export default function AmbientVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error)
    }
  }, [])

  return (
    <div className="w-full h-full bg-[#0a0a0a]">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
      >
        <source src="/ambient-architecture.webm" type="video/webm" />
        您的浏览器不支持 HTML5 video 标签。
      </video>
    </div>
  )
}