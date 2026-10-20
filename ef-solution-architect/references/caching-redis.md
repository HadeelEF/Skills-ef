# Caching mechanisms and Redis

## Specify the cache contract

Choose what to cache and why: reference data, expensive queries, public output,
session data or computed artifacts. Identify the authoritative source, key/schema,
tenant/user/security scope, maximum staleness, size, TTL, invalidation, refresh,
eviction, serialization/versioning and behavior when the cache is unavailable.
A TTL is a staleness bound only if all relevant read/write paths honor it.

Distinguish browser/CDN/output caches, process-local memory, distributed Redis,
multi-level caches and durable stores. Cookies, access tokens, permission results,
public assets and business records have different security and recovery needs.
Never allow a shared cache key to cross tenant/workspace or authorization boundaries.

## Select the mechanism deliberately

| Mechanism | Suitable need | Failure/consistency questions |
| --- | --- | --- |
| In-process memory | Cheap local acceleration | Per-instance divergence, restart and bounded memory |
| Cache-aside | Recomputable read data | Miss/stampede, stale repopulation after writes and invalidation order |
| Read/write-through | Centralized cache/store path | Ownership, partial failures and source-of-truth guarantees |
| Write-behind | Deferred persistence with explicit durability needs | Loss/replay/order; never treat an evictable cache as a durable queue by default |
| Distributed Redis | Shared acceleration/coordination where supported | Network outage, eviction, topology, replication lag and failover |
| HybridCache or layered design | Local speed plus shared caching | Version-specific stampede scope and cross-instance L1 invalidation |
| Output/edge cache | Cacheable responses | Personalization, authorization, Vary/keys, purge and revalidation |

For .NET evaluate IMemoryCache, IDistributedCache and current HybridCache behavior.
Verify supported APIs and distributed backends. Do not assume local stampede
protection coordinates every process or that invalidating L2 clears all L1 copies.

## Preserve correctness under races

Walk write→commit→invalidate/publish→read interleavings. Handle stale readers
repopulating a deleted cache entry. Consider versioned keys, generation tokens,
short bounded TTL or appropriate coordination; choose by the required freshness.
State the cost of invalidation messages being delayed or lost.

Use request coalescing, bounded concurrency, jittered expiry or stale-while-
revalidate where permitted. Treat negative caching and high-cardinality inputs
carefully. Avoid cache penetration and stampedes on cold start or Redis outage.
Bound fallback load so a failed cache does not overload the database.

## Engineer Redis as a service

Select the actual Redis-compatible product, edition, version, hosting and license;
verify feature/client compatibility instead of assuming all managed products
implement every command or extension. For EF's Windows apps, Redis may be a
separate supported managed service or server; do not assume an old native Windows
Redis build or a development Docker/WSL setup is an approved production platform.

Specify private connectivity, TLS/ACLs, secret rotation, memory and eviction,
replication/HA, persistence/recovery if required, backup and upgrade ownership.
Estimate key and value sizes including overhead and retention; measure hit rate,
miss latency, evictions, memory pressure and backend impact. Reuse connections
according to the current .NET client guidance; bound timeouts and retries.

Separate data with incompatible eviction/durability requirements. Redis used for
sessions, idempotency, jobs and a disposable cache cannot be assumed equally safe
under one eviction policy. Check cluster key/hash-slot constraints for atomic
operations and scripts; do not assume cross-key atomicity across arbitrary shards.

## Distinguish coordination from correctness

For locks define ownership tokens, lease expiry, safe release, clock/failover
assumptions and stale-worker behavior. Use durable constraints or fencing at the
resource when the invariant requires it. A Redis lock alone does not guarantee
one business side effect after pauses, partitions or failover.

Redis Pub/Sub is not a durable business-event ledger. Evaluate Streams or a
message broker against persistence, acknowledgment, replay and operational needs;
do not assume enabling Redis solves event delivery. Follow the event-work reference.

## Validate

Test cold cache, concurrent misses/writes, stale invalidation, logout/role change,
tenant switch, eviction, outage, reconnection and failover for the actual contract.
Measure improvement and source-system load. Document safe degradation and the
accepted staleness rather than treating a high hit rate as business correctness.
