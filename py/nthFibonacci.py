# Example Python utility function.
#
# Python files in py/ can be used as standalone utilities or as MCP tools.
# To expose a function as an MCP tool, add it to py/mcp_driver.py with the
# @mcp_metadata decorator. See AGENTS.md for the full pattern.
#
# This file is a simple helper — not an MCP tool itself.

def nthFibonacci(n: int) -> int:
    """Returns the nth Fibonacci number using dynamic programming."""
    if n <= 1:
        return n

    dp = [0] * (n + 1)

    dp[0] = 0
    dp[1] = 1

    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]

    return dp[n]
