using CreditTracker.Api;
using CreditTracker.Application;
using CreditTracker.Infrastructure;
using CreditTracker.Infrastructure.Data.Seed;

var builder = WebApplication.CreateBuilder(args);

if (args.Contains("--seed"))
{
    await CreditTrackerSeeder.SeedAsync(builder.Configuration);
    Console.WriteLine("Seed data upsert completed.");
    return;
}

builder.Services
    .AddApplicationServices(builder.Configuration)
    .AddInfrastructureServices(builder.Configuration)
    .AddApiServices(builder.Configuration);

var app = builder.Build();


app.UseApiServices();


app.Run();
