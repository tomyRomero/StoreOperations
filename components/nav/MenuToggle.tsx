import { motion as m } from 'framer-motion';

interface Props {
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
}

const MenuToggle = ({ isActive, setIsActive }: Props) => {

  return (
    <div
      className="justify-self-center flex items-center gap-[9px] cursor-pointer"
      onClick={() => setIsActive(!isActive)}
    >
      <div className="flex flex-col gap-[10px]">
        <m.span
          animate={isActive ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          className={`w-[30px] h-[3px] bg-black`}
        ></m.span>
        <m.span
          animate={isActive ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          className={`w-[30px] h-[3px] bg-black`}
        ></m.span>
      </div>
    </div>
  );
}
export default MenuToggle;