interface ArrowIconProps {
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
}

export function ArrowIcon({
  direction = 'down',
  className,
  width,
  height,
  style,
}: ArrowIconProps) {
  if (direction === 'left') {
    return (
      <svg
        viewBox="0 0 728 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        style={{
          width: width ?? 8,
          height: height ?? 12,
          display: 'block',
          ...style,
        }}
      >
        <path d="M0.926 540L728 0V1080L0.926 540Z" fill="currentColor" />
        <path
          d="M0.926 540L728 0V1080L0.926 540Z"
          strokeWidth="58.3784"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="currentColor"
        />
      </svg>
    );
  }

  if (direction === 'right') {
    return (
      <svg
        viewBox="0 0 728 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        style={{
          width: width ?? 8,
          height: height ?? 12,
          display: 'block',
          ...style,
        }}
      >
        <path d="M727.074 540L0 1080V0L727.074 540Z" fill="currentColor" />
        <path
          d="M727.074 540L0 1080V0L727.074 540Z"
          strokeWidth="58.3784"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="currentColor"
        />
      </svg>
    );
  }

  if (direction === 'up') {
    return (
      <svg
        viewBox="0 0 1080 728"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        style={{
          width: width ?? 12,
          height: height ?? 8,
          display: 'block',
          ...style,
        }}
      >
        <path d="M540 0.926L0 728H1080L540 0.926Z" fill="currentColor" />
        <path
          d="M540 0.926L0 728H1080L540 0.926Z"
          strokeWidth="58.3784"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 1080 728"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{
        width: width ?? 12,
        height: height ?? 8,
        display: 'block',
        ...style,
      }}
    >
      <path d="M540 727.074L1080 0H0L540 727.074Z" fill="currentColor" />
      <path
        d="M540 727.074L1080 0H0L540 727.074Z"
        strokeWidth="58.3784"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}

