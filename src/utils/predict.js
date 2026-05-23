import regression from 'regression';

/**
 * Predicts future values based on historical data using linear regression.
 * @param {Array} data - Array of chart data objects
 * @param {string} dataKey - The key to predict (e.g. 'tds', 'pwr')
 * @param {number} pointsToPredict - Number of future data points to generate
 * @returns {Array} - Combined history + predicted data points
 */
export function generatePredictions(data, dataKey, pointsToPredict = 5) {
  if (!data || data.length < 3) return data;

  // Filter valid data and create [x, y] coordinates
  const validData = [];
  data.forEach((item, index) => {
    if (item[dataKey] !== null && item[dataKey] !== undefined) {
      validData.push([index, Number(item[dataKey])]);
    }
  });

  if (validData.length < 3) return data;

  // Fit linear regression
  const result = regression.linear(validData);
  
  // Clone original data to preserve it
  const augmentedData = [...data];
  
  // Tag original data points (useful if we want to style differently)
  augmentedData.forEach((item) => {
    item[`${dataKey}_actual`] = item[dataKey];
  });

  // the last valid index
  const lastIndex = validData[validData.length - 1][0];
  const lastItem = augmentedData[lastIndex];

  // We'll append new points
  for (let i = 1; i <= pointsToPredict; i++) {
    const nextIndex = data.length - 1 + i;
    const predictedValue = result.predict(nextIndex)[1];
    
    // Guess next timeLabel (simple approach: just add +i to a counter)
    // A more advanced approach would parse the time string, but for now we append ' (Est)'
    const newEntry = {
      isPrediction: true,
      timeLabel: `Est ${i}`, // We can refine this timestamp prediction
    };
    
    // Only set the prediction key, actual is null
    newEntry[`${dataKey}_predicted`] = Number(predictedValue.toFixed(2));
    
    augmentedData.push(newEntry);
  }

  // To make the chart continuous, the last actual point should also have the predicted key 
  // so the line connects seamlessly.
  if (lastItem) {
    lastItem[`${dataKey}_predicted`] = lastItem[dataKey];
  }

  return augmentedData;
}
