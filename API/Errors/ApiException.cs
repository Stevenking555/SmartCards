// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
namespace API.Errors;

public class ApiException(int statusCode, string message, string? details)
{
    public int StatusCode { get; set; } = statusCode;
    public string Message { get; set; } = message;
    public string? Details { get; set; } = details;
}

