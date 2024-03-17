# Exponential Weighted Moving Average (EWMA)
The Exponential Weighted Moving Average (EWMA) is a type of moving average that gives more weight to recent data points. It is calculated using the following formula:

```
EWMA = (Close - Previous EWMA) * (2 / (n + 1)) + Previous EWMA
```