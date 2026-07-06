const TourPointerCue = ({ rect }) => {
  if (!rect) return null;

  const style = {
    top: rect.top + rect.height + 6,
    left: rect.left + Math.min(28, rect.width / 2)
  };

  return (
    <div className="tour-pointer-cue" style={style} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" stroke="white" strokeWidth="1" strokeLinejoin="round">
        <path d="M6 3 6 18 10 14.5 12.5 20 15 19 12.5 13.5 18 13 6 3Z" />
      </svg>
    </div>
  );
};

export default TourPointerCue;
