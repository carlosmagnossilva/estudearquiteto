import { useRef, useCallback } from "react";

export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const startX = e.pageX - ref.current.offsetLeft;
    const startY = e.pageY - ref.current.offsetTop;
    const scrollLeft = ref.current.scrollLeft;
    const scrollTop = ref.current.scrollTop;

    const onMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      // Não damos preventDefault aqui para permitir cliques em botões, 
      // mas calculamos o deslocamento
      const x = e.pageX - ref.current.offsetLeft;
      const y = e.pageY - ref.current.offsetTop;
      const walkX = (x - startX) * 1.5;
      const walkY = (y - startY) * 1.5;
      
      ref.current.scrollLeft = scrollLeft - walkX;
      ref.current.scrollTop = scrollTop - walkY;
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, []);

  return { ref, onMouseDown };
}
