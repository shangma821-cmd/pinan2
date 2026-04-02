import React from 'react';

interface VisualizerProps {
  isActive: boolean;
  color?: string;
}

export const Visualizer: React.FC<VisualizerProps> = ({ isActive, color = "bg-blue-500" }) => {
  if (!isActive) {
    return (
      <div className="sci-viz sci-viz-idle">
        {[...Array(7)].map((_, i) => (
          <span key={i} className="sci-viz-bar" style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="sci-viz">
      {[...Array(7)].map((_, i) => (
        <span
          key={i}
          className={`sci-viz-bar ${color}`}
          style={{
            animationDelay: `${i * 0.08}s`,
            height: `${18 + (i % 3) * 8}px`,
          }}
        />
      ))}
    </div>
  );
};
