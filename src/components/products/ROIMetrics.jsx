import { useEffect, useRef } from 'react';
import { animate } from 'motion';
import './ROIMetrics.css';

function ROIMetrics({ metrics }) {
  const metricsRef = useRef([]);

  useEffect(() => {
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
    <div className="roi-metrics">
      {metrics.map((metric, index) => (
        <div
          key={index}
          ref={(el) => (metricsRef.current[index] = el)}
          className="roi-metric-item"
        >
          <div className="roi-value-large">{metric.value}</div>
          <div className="roi-label-large">{metric.label}</div>
          {metric.timeframe && (
            <div className="roi-timeframe">{metric.timeframe}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ROIMetrics;
