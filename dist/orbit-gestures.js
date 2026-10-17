// Bind only the compact hit surface. Vertical touch movement belongs to page scrolling.
export function bindOrbitGestures(surface, { onRotate, onScale }) {
  const pointers = new Map();
  const activate = () => surface.classList.add('is-dragging');
  const reset = () => {
    const ids = [...pointers.keys()]; pointers.clear();
    for (const id of ids) if (surface.hasPointerCapture?.(id)) surface.releasePointerCapture(id);
    surface.classList.remove('is-dragging');
  };
  function down(event) {
    if (event.target.closest?.('button') || (event.pointerType === 'mouse' && event.button !== 0) || pointers.size >= 2) return;
    event.stopPropagation();
    const touch = event.pointerType === 'touch';
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, touch, axis: touch ? null : 'orbit' });
    if (!touch) { surface.setPointerCapture?.(event.pointerId); activate(); }
    if (pointers.size === 2) activate();
  }
  function move(event) {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    event.stopPropagation();
    const dx = event.clientX - previous.x, dy = event.clientY - previous.y;
    if (pointers.size === 2) {
      const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)[1];
      const before = Math.hypot(previous.x - other.x, previous.y - other.y);
      const after = Math.hypot(event.clientX - other.x, event.clientY - other.y);
      if (before > 0 && after > 0) onScale(after / before);
    } else {
      if (previous.touch && previous.axis === null) {
        const totalX = Math.abs(event.clientX - previous.startX), totalY = Math.abs(event.clientY - previous.startY);
        if (Math.max(totalX, totalY) >= 6) previous.axis = totalY > totalX ? 'scroll' : 'orbit';
      }
      if (previous.axis === 'orbit') { activate(); onRotate(dx, previous.touch ? 0 : dy); }
    }
    previous.x = event.clientX;
    previous.y = event.clientY;
    // No preventDefault: CSS pan-y lets the browser take over vertical scrolling.
  }
  function end(event) {
    if (!pointers.has(event.pointerId)) return;
    event.stopPropagation();
    pointers.delete(event.pointerId);
    if (surface.hasPointerCapture?.(event.pointerId)) surface.releasePointerCapture(event.pointerId);
    if (!pointers.size) surface.classList.remove('is-dragging');
    else for (const pointer of pointers.values()) {
      pointer.startX = pointer.x; pointer.startY = pointer.y; pointer.axis = pointer.touch ? null : 'orbit';
    }
  }
  function wheel(event) { event.stopPropagation(); event.preventDefault(); onScale(Math.exp(-event.deltaY * .001)); }
  const handlers = { pointerdown: down, pointermove: move, pointerup: end, pointercancel: end, lostpointercapture: end, wheel };
  for (const [type, handler] of Object.entries(handlers)) surface.addEventListener(type, handler, type === 'wheel' ? { passive: false } : undefined);
  return { reset, destroy() { reset(); for (const [type, handler] of Object.entries(handlers)) surface.removeEventListener(type, handler); } };
}
