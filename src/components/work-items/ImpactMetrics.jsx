import { useEffect, useRef } from 'react';
import { animate } from 'motion';
import './ImpactMetrics.css';

function ImpactMetrics({ metrics }) {
  const metricsRef = useRef([]);

  useEffect(() => {
    // Animate metrics on mount with stagger
    metricsRef.current.forEach((el, index) => {
      if (el) {
        animate(
          el,
          {
            opacity: [0, 1],
            transform: ['translateY(20px)', 'translateY(0)'],
          },
          {
            duration: 0.6,
            delay: index * 0.1,
            easing: [0.42, 0, 0.58, 1],
          }
        );
      }
    });
  }, []);

  return (
    <div className="impact-metrics">
      {metrics.map((metric, index) => (
        <div
          key={index}
          ref={(el) => (metricsRef.current[index] = el)}
          className="impact-metric-item"
        >
          <div className="metric-value-large">{metric.value}</div>
          <div className="metric-label-large">{metric.label}</div>
          {metric.context && (
            <div className="metric-context-large">{metric.context}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ImpactMetrics;
