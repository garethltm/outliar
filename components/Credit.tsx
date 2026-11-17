export function Credit({ className = '' }: { className?: string }) {
  return (
    <p className={`credit ${className}`}>
      <span className="wm-out">out</span><span className="wm-liar">LIAR</span>
      <span aria-hidden="true"> · </span>
      Produced by <b>@garethltm</b>
    </p>
  );
}
