using CreditTracker.Api;
using CreditTracker.Application.Commons;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;

namespace CreditTracker.Api.Tests
{
    public class JwtConfigurationTests
    {
        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData("too-short")]
        public void RegistrationRejectsMissingOrWeakSecret(string? secret)
        {
            var configuration = CreateConfiguration(secret);

            var exception = Assert.Throws<InvalidOperationException>(
                () => new ServiceCollection().AddApiServices(configuration));

            Assert.Contains("JwtSettings__Secret", exception.Message);
            if (!string.IsNullOrWhiteSpace(secret))
            {
                Assert.DoesNotContain(secret, exception.Message);
            }
        }

        [Theory]
        [InlineData("JwtSettings:Issuer")]
        [InlineData("JwtSettings:Audience")]
        public void RegistrationRejectsMissingIssuerOrAudience(string setting)
        {
            var configuration = CreateConfiguration(CreateSecret());
            configuration[setting] = "";

            var exception = Assert.Throws<InvalidOperationException>(
                () => new ServiceCollection().AddApiServices(configuration));

            Assert.Contains(setting, exception.Message);
        }

        [Fact]
        public void EnvironmentOverridesTheConfiguredSecret()
        {
            var prefix = $"CREDITTRACKER_TEST_{Guid.NewGuid():N}_";
            var variable = prefix + "JwtSettings__Secret";
            var secret = CreateSecret();
            Environment.SetEnvironmentVariable(variable, secret);
            try
            {
                var configuration = new ConfigurationBuilder()
                    .AddConfiguration(CreateConfiguration("too-short"))
                    .AddEnvironmentVariables(prefix)
                    .Build();

                var settings = new JwtSettings(configuration);

                Assert.Equal(Encoding.UTF8.GetBytes(secret), settings.SigningKey.Key);
            }
            finally
            {
                Environment.SetEnvironmentVariable(variable, null);
            }
        }

        [Fact]
        public void SigningAndValidationShareTheSameStartupKey()
        {
            var configuration = CreateConfiguration(CreateSecret());
            using var provider = CreateServices(configuration);
            var settings = provider.GetRequiredService<JwtSettings>();
            var parameters = GetValidationParameters(provider);

            Assert.Same(settings.SigningKey, parameters.IssuerSigningKey);
            configuration["JwtSettings:Secret"] = CreateSecret();
            Assert.Same(settings.SigningKey, GetValidationParameters(provider).IssuerSigningKey);

            var token = CreateToken(settings.SigningKey);
            new JwtSecurityTokenHandler().ValidateToken(token, parameters, out _);
        }

        [Fact]
        public void RotationRejectsTokensSignedWithThePreviousKey()
        {
            // Generate both keys at runtime; never copy deployment secrets into tests.
            var previousKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(CreateSecret()));
            using var provider = CreateServices(CreateConfiguration(CreateSecret()));
            var token = CreateToken(previousKey);

            Assert.ThrowsAny<SecurityTokenException>(() =>
                new JwtSecurityTokenHandler().ValidateToken(token, GetValidationParameters(provider), out _));
        }

        [Theory]
        [InlineData("other-issuer", "test-audience")]
        [InlineData("test-issuer", "other-audience")]
        public void ValidationRejectsWrongIssuerOrAudience(string issuer, string audience)
        {
            using var provider = CreateServices(CreateConfiguration(CreateSecret()));
            var settings = provider.GetRequiredService<JwtSettings>();
            var token = CreateToken(settings.SigningKey, issuer, audience);

            Assert.ThrowsAny<SecurityTokenException>(() =>
                new JwtSecurityTokenHandler().ValidateToken(token, GetValidationParameters(provider), out _));
        }

        [Fact]
        public void ValidationRejectsExpiredTokens()
        {
            using var provider = CreateServices(CreateConfiguration(CreateSecret()));
            var settings = provider.GetRequiredService<JwtSettings>();
            var token = CreateToken(settings.SigningKey, expires: DateTime.UtcNow.AddMinutes(-10));

            Assert.Throws<SecurityTokenExpiredException>(() =>
                new JwtSecurityTokenHandler().ValidateToken(token, GetValidationParameters(provider), out _));
        }

        [Fact]
        public void ValidationRejectsOtherSigningAlgorithms()
        {
            using var provider = CreateServices(CreateConfiguration(CreateSecret()));
            var settings = provider.GetRequiredService<JwtSettings>();
            var token = CreateToken(settings.SigningKey, algorithm: SecurityAlgorithms.HmacSha384);

            Assert.ThrowsAny<SecurityTokenException>(() =>
                new JwtSecurityTokenHandler().ValidateToken(token, GetValidationParameters(provider), out _));
        }

        private static string CreateSecret() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        private static IConfigurationRoot CreateConfiguration(string? secret) => new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:Secret"] = secret,
                ["JwtSettings:Issuer"] = "test-issuer",
                ["JwtSettings:Audience"] = "test-audience",
                ["Database:Connection"] = "mongodb://localhost:27017",
                ["Database:Name"] = "CreditTrackerTests"
            })
            .Build();

        private static ServiceProvider CreateServices(IConfiguration configuration) => new ServiceCollection()
            .AddLogging()
            .AddApiServices(configuration)
            .BuildServiceProvider();

        private static TokenValidationParameters GetValidationParameters(ServiceProvider provider) => provider
            .GetRequiredService<IOptionsMonitor<JwtBearerOptions>>()
            .Get("Bearer")
            .TokenValidationParameters;

        private static string CreateToken(
            SecurityKey key,
            string issuer = "test-issuer",
            string audience = "test-audience",
            DateTime? expires = null,
            string algorithm = SecurityAlgorithms.HmacSha256) => new JwtSecurityTokenHandler().WriteToken(
                new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    expires: expires ?? DateTime.UtcNow.AddMinutes(5),
                    signingCredentials: new SigningCredentials(key, algorithm)));
    }
}
