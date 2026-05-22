import { Link } from 'react-router-dom'
import interviewMateLogo from '../assets/interviewmate-main-logo.png'

type BrandLogoProps = {
  to?: string
  className?: string
  imageClassName?: string
  alt?: string
}

function BrandLogo({
  to,
  className,
  imageClassName = 'h-10 w-auto',
  alt = 'InterviewMate',
}: BrandLogoProps) {
  const image = <img src={interviewMateLogo} alt={alt} className={imageClassName} />

  if (to) {
    return (
      <Link to={to} className={className}>
        {image}
      </Link>
    )
  }

  return <div className={className}>{image}</div>
}

export default BrandLogo