import { useEffect, useRef } from 'react'

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const playVideo = () => {
      video.play().catch(e => {
        console.warn('Video play failed:', e)
        // 尝试再次播放
        setTimeout(playVideo, 1000)
      })
    }

    // 仅在用户交互后播放，或者如果允许自动播放
    const handleUserInteraction = () => {
      playVideo()
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)

    // 如果视频元素可见则尝试播放
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playVideo()
        }
      })
    }, { threshold: 0.1 })

    observer.observe(video)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[-1] flex items-center justify-center"
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="min-h-[100vh] min-w-[100vw] object-cover"
        loop
        muted
        playsInline
        autoPlay
        onError={(e) => {
          console.error('Video background error:', e)
        }}
      >
        <source src="/ambient-architecture.webm" type="video/webm" />
        您的浏览器不支持 HTML5 video 标签。
      </video>
    </div>
  )
}