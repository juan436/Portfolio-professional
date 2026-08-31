"use client"

import { motion } from "framer-motion"
import { WolfBase } from "@/components/wolf/wolf-base"

export function RobotWolf() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className="mb-8"
    >
      <svg width="150" height="150" viewBox="0 0 120 100">
        <motion.g
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 2,
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: 1,
          }}
        >
          <WolfBase
            chestPulse
            head={
              <>
                <rect x="42" y="25" width="26" height="22" rx="8" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

                <polygon points="42,30 35,15 45,25" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
                <polygon points="68,30 75,15 65,25" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
                <polygon points="42,28 38,20 45,25" fill="#F39C12" />
                <polygon points="68,28 72,20 65,25" fill="#F39C12" />

                <circle cx="48" cy="35" r="5" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
                <circle cx="62" cy="35" r="5" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
                <motion.g
                  animate={{ scaleY: [1, 0.2, 1] }}
                  transition={{ repeat: 1, duration: 1.5, delay: 1 }}
                  originX={48}
                  originY={35}
                >
                  <circle cx="48" cy="35" r="3" fill="white" />
                </motion.g>
                <motion.g
                  animate={{ scaleY: [1, 0.2, 1] }}
                  transition={{ repeat: 1, duration: 1.5, delay: 1 }}
                  originX={62}
                  originY={35}
                >
                  <circle cx="62" cy="35" r="3" fill="white" />
                </motion.g>

                <rect x="47" y="40" width="16" height="10" rx="5" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
                <motion.g
                  animate={{ y: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: 1 }}
                >
                  <path
                    d="M50,45 Q55,48 60,45"
                    stroke="#1A3E4C"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </motion.g>
              </>
            }
            arms={
              <>
                <motion.g
                  animate={{ rotate: [0, -20, 0, -20, 0] }}
                  transition={{ duration: 2, times: [0, 0.25, 0.5, 0.75, 1], repeat: 1 }}
                  originX={75}
                  originY={75}
                >
                  <rect x="70" y="55" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
                  <rect x="70" y="70" width="10" height="8" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
                </motion.g>
                <rect x="30" y="70" width="10" height="8" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
              </>
            }
            tail={
              <motion.g
                animate={{ rotate: [0, 30, 0, -30, 0] }}
                transition={{ repeat: 2, duration: 1 }}
                originX="30"
                originY="65"
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
            }
          />
        </motion.g>
      </svg>
    </motion.div>
  )
}
