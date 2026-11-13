using BuildingBlocks.Exceptions.Handler;
using Carter;
using CreditTracker.Application.Commons;
using HealthChecks.MongoDb;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;

namespace CreditTracker.Api
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Validate before startup and share one key snapshot between signing and validation.
            var jwtSettings = new JwtSettings(configuration);
            services.AddSingleton(jwtSettings);
            services.AddCarter();
            var connectionString = configuration.GetSection("Database:Connection").Value!;
            var databaseName = configuration.GetSection("Database:Name").Value!;
            services.AddExceptionHandler<CustomExceptionHandler>();
            services.AddSingleton(new MongoDbHealthCheck(new MongoClient(connectionString), databaseName));
            services.AddHealthChecks()
                .AddMongoDb();
          
            services.AddEndpointsApiExplorer();
            services.AddAuthentication("Bearer")    
                .AddJwtBearer("Bearer", options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateIssuerSigningKey = true,
                        ValidateLifetime = true,
                        ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 },
                        ValidIssuer = jwtSettings.Issuer,
                        ValidAudience = jwtSettings.Audience,
                        IssuerSigningKey = jwtSettings.SigningKey
                    };
                });
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Auth API", Version = "v1" });

                // Add JWT authentication to Swagger
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {your token}'",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,    // <<< Change this to Http
                    Scheme = "Bearer",                  // <<< Keep Bearer here
                    BearerFormat = "JWT"                // <<< Optional but good to add
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });
            services.AddAuthorization(options =>
            {
                options.AddPolicy("CustomerPolicy", policy =>
                {
                    policy.RequireRole("Customer");
                });
                options.AddPolicy("ShopPolicy", policy =>
                {
                    policy.RequireRole("Shop");
                });
            });
            services.AddHttpContextAccessor();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            return services;
        }

        public static WebApplication UseApiServices(this WebApplication app)
        {
            app.MapCarter();

            app.UseExceptionHandler(options => { });
            app.UseHealthChecks("/health",
                new HealthCheckOptions
                {
                    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
                });
            app.UseSwagger();
            app.UseSwaggerUI();
            app.UseAuthentication();
            app.UseAuthorization();
            return app;
        }
    }
}
