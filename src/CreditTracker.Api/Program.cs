using CreditTracker.Api;
using CreditTracker.Infrastructure.Data.Seed;

var builder = WebApplication.CreateBuilder(args);

if (args.Contains("--seed"))
{
    await CreditTrackerSeeder.SeedAsync(builder.Configuration);
    Console.WriteLine("Seed data upsert completed.");
    return;
}

var app = ApiHost.Build(builder);
app.Run();
