import { motion } from 'framer-motion';

const EcommerceAnimation = () => {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center w-1/2 p-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative w-full h-full" >
        
        {/* Animated shopping elements */}
        <motion.div
          animate={{ y: [0, -10, 0], }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', }}
          className="absolute top-0 left-1/4 w-16 h-16 bg-blue-500 rounded-full shadow-lg" />
        
        <motion.div
          animate={{ y: [0, -15, 0], }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', delay: 0.5, }}
          className="absolute top-1/3 right-1/4 w-20 h-20 bg-yellow-400 rounded-full shadow-lg" />
        
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0], }}
          transition={{ duration: 3.5, repeat: Infinity, repeatType: 'reverse', delay: 0.3, }}
          className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-green-400 rounded-lg shadow-lg" />
        
        <motion.div
          animate={{ scale: [1, 1.05, 1], }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', }}
          className="absolute bottom-0 right-0 w-32 h-32 bg-pink-400 rounded-lg shadow-lg" />
        
        
        {/* Shopping cart icon */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl"
          animate={{ scale: [1, 1.1, 1], }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', }} > 🛒 </motion.div>

      </motion.div>
      
      <motion.h2  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="mt-8 text-2xl font-bold text-white text-center" > Welcome to Our Platform </motion.h2>
      
      <motion.p  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="mt-2 text-white text-center" > Manage your retail business with ease </motion.p>

    </div>
  );
};

export default EcommerceAnimation;