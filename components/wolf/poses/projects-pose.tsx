import { motion } from "framer-motion"

export const ProjectsPose = () => {
  return (
    <g>
      {/* Robot Wolf Body */}
      <g>
        {/* Main body */}
        <rect x="40" y="50" width="30" height="25" rx="5" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

        {/* Chest core - project display */}
        <circle cx="55" cy="60" r="6" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
        <motion.g
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 8, ease: "linear" }}
          transformOrigin="55 60"
        >
          <rect x="52" y="57" width="6" height="6" rx="1" fill="#F39C12" />
          <rect x="53" y="58" width="4" height="4" rx="1" fill="#F5B041" />
        </motion.g>

        {/* Head */}
        <rect x="42" y="25" width="26" height="22" rx="8" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

        {/* Ears */}
        <polygon points="42,30 35,15 45,25" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <polygon points="68,30 75,15 65,25" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <polygon points="42,28 38,20 45,25" fill="#F39C12" />
        <polygon points="68,28 72,20 65,25" fill="#F39C12" />

        {/* Eyes - creative thinking */}
        <circle cx="48" cy="35" r="5" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
        <circle cx="62" cy="35" r="5" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
        <motion.path
          d="M46,35 L50,35"
          stroke="white"
          strokeWidth="2"
          animate={{ rotate: [0, 180, 360] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
          transformOrigin="48 35"
        />
        <motion.path
          d="M60,35 L64,35"
          stroke="white"
          strokeWidth="2"
          animate={{ rotate: [0, 180, 360] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
          transformOrigin="62 35"
        />

        {/* Snout */}
        <rect x="48" y="40" width="14" height="10" rx="5" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <path d="M51,46 C54,48 58,48 59,46" stroke="#1A3E4C" fill="none" strokeWidth="1" />
        <circle cx="50" cy="42" r="1" fill="#1A3E4C" />
        <circle cx="60" cy="42" r="1" fill="#1A3E4C" />

        {/* Neck */}
        <rect x="50" y="47" width="10" height="3" rx="1" fill="#1A3E4C" />

        {/* Arms - presenting projects */}
        <rect x="30" y="55" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <motion.g
          animate={{ rotate: [0, 20, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
          transformOrigin="75 55"
        >
          <rect x="70" y="55" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
          <rect x="70" y="70" width="10" height="8" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        </motion.g>
        <circle cx="35" cy="55" r="3" fill="#1A3E4C" />
        <circle cx="75" cy="55" r="3" fill="#1A3E4C" />

        {/* Left Hand */}
        <rect x="30" y="70" width="10" height="8" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

        {/* Legs */}
        <rect x="40" y="75" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <rect x="60" y="75" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <circle cx="45" cy="75" r="3" fill="#1A3E4C" />
        <circle cx="65" cy="75" r="3" fill="#1A3E4C" />

        {/* Feet */}
        <rect x="38" y="90" width="14" height="6" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <rect x="58" y="90" width="14" height="6" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

        {/* Tail */}
        <motion.g
          animate={{ rotate: [0, 10, 0, -10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
          style={{ transformOrigin: "30px 65px" }}
        >
          <path
            d="M30,65 C25,60 15,65 10,60"
            stroke="#2A7B9B"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M30,65 C25,60 15,65 10,60"
            stroke="#1A3E4C"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="0,12,0"
          />
        </motion.g>

        {/* Project displays */}
        <motion.g
          animate={{ y: [-2, 2, -2] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
        >
          <rect x="85" y="40" width="15" height="12" rx="2" fill="#3B82F6" stroke="#1A3E4C" strokeWidth="1" />
          <rect x="87" y="42" width="11" height="8" rx="1" fill="#60A5FA" />
          <rect x="88" y="43" width="9" height="1" fill="#93C5FD" />
          <rect x="88" y="45" width="9" height="1" fill="#93C5FD" />
          <rect x="88" y="47" width="6" height="1" fill="#93C5FD" />
        </motion.g>

        <motion.g
          animate={{ y: [2, -2, 2] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
        >
          <rect x="15" y="35" width="15" height="12" rx="2" fill="#3B82F6" stroke="#1A3E4C" strokeWidth="1" />
          <rect x="17" y="37" width="11" height="8" rx="1" fill="#60A5FA" />
          <rect x="18" y="38" width="9" height="1" fill="#93C5FD" />
          <rect x="18" y="40" width="9" height="1" fill="#93C5FD" />
          <rect x="18" y="42" width="6" height="1" fill="#93C5FD" />
        </motion.g>

        {/* Details - rivets and panels */}
        <circle cx="42" cy="55" r="1" fill="#1A3E4C" />
        <circle cx="68" cy="55" r="1" fill="#1A3E4C" />
        <circle cx="42" cy="65" r="1" fill="#1A3E4C" />
        <circle cx="68" cy="65" r="1" fill="#1A3E4C" />
        <circle cx="45" cy="28" r="1" fill="#1A3E4C" />
        <circle cx="65" cy="28" r="1" fill="#1A3E4C" />
      </g>
    </g>
  )
}
