import { motion } from "framer-motion"

export const IdlePose = () => {
  return (
    <motion.g animate={{ y: [0, -3, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}>
      {/* Robot Wolf Body */}
      <g>
        {/* Main body */}
        <rect x="40" y="50" width="30" height="25" rx="5" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

        {/* Chest core */}
        <circle cx="55" cy="60" r="6" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
        <circle cx="55" cy="60" r="4" fill="#F39C12" />
        <circle cx="55" cy="60" r="2" fill="#F5B041" />

        {/* Head - slightly tilted down looking at laptop */}
        <motion.g
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4 }}
          transformOrigin="55 36"
        >
          <rect x="42" y="25" width="26" height="22" rx="8" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

          {/* Ears */}
          <polygon points="42,30 35,15 45,25" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
          <polygon points="68,30 75,15 65,25" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
          <polygon points="42,28 38,20 45,25" fill="#F39C12" />
          <polygon points="68,28 72,20 65,25" fill="#F39C12" />

          {/* Eyes - focused on screen */}
          <circle cx="48" cy="35" r="5" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
          <circle cx="62" cy="35" r="5" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
          <motion.circle
            cx="48"
            cy="35"
            r="3"
            fill="white"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
          />
          <motion.circle
            cx="62"
            cy="35"
            r="3"
            fill="white"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
          />

          {/* Snout */}
          <rect x="48" y="40" width="14" height="10" rx="5" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
          <rect x="51" y="45" width="8" height="2" rx="1" fill="#1A3E4C" />
          <circle cx="50" cy="42" r="1" fill="#1A3E4C" />
          <circle cx="60" cy="42" r="1" fill="#1A3E4C" />
        </motion.g>

        {/* Neck */}
        <rect x="50" y="47" width="10" height="3" rx="1" fill="#1A3E4C" />

        {/* Arms - typing on laptop */}
        <motion.g animate={{ y: [0, -1, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.5 }}>
          <rect x="30" y="55" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
          <rect x="30" y="70" width="10" height="8" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        </motion.g>
        <motion.g
          animate={{ y: [0, -1, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.5, delay: 0.25 }}
        >
          <rect x="70" y="55" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
          <rect x="70" y="70" width="10" height="8" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        </motion.g>
        <circle cx="35" cy="55" r="3" fill="#1A3E4C" />
        <circle cx="75" cy="55" r="3" fill="#1A3E4C" />

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
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
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

        {/* Laptop */}
        <rect x="40" y="75" width="30" height="2" fill="#1A3E4C" />
        <rect x="40" y="65" width="30" height="10" rx="1" fill="#3B82F6" />
        <motion.rect
          x="42"
          y="67"
          width="26"
          height="6"
          fill="#0F172A"
          animate={{ opacity: [1, 0.8, 1] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
        />
        <motion.path
          d="M45,70 L48,70 M50,70 L55,70 M57,70 L60,70"
          stroke="#3B82F6"
          strokeWidth="0.5"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
        />

        {/* Details - rivets and panels */}
        <circle cx="42" cy="55" r="1" fill="#1A3E4C" />
        <circle cx="68" cy="55" r="1" fill="#1A3E4C" />
        <circle cx="42" cy="65" r="1" fill="#1A3E4C" />
        <circle cx="68" cy="65" r="1" fill="#1A3E4C" />
        <circle cx="45" cy="28" r="1" fill="#1A3E4C" />
        <circle cx="65" cy="28" r="1" fill="#1A3E4C" />
      </g>
    </motion.g>
  )
}
