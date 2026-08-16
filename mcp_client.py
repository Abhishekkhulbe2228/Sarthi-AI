import os
import sys
from pathlib import Path

import certifi
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_groq import ChatGroq

# ==========================================
# Environment configuration
# ==========================================

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
AVIATION_STACK_API_KEY = os.getenv("AVIATION_STACK_API_KEY")

client = MultiServerMCPClient(
    {
       "tavily": {
            "transport": "streamable_http",
            "url": (
                "https://mcp.tavily.com/mcp/"
                f"?tavilyApiKey={TAVILY_API_KEY}"
            )
        },

        "aviationstack": {
            "transport": "stdio",
            "command": "uvx",
            "args": [
                "--with", "mcp>=1.10.1,<1.28",
                "aviationstack-mcp"
            ],
            "env": {"AVIATION_STACK_API_KEY": AVIATION_STACK_API_KEY}
        },
    }
)

#check if the client is conected to all the servers

async def get_all_tools():
    tools = await client.get_tools()
    print("\nAvailable MCP Tools:\n")

    for tool in tools:
        print(tool.name)



##############################
# Tavily and Aviation tool
##############################


search_tool = None
aviation_tools = {}

async def initialize_mcp():

    global search_tool
    global aviation_tools

    if search_tool is not None and aviation_tools:
        return
    
    tools = await client.get_tools()

    print("\nAvailabe MCP Tools:\n")

    for tool in tools:
        print(tool.name)

        
    search_tool = next(
        tool
        for tool in tools
        if tool.name == "tavily_search"
    )

    aviation_tools = { 
        tool.name: tool
        for tool in tools
        if tool.name != "tavily_search"
    }

async def tavily_search(query: str):
    await initialize_mcp()
    result = await search_tool.ainvoke(
        {
            "query": query
        }
    )
    return result

async def tavily_mcp_search(query: str):
    await initialize_mcp()
    result = await search_tool.ainvoke(
        {
            "query": query
        }
    )
    return result

async def aviation_mcp_call( 
    tool_name: str,
    tools_args: dict = None
):
    tools = await client.get_tools()
    
    tool = next(
        t for t in tools
        if t.name == tool_name
    )

    result = await tool.ainvoke(tools_args or {})

    
    return result


