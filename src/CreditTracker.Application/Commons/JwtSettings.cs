using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.Text;

namespace CreditTracker.Application.Commons
{
    public sealed class JwtSettings
    {
        // Only the fingerprint is retained to prevent accidental reuse of the exposed key.
        private const string ExposedSecretFingerprint =
            "D74AC7A60F20607B479845399D46CD121C166FE51B41EB928D29D658B2A16E24";

        public SymmetricSecurityKey SigningKey { get; }
        public string Issuer { get; }
        public string Audience { get; }

        public JwtSettings(IConfiguration configuration)
        {
            var secret = configuration["JwtSettings:Secret"];
            if (string.IsNullOrWhiteSpace(secret) || Encoding.UTF8.GetByteCount(secret) < 32)
            {
                throw new InvalidOperationException(
                    "JwtSettings:Secret must be a randomly generated key of at least 32 UTF-8 bytes. " +
                    "Configure JwtSettings__Secret through the environment or use .NET User Secrets for local development.");
            }

            var key = Encoding.UTF8.GetBytes(secret);
            if (Convert.ToHexString(SHA256.HashData(key)) == ExposedSecretFingerprint)
            {
                throw new InvalidOperationException(
                    "JwtSettings:Secret is a previously exposed key. Generate a new key and rotate every API instance.");
            }

            Issuer = GetRequiredSetting(configuration, "Issuer");
            Audience = GetRequiredSetting(configuration, "Audience");
            SigningKey = new SymmetricSecurityKey(key);
        }

        private static string GetRequiredSetting(IConfiguration configuration, string name)
        {
            var value = configuration[$"JwtSettings:{name}"];
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new InvalidOperationException($"JwtSettings:{name} must be configured.");
            }

            return value;
        }
    }
}
