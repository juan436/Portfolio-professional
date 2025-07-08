import { WelcomePose } from "./poses/welcome-pose"
import { AboutPose } from "./poses/about-pose"
import { SkillsPose } from "./poses/skills-pose"
import { ProjectsPose } from "./poses/projects-pose"
import { ExperiencePose } from "./poses/experience-pose"
import { ContactPose } from "./poses/contact-pose"
import { IdlePose } from "./poses/idle-pose"
import { WolfState } from "./types"

interface WolfSvgProps {
  state: WolfState
  isFirstVisit?: boolean
}

export const WolfSvg = ({ state, isFirstVisit = true }: WolfSvgProps) => {
  // Función para obtener la pose correcta basada en el estado
  const getWolfPose = () => {
    // Si estamos en la sección de bienvenida pero ya no es la primera visita
    if (state === "welcome" && !isFirstVisit) {
      return <IdlePose />
    }

    switch (state) {
      case "welcome":
        return <WelcomePose />
      case "about":
        return <AboutPose />
      case "skills":
        return <SkillsPose />
      case "projects":
        return <ProjectsPose />
      case "experience":
        return <ExperiencePose />
      case "contact":
        return <ContactPose />
      case "idle":
        return <IdlePose />
      default:
        return <WelcomePose />
    }
  }

  return (
    <svg width="110" height="100" viewBox="0 0 110 100">
      {getWolfPose()}
    </svg>
  )
}

// Animaciones para cada estado del lobo
export const getWolfAnimation = (state: WolfState) => {
  switch (state) {
    case "welcome":
      return {
        initial: { x: 100, opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { type: "spring", bounce: 0.5 } },
        exit: { x: 100, opacity: 0 },
      }
    case "about":
      return {
        initial: { rotate: 10, opacity: 0 },
        animate: { rotate: 0, opacity: 1, transition: { type: "spring" } },
        exit: { rotate: -10, opacity: 0 },
      }
    case "experience":
      return {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300 } },
        exit: { scale: 0.8, opacity: 0 },
      }
    case "skills":
      return {
        initial: { rotate: 0, scale: 0.8, opacity: 0 },
        animate: { rotate: 360, scale: 1, opacity: 1, transition: { duration: 0.8 } },
        exit: { scale: 0.8, opacity: 0 },
      }
    case "projects":
      return {
        initial: { y: 50, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { type: "spring" } },
        exit: { y: 50, opacity: 0 },
      }
    case "contact":
      return {
        initial: { y: -50, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { type: "spring" } },
        exit: { y: -50, opacity: 0 },
      }
    case "idle":
      return {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.3 } },
        exit: { y: 20, opacity: 0 },
      }
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
  }
}
