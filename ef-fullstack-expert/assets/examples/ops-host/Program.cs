using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

// Isolated hosting example: no authentication, business API, database, or durable jobs.
var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<HostOptions>(o => o.ShutdownTimeout = TimeSpan.FromSeconds(20));
builder.Services.AddHealthChecks()
    .AddCheck<HostStartedCheck>("host-started", tags: ["startup"])
    .AddCheck<HostReadyCheck>("host-ready", tags: ["ready"]);
var app = builder.Build();
app.MapGet("/", () => Results.Ok(new { example = "hosting-only", persistence = false }));
app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });
app.MapHealthChecks("/health/startup", new HealthCheckOptions
{
    Predicate = registration => registration.Tags.Contains("startup")
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = registration => registration.Tags.Contains("ready")
});
app.Run();

public sealed class HostStartedCheck(IHostApplicationLifetime lifetime) : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, CancellationToken cancellationToken = default) =>
        Task.FromResult(lifetime.ApplicationStarted.IsCancellationRequested
            ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy());
}

public sealed class HostReadyCheck(IHostApplicationLifetime lifetime) : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var ready = lifetime.ApplicationStarted.IsCancellationRequested &&
                    !lifetime.ApplicationStopping.IsCancellationRequested;
        return Task.FromResult(ready ? HealthCheckResult.Healthy()
                                    : HealthCheckResult.Unhealthy());
    }
}
