using System.Text.Json;
using BuildingBlocks.Exceptions;
using BuildingBlocks.Exceptions.Handler;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace CreditTracker.Api.Tests;

public class ExceptionHandlerTests
{
    [Theory]
    [InlineData("validation", 400)]
    [InlineData("bad-request", 400)]
    [InlineData("forbidden", 403)]
    [InlineData("not-found", 404)]
    [InlineData("internal", 500)]
    [InlineData("unknown", 500)]
    public async Task Exceptions_MapToProblemResponsesWithTraceIds(string kind, int expectedStatus)
    {
        Exception exception = kind switch
        {
            "validation" => new ValidationException([new ValidationFailure("Name", "Required")]),
            "bad-request" => new BadRequestException("Bad request"),
            "forbidden" => new ForbiddenException("Forbidden"),
            "not-found" => new NotFoundException("Not found"),
            "internal" => new InternalServerException("Internal error"),
            _ => new InvalidOperationException("Unknown error")
        };
        using var services = new ServiceCollection().BuildServiceProvider();
        var context = new DefaultHttpContext { RequestServices = services, TraceIdentifier = "test-trace" };
        context.Request.Path = "/test-path";
        using var stream = new MemoryStream();
        context.Response.Body = stream;
        var handler = new CustomExceptionHandler(NullLogger<CustomExceptionHandler>.Instance);
        Assert.True(await handler.TryHandleAsync(context, exception, CancellationToken.None));
        Assert.Equal(expectedStatus, context.Response.StatusCode);
        stream.Position = 0;
        using var document = await JsonDocument.ParseAsync(stream);
        var body = document.RootElement;
        Assert.Equal(expectedStatus, body.GetProperty("status").GetInt32());
        Assert.Equal(exception.GetType().Name, body.GetProperty("title").GetString());
        Assert.Equal("/test-path", body.GetProperty("instance").GetString());
        Assert.Equal("test-trace", body.GetProperty("traceId").GetString());
        Assert.Equal(kind == "validation", body.TryGetProperty("ValidationErrors", out _));
    }
}
