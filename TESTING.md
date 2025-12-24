# Unit Testing Documentation

## Overview

This document provides comprehensive information about the unit tests implemented for the CreditTracking application. The test suite ensures code quality, reliability, and maintainability of the application.

## Test Statistics

- **Total Tests**: 56
- **Passed**: 56
- **Failed**: 0
- **Test Coverage**: All major components covered

## Test Projects

### 1. BuildingBlocks.Tests (10 tests)

Tests for shared utility functions and helpers.

#### PasswordHasherTests
- `Hash_ShouldReturnHashedPassword_WhenValidPasswordProvided`
- `Hash_ShouldReturnDifferentHashes_ForSamePassword`
- `Verify_ShouldReturnTrue_WhenPasswordMatches`
- `Verify_ShouldReturnFalse_WhenPasswordDoesNotMatch`
- `Verify_ShouldThrowException_WhenHashIsInvalid`
- `Hash_And_Verify_ShouldWork_WithVariousPasswordLengths` (3 test cases)
- `Hash_ShouldWorkWithSpecialCharacters`
- `Hash_ShouldWorkWithUnicodeCharacters`

### 2. CreditTracker.Domain.Tests (16 tests)

Tests for domain models and business logic.

#### UserTests (8 tests)
- `Create_ShouldReturnUser_WhenValidDataProvided`
- `SetOtp_ShouldSetOtpCodeAndExpiry`
- `VerifyOtp_ShouldReturnTrue_WhenOtpIsValidAndNotExpired`
- `VerifyOtp_ShouldReturnFalse_WhenOtpIsIncorrect`
- `VerifyOtp_ShouldReturnFalse_WhenOtpIsExpired`
- `Update_ShouldUpdateUserProperties`
- `Update_ShouldThrowException_WhenNameIsNull`
- `Update_ShouldThrowException_WhenNameIsEmpty`

#### CreditEntryTests (8 tests)
- `Create_ShouldReturnCreditEntry_WhenValidDataProvided`
- `Create_ShouldAddDomainEvent_WhenCreditEntryCreated`
- `Create_ShouldSetIsPaid_WhenPaymentDateProvided`
- `Update_ShouldUpdatePaymentStatus_WhenCalled`
- `Update_ShouldAddDomainEvent_WhenCreditEntryUpdated`
- `Update_ShouldSetIsPaidToFalse_WhenProvidedFalse`
- `Create_ShouldHandleZeroAmount`
- `Create_ShouldHandleNegativeAmount`

### 3. CreditTracker.Application.Tests (30 tests)

Tests for application layer including command handlers, query handlers, and validators.

#### CreateUserHandlerTests (4 tests)
- `Handle_ShouldReturnSuccessWithId_WhenUserDoesNotExist`
- `Handle_ShouldThrowException_WhenUserAlreadyExists`
- `Handle_ShouldHashPassword_WhenCreatingUser`
- `Handle_ShouldSetOtp_WhenCreatingUser`

#### VerifyOtpHandlerTests (4 tests)
- `Handle_ShouldReturnTrue_WhenOtpIsValid`
- `Handle_ShouldReturnFalse_WhenOtpIsInvalid`
- `Handle_ShouldReturnFalse_WhenOtpIsExpired`
- `Handle_ShouldThrowException_WhenUserNotFound`

#### CreateCreditEntryHandlerTests (4 tests)
- `Handle_ShouldReturnSuccess_WhenBothUsersExist`
- `Handle_ShouldThrowException_WhenCustomerNotFound`
- `Handle_ShouldThrowException_WhenShopNotFound`
- `Handle_ShouldCreateCreditEntry_WithCorrectDetails`

#### UpdateCreditEntryHandlerTests (3 tests)
- `Handle_ShouldReturnSuccess_WhenCreditEntryExists`
- `Handle_ShouldThrowException_WhenCreditEntryNotFound`
- `Handle_ShouldUpdatePaymentStatus_ToUnpaid`

#### DeleteCreditEntryHandlerTests (3 tests)
- `Handle_ShouldReturnSuccess_WhenCreditEntryExists`
- `Handle_ShouldThrowException_WhenCreditEntryNotFound`
- `Handle_ShouldMarkAsInactive_NotPhysicallyDelete`

#### CreateUserCommandValidatorTests (6 tests)
- `Validate_ShouldPass_WhenAllFieldsAreValid`
- `Validate_ShouldFail_WhenNameIsEmpty`
- `Validate_ShouldFail_WhenUserNameIsEmpty`
- `Validate_ShouldFail_WhenICNoOrPassportIsEmpty`
- `Validate_ShouldFail_WhenPasswordIsEmpty`
- `Validate_ShouldFail_WhenRoleIsNotCustomer`

#### CreateCreditEntryValidatorTests (6 tests)
- `Validate_ShouldPass_WhenAllFieldsAreValid`
- `Validate_ShouldFail_WhenItemIsEmpty`
- `Validate_ShouldFail_WhenAmountIsZero`
- `Validate_ShouldFail_WhenAmountIsNegative`
- `Validate_ShouldFail_WhenShopIdIsEmpty`
- `Validate_ShouldFail_WhenCustomerIdIsEmpty`

## Testing Frameworks and Libraries

### xUnit
- Test runner framework
- Used for organizing and executing tests
- Supports data-driven tests with `[Theory]` and `[InlineData]`

### Moq
- Mocking framework
- Used to create mock objects for dependencies
- Enables isolated unit testing

### FluentAssertions
- Assertion library
- Provides readable and expressive assertions
- Improves test maintainability

## Test Patterns

### AAA Pattern (Arrange-Act-Assert)
All tests follow the AAA pattern:
1. **Arrange**: Set up test data and mocks
2. **Act**: Execute the method under test
3. **Assert**: Verify the expected outcome

### Example:
```csharp
[Fact]
public void Hash_ShouldReturnHashedPassword_WhenValidPasswordProvided()
{
    // Arrange
    var password = "TestPassword123!";

    // Act
    var hashedPassword = PasswordHasher.Hash(password);

    // Assert
    hashedPassword.Should().NotBeNullOrEmpty();
    hashedPassword.Should().NotBe(password);
}
```

## Running Tests

### Run All Tests
```bash
dotnet test
```

### Run Specific Test Project
```bash
dotnet test tests/CreditTracker.Domain.Tests/CreditTracker.Domain.Tests.csproj
dotnet test tests/CreditTracker.Application.Tests/CreditTracker.Application.Tests.csproj
dotnet test tests/BuildingBlocks.Tests/BuildingBlocks.Tests.csproj
```

### Run Tests with Detailed Output
```bash
dotnet test --verbosity detailed
```

### Run Tests and Generate Coverage Report
```bash
dotnet test --collect:"XPlat Code Coverage"
```

## Test Coverage Areas

### ✅ Covered
- Domain model creation and validation
- Password hashing and verification
- OTP generation and verification
- User registration workflow
- Credit entry CRUD operations
- FluentValidation validators
- Exception handling scenarios
- Domain events

### 📝 Not Covered (Intentionally)
- Query handlers (require database integration)
- Infrastructure layer (MongoDB repositories)
- API endpoints (integration tests)
- LoginHandler (internal partial class, tested through integration)

## Best Practices Followed

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Single Responsibility**: Each test verifies one behavior
3. **Descriptive Names**: Test names clearly describe what is being tested
4. **Mock Dependencies**: External dependencies are mocked
5. **Assertions**: Clear and specific assertions
6. **Edge Cases**: Tests cover normal flow, error cases, and edge cases

## Security Review

✅ All tests passed CodeQL security analysis with **zero alerts**

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: dotnet test --no-build --verbosity normal
```

## Maintenance

### Adding New Tests
1. Create test class in appropriate test project
2. Follow naming convention: `{ClassUnderTest}Tests`
3. Use AAA pattern
4. Add descriptive test method names
5. Run tests locally before committing

### Updating Tests
- Update tests when business logic changes
- Keep tests synchronized with implementation
- Refactor tests to maintain readability

## Contributors

Tests implemented as part of the CreditTracking application development.
