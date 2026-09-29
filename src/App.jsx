import React, { useState, useCallback, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const HeightDistribution = () => {
  const [mean, setMean] = useState(176);
  const [stdDev, setStdDev] = useState(7.4);
  const [threshold, setThreshold] = useState(190);
  const [data, setData] = useState([]);
  const [initialProbability, setInitialProbability] = useState(0);
  const [currentProbability, setCurrentProbability] = useState(0);

  const cmToFeetInches = (cm) => {
    const inches = cm / 2.54;
    const feet = Math.floor(inches / 12);
    const remainingInches = Math.round(inches % 12);
    return `${feet}'${remainingInches}"`;
  };

  const calculateProbability = (m, sd, t) => {
    const z = (t - m) / sd;
    return 1 - 0.5 * (1 + erf(z / Math.sqrt(2)));
  };

  // Error function approximation
  const erf = (x) => {
    const sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  };

  const generateData = useCallback(() => {
    const newData = [];
    const originalMean = 176;
    const originalStdDev = 7.4;
    const minX = Math.min(originalMean, mean) - 4 * Math.max(originalStdDev, stdDev);
    const maxX = Math.max(originalMean, mean) + 4 * Math.max(originalStdDev, stdDev);

    for (let x = minX; x <= maxX; x += 0.5) {
      const yOriginal = (1 / (originalStdDev * Math.sqrt(2 * Math.PI))) * 
                Math.exp(-0.5 * Math.pow((x - originalMean) / originalStdDev, 2));
      const yCurrent = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * 
                Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
      newData.push({ 
        x: x.toFixed(1), 
        original: yOriginal.toFixed(6),
        current: yCurrent.toFixed(6)
      });
    }
    return newData;
  }, [mean, stdDev]);

  useEffect(() => {
    const newData = generateData();
    setData(newData);
    setInitialProbability(calculateProbability(176, 7.4, 190));
    setCurrentProbability(calculateProbability(mean, stdDev, threshold));
  }, [mean, stdDev, threshold, generateData]);

  if (data.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Mean Height: {mean.toFixed(1)} cm ({cmToFeetInches(mean)})
          <input
            type="range"
            min="170"
            max="182"
            step="0.1"
            value={mean}
            onChange={(e) => setMean(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Standard Deviation: {stdDev.toFixed(1)} cm ({(stdDev / 2.54).toFixed(1)} inches)
          <input
            type="range"
            min="5"
            max="10"
            step="0.1"
            value={stdDev}
            onChange={(e) => setStdDev(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Threshold: {threshold.toFixed(1)} cm ({cmToFeetInches(threshold)})
          <input
            type="range"
            min="170"
            max="210"
            step="0.1"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>
      </div>
      <div style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} />
            <YAxis />
            <Tooltip formatter={(value, name, props) => [
              `${parseFloat(value).toFixed(6)}`,
              `Height: ${props.payload.x} cm (${cmToFeetInches(Number(props.payload.x))})`
            ]} />
            <Legend />
            <Line type="monotone" dataKey="original" stroke="#82ca9d" dot={false} name="Original" />
            <Line type="monotone" dataKey="current" stroke="#8884d8" dot={false} name="Current" />
            <svg>
              <defs>
                <pattern id="dottedPattern" patternUnits="userSpaceOnUse" width="4" height="4">
                  <circle cx="2" cy="2" r="1" fill="red" />
                </pattern>
              </defs>
              <line
                x1={`${((threshold - Number(data[0].x)) / (Number(data[data.length - 1].x) - Number(data[0].x))) * 100}%`}
                y1="0%"
                x2={`${((threshold - Number(data[0].x)) / (Number(data[data.length - 1].x) - Number(data[0].x))) * 100}%`}
                y2="100%"
                stroke="url(#dottedPattern)"
                strokeWidth="2"
              />
            </svg>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p style={{ fontWeight: 'bold' }}>
        Probability of Height &gt; {threshold.toFixed(1)} cm ({cmToFeetInches(threshold)}): {' '}
        <span style={{ color: '#82ca9d' }}>{(initialProbability * 100).toFixed(2)}%</span>
        {' → '}
        <span style={{ color: '#8884d8' }}>{(currentProbability * 100).toFixed(2)}%</span>
      </p>
    </div>
  );
};

export default HeightDistribution;