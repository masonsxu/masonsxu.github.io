import { siGithub as githubIcon } from 'simple-icons'

export function GitHubIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={githubIcon.path} />
    </svg>
  )
}
