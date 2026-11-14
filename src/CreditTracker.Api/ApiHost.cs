using CreditTracker.Application;
using CreditTracker.Infrastructure;

namespace CreditTracker.Api;

public static class ApiHost
{
    // Share the real startup path with in-process HTTP integration tests.
    public static WebApplication Build(WebApplicationBuilder builder)
    {
        builder.Services
            .AddApplicationServices(builder.Configuration)
            .AddInfrastructureServices(builder.Configuration)
            .AddApiServices(builder.Configuration);

        var app = builder.Build();
        app.UseApiServices();
        return app;
    }
}
