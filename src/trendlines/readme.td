# Trend Lines indicator

## Description

The search for support and resistance lines is carried out by squeezing to the center of the price movement.
The indicator returns an array of values of five support lines, resistance lines and their slope coefficients.
The parameters are accepted:
maxForks = 10 - limit number of branches
slidingMethod - sliding method.
     0 - non-sliding Trend Line (Zero element of the array outside the line),
     1 - moving Trend Line (Zero element of the array is closer to the current price)
minLog, maxLog - the range of candlestick data log output
To display the slope data closer to the candlestick data on the chart, normalization is used
        let scale = {
            y: 1000,    // Shift
            k: 20       // Multuplicator
        }


## Authors
Dmitry Korotkov
Dmitry Yurov
