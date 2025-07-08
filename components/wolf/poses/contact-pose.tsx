import { motion } from "framer-motion"

export const ContactPose = () => {
  return (
    <g>
      {/* Robot Wolf Body */}
      <g>
        {/* Main body */}
        <rect x="40" y="50" width="30" height="25" rx="5" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

        {/* Chest core - message indicator */}
        <circle cx="55" cy="60" r="6" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
        <motion.path
          d="M51,60 L55,62 L59,60 L55,58 Z"
          fill="#F39C12"
          animate={{ scale: [1, 1.2, 1], fill: ["#F39C12", "#F5B041", "#F39C12"] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
        />

        {/* Head */}
        <rect x="42" y="25" width="26" height="22" rx="8" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

        {/* Ears */}
        <polygon points="42,30 35,15 45,25" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <polygon points="68,30 75,15 65,25" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <polygon points="42,28 38,20 45,25" fill="#F39C12" />
        <polygon points="68,28 72,20 65,25" fill="#F39C12" />

        {/* Eyes - friendly */}
        <circle cx="48" cy="35" r="5" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
        <circle cx="62" cy="35" r="5" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
        <motion.path
          d="M46,33 Q48,37 50,33"
          stroke="white"
          strokeWidth="2"
          fill="none"
          animate={{ y: [0, 1, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
        />
        <motion.path
          d="M60,33 Q62,37 64,33"
          stroke="white"
          strokeWidth="2"
          fill="none"
          animate={{ y: [0, 1, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
        />

        {/* Snout - friendly smile */}
        <rect x="48" y="40" width="14" height="10" rx="5" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <path d="M51,46 Q55,48 59,46" stroke="#1A3E4C" fill="none" strokeWidth="1" />
        <circle cx="50" cy="42" r="1" fill="#1A3E4C" />
        <circle cx="60" cy="42" r="1" fill="#1A3E4C" />

        {/* Neck */}
        <rect x="50" y="47" width="10" height="3" rx="1" fill="#1A3E4C" />

        {/* Arms - one holding message */}
        <rect x="30" y="55" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <rect x="70" y="55" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <circle cx="35" cy="55" r="3" fill="#1A3E4C" />
        <circle cx="75" cy="55" r="3" fill="#1A3E4C" />

        {/* Hands */}
        <rect x="30" y="70" width="10" height="8" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <rect x="70" y="70" width="10" height="8" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

        {/* Message in hand */}
        <motion.g
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
          transformOrigin="80 74"
        >
          <rect x="80" y="70" width="12" height="8" rx="1" fill="white" stroke="#1A3E4C" strokeWidth="1" />
          <path d="M82,72 L90,72 M82,74 L88,74 M82,76 L86,76" stroke="#3B82F6" strokeWidth="1" />
        </motion.g>

        {/* Legs */}
        <rect x="40" y="75" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <rect x="60" y="75" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <circle cx="45" cy="75" r="3" fill="#1A3E4C" />
        <circle cx="65" cy="75" r="3" fill="#1A3E4C" />

        {/* Feet */}
        <rect x="38" y="90" width="14" height="6" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <rect x="58" y="90" width="14" height="6" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

        {/* Tail - happy wagging */}
        <motion.g
          animate={{ rotate: [0, 20, 0, -20, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
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

        {/* Communication icons */}
        <motion.g
          animate={{ y: [-2, 2, -2] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
        >
          <circle cx="20" cy="30" r="5" fill="#3B82F6" opacity="0.8" />
          <path d="M17,30 L23,30 M20,27 L20,33" stroke="white" strokeWidth="1" />
        </motion.g>

        <motion.g
          animate={{ y: [2, -2, 2] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
        >
          <circle cx="90" cy="30" r="5" fill="#3B82F6" opacity="0.8" />
          <path d="M87,30 L93,30" stroke="white" strokeWidth="1" />
        </motion.g>

        {/* Email icon */}
        <motion.g
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
        >
          <rect x="15" cy="50" width="10" height="7" rx="1" fill="#3B82F6" opacity="0.8" />
          <path d="M15,50 L20,54 L25,50" stroke="white" strokeWidth="0.5" fill="none" />
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
