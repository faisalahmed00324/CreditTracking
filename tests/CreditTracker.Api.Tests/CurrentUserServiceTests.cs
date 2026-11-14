using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace CreditTracker.Api.Tests;

public class CurrentUserServiceTests
{
    [Fact]
    public void WithoutRequest_ReturnsNoIdentity()
    {
        var service = new CurrentUserService(new HttpContextAccessor());
        Assert.Null(service.UserId);
    }

    [Fact]
    public void WithoutIdentifierClaim_ReturnsNoIdentity()
    {
        var service = new CurrentUserService(new HttpContextAccessor { HttpContext = new DefaultHttpContext() });
        Assert.Null(service.UserId);
    }

    [Fact]
    public void WithIdentifierClaim_ReturnsAuthenticatedUserId()
    {
        var context = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "test-user")], "test"))
        };
        var service = new CurrentUserService(new HttpContextAccessor { HttpContext = context });
        Assert.Equal("test-user", service.UserId);
    }
}
