"use client"

export function Logo() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="focus:outline-none"
    >
      <svg
        width="80"
        height="48"
        viewBox="0 0 50 30"
        className="hover:scale-105 transition-transform duration-300"
      >
        {/* Background shape */}
        <rect
          x="1"
          y="1"
          width="48"
          height="28"
          rx="6"
          fill="transparent"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />

        {/* J letter */}
        <path
          d="M12 7v10c0 2-1 3-3 3s-3-1-3-3"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* V letter */}
        <path
          d="M18 7l4 13 4-13"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Underscore and DEV */}
        <path d="M30 17h12" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
        <text x="30" y="13" fontFamily="monospace" fontSize="7" fontWeight="bold" fill="#e2e8f0">
          DEV
        </text>

        {/* Tech circuit lines */}
        <path d="M3 15h2 M45 15h2" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.6" />
        <circle cx="5" cy="15" r="1" fill="#3b82f6" />
        <circle cx="45" cy="15" r="1" fill="#3b82f6" />
      </svg>
    </button>
  )
}
