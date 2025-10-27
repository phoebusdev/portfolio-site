import './LayeredBackground.css';

function LayeredBackground() {
  return (
    <div className="layered-background depth-desktop-only" aria-hidden="true">
      <div className="bg-layer bg-layer-1" />
      <div className="bg-layer bg-layer-2" />
      <div className="bg-layer bg-layer-3" />
    </div>
  );
}

export default LayeredBackground;
