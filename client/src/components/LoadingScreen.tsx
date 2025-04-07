import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Truck, Search, ArrowRight } from 'lucide-react';

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, message = "Loading..." }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.3,
        when: "afterChildren",
        staggerChildren: 0.1,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      y: -20, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const iconContainerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3,
        delayChildren: 0.2,
        repeat: Infinity,
        repeatType: "loop" as const,
        repeatDelay: 1
      }
    },
    exit: { opacity: 0 }
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.4,
        yoyo: 1
      }
    }
  };

  // Animation for the traveling dot
  const dotVariants = {
    start: { x: -50, opacity: 0 },
    move: { 
      x: 50, 
      opacity: [0, 1, 1, 0],
      transition: { 
        duration: 1.5, 
        repeat: Infinity,
        repeatType: "loop" as const,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
        >
          <motion.div
            className="flex flex-col items-center space-y-8 p-8 rounded-lg max-w-md w-full"
            variants={itemVariants}
          >
            <motion.div className="relative flex items-center justify-center w-24 h-24">
              <motion.div 
                className="flex items-center justify-between w-full"
                variants={iconContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={iconVariants}>
                  <MapPin size={30} className="text-blue-500" />
                </motion.div>
                <motion.div 
                  className="h-0.5 w-10 bg-gray-300 dark:bg-gray-700 relative overflow-hidden mx-2"
                  style={{ width: '80px' }}
                >
                  <motion.div 
                    className="absolute h-full w-3 bg-blue-500 rounded-full"
                    variants={dotVariants}
                    initial="start"
                    animate="move"
                  />
                </motion.div>
                <motion.div variants={iconVariants}>
                  <Truck size={30} className="text-green-500" />
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">
                {message}
              </h2>
              <motion.div 
                className="flex justify-center items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span>Getting things ready</span>
                <span className="flex space-x-1">
                  <span className="animate-bounce delay-0">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </span>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex items-center justify-center space-x-4 mt-4"
              variants={itemVariants}
            >
              <motion.div 
                className="w-3 h-3 rounded-full bg-blue-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.div 
                className="w-3 h-3 rounded-full bg-green-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div 
                className="w-3 h-3 rounded-full bg-indigo-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;