using Ardalis.Result;
using BuildingBlocks.Helper;
using Microsoft.AspNetCore.Http;

namespace CreditTracker.Api.Tests;

public class ResultExtensionsTests
{
    [Theory]
    [InlineData("ok", 200)]
    [InlineData("conflict", 409)]
    [InlineData("invalid", 400)]
    [InlineData("missing", 404)]
    [InlineData("unauthorized", 401)]
    [InlineData("empty", 204)]
    [InlineData("error", 400)]
    public void Results_MapToExpectedStatusAndResponseTypes(string kind, int expectedStatus)
    {
        var result = kind switch
        {
            "ok" => Result<Payload>.Success(new Payload("Value")),
            "conflict" => Result<Payload>.Conflict("Conflict"),
            "invalid" => Result<Payload>.Invalid(new ValidationError { Identifier = "Name", ErrorMessage = "Required" }),
            "missing" => Result<Payload>.NotFound("Missing"),
            "unauthorized" => Result<Payload>.Unauthorized(),
            "empty" => Result<Payload>.NoContent(),
            _ => Result<Payload>.Error("Error")
        };
        var response = result.ToApiResult<Payload, Response>();
        Assert.Equal(expectedStatus, Assert.IsAssignableFrom<IStatusCodeHttpResult>(response).StatusCode);
        if (kind == "ok")
        {
            var value = Assert.IsAssignableFrom<IValueHttpResult>(response).Value;
            Assert.Equal("Value", Assert.IsType<Response>(value).Name);
        }
    }

    public sealed record Payload(string Name);
    public sealed record Response(string Name);
}
