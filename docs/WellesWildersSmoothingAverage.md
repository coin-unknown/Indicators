# Welles Wilder's Smoothing Average (WWS)
Welles Wilder's Smoothing Average (WWS) is a type of moving average that assigns more weight to recent data points. It is calculated using the following formula:

```
WWS = (Close + (n - 1) * Previous WWS) / n
```