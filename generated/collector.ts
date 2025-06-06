import { Tinkler } from "@tinkler-experimental/tinkler-sdk";
import { Metric, InstrumentType, Label } from "./metric";

export class MetricCollector {
  private readonly tinkler: Tinkler;
  private readonly maxBatchSize: number;
  private readonly maxTimePeriodMs: number;
  private metricBuffer: Metric[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(
    tinkler_api_key: string,
    maxBatchSize: number = 100,
    maxTimePeriodMs: number = 10
  ) {
    this.tinkler = new Tinkler({
      apiKey: tinkler_api_key,
    });
    this.maxBatchSize = maxBatchSize;
    this.maxTimePeriodMs = maxTimePeriodMs;
  }

  recordLatency(metricName: string, latency: number, labels: Label[]) {
    const metric = Metric.fromPartial({
      name: metricName,
      timestamp: new Date(),
      instrumentType: InstrumentType.HISTOGRAM,
      labels: labels,
      histogram: {
        sum: latency,
        count: 1,
        buckets: [],
      },
    });

    this.addMetricToBuffer(metric);
  }

  incrementCounter(metricName: string, labels: Label[]) {
    const metric = Metric.fromPartial({
      name: metricName,
      timestamp: new Date(),
      instrumentType: InstrumentType.COUNTER,
      labels: labels,
      counter: {
        count: 1,
      },
    });

    this.addMetricToBuffer(metric);
  }

  private flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.metricBuffer.length === 0) {
      return;
    }

    const batch = this.metricBuffer;
    this.metricBuffer = [];

    for (const metric of batch) {
      this.tinkler.push_record("metric", metric, Metric);
    }
  }

  private addMetricToBuffer(metric: Metric) {
    this.metricBuffer.push(metric);

    if (this.metricBuffer.length >= this.maxBatchSize) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.maxTimePeriodMs);
    }
  }
}