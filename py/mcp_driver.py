# MCP tools for temperature conversion.
#
# These are simple tools that use the default Playground UI (no custom React UI needed).
# When an MCP tool has no resourceURI, Playground auto-generates a basic form for it.
#
# After adding or changing tools here, run MakePythonMCP() in the SEMOSS Playground
# to regenerate mcp/py_mcp.json.

import json

from smssutil import mcp_metadata


@mcp_metadata(
    {
        "execution": "auto",
        "displayLocation": "inline",
        "loadingMessage": "Converting temperature...",
    }
)
def fahrenheit_to_celsius(temperature_f: float) -> str:
    """Convert a temperature from Fahrenheit to Celsius."""
    celsius = (temperature_f - 32) * 5 / 9
    return json.dumps({"fahrenheit": temperature_f, "celsius": round(celsius, 2)})


@mcp_metadata(
    {
        "execution": "auto",
        "displayLocation": "inline",
        "loadingMessage": "Converting temperature...",
    }
)
def celsius_to_fahrenheit(temperature_c: float) -> str:
    """Convert a temperature from Celsius to Fahrenheit."""
    fahrenheit = temperature_c * 9 / 5 + 32
    return json.dumps({"celsius": temperature_c, "fahrenheit": round(fahrenheit, 2)})
