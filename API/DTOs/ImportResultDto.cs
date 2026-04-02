using System.Collections.Generic;

namespace API.DTOs;

public class ImportResultDto
{
    public bool IsSuccess { get; set; }
    public int ImportedCount { get; set; }
    public List<string> FailedLines { get; set; } = new();
}
