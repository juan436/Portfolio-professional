import { motion } from "framer-motion"

export const SkillsPose = () => {
  return (
    <g>
      {/* Robot Wolf Body */}
      <g>
        {/* Main body */}
        <rect x="40" y="50" width="30" height="25" rx="5" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

        {/* Chest core - spinning */}
        <circle cx="55" cy="60" r="6" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "linear" }}
          transformOrigin="55 60"
        >
          <path d="M55,56 L55,64 M51,60 L59,60" stroke="#F39C12" strokeWidth="2" />
          <circle cx="55" cy="60" r="2" fill="#F5B041" />
        </motion.g>

        {/* Head */}
        <rect x="42" y="25" width="26" height="22" rx="8" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

        {/* Ears */}
        <polygon points="42,30 35,15 45,25" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <polygon points="68,30 75,15 65,25" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <polygon points="42,28 38,20 45,25" fill="#F39C12" />
        <polygon points="68,28 72,20 65,25" fill="#F39C12" />

        {/* Eyes - tech scanning */}
        <circle cx="48" cy="35" r="5" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
        <circle cx="62" cy="35" r="5" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
        <motion.rect
          x="45"
          y="34"
          width="6"
          height="2"
          fill="white"
          animate={{ x: [45, 47, 45] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
        />
        <motion.rect
          x="59"
          y="34"
          width="6"
          height="2"
          fill="white"
          animate={{ x: [59, 61, 59] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
        />

        {/* Snout */}
        <rect x="48" y="40" width="14" height="10" rx="5" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <rect x="51" y="45" width="8" height="2" rx="1" fill="#1A3E4C" />
        <circle cx="50" cy="42" r="1" fill="#1A3E4C" />
        <circle cx="60" cy="42" r="1" fill="#1A3E4C" />

        {/* Neck */}
        <rect x="50" y="47" width="10" height="3" rx="1" fill="#1A3E4C" />

        {/* Arms - holding tools */}
        <rect x="30" y="55" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <rect x="70" y="55" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <circle cx="35" cy="55" r="3" fill="#1A3E4C" />
        <circle cx="75" cy="55" r="3" fill="#1A3E4C" />

        {/* Hands with tools */}
        <rect x="30" y="70" width="10" height="8" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <rect x="70" y="70" width="10" height="8" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
        <motion.rect
          x="25"
          y="70"
          width="5"
          height="8"
          rx="1"
          fill="#3B82F6"
          animate={{ rotate: [0, 10, 0, -10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
          transformOrigin="30 74"
        />
        <motion.path
          d="M80,74 L85,74 M82.5,71.5 L82.5,76.5"
          stroke="#3B82F6"
          strokeWidth="2"
          animate={{ rotate: [0, 180, 360] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
          transformOrigin="80 74"
        />

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
          animate={{ rotate: [0, 15, 0, -15, 0] }}
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

        {/* Tools around wolf */}
        <motion.g
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 10, ease: "linear" }}
          transformOrigin="55 55"
        >
          <motion.rect
            x="90"
            y="30"
            width="10"
            height="6"
            fill="#3B82F6"
            rx="2"
            animate={{ x: [90, 95, 90], y: [30, 25, 30] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, repeatType: "reverse" }}
          />
          <motion.circle
            cx="90"
            cy="60"
            r="4"
            fill="#3B82F6"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          />
          <motion.path
            d="M20,40 L15,45 L25,45 Z"
            fill="#3B82F6"
            animate={{ rotate: [0, 15, 0, -15, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            transformOrigin="20 40"
          />
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
