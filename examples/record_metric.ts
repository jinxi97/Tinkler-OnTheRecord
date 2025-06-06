import { MetricCollector } from "../generated/collector";

const collector = new MetricCollector(process.env.TINKLER_API_KEY!);

// Record the latency of a method
collector.recordLatency("test_latency", 100, [
  { key: "method", value: "/tinkler/api/get_user" },
]);

// Increment the counter of a method. For QPS and error rate.
collector.incrementCounter("request_counter", [
  { key: "method", value: "/tinkler/api/get_user" },
]);

// Increment the counter of a failed request. For error rate.
collector.incrementCounter("failed_request_counter", [
  { key: "method", value: "/tinkler/api/get_user" },
]);