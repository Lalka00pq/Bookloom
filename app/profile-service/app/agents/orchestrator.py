from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from app.agents.embedding_agent import embedding_node

# Define our State
class AgentState(TypedDict, total=False):
    # Action passed as input to route correctly
    action: str
    
    # State modified by the embedding agent
    embedding_status: Optional[str]
    processed_count: Optional[int]
    error_message: Optional[str]

def route_action(state: AgentState) -> str:
    """Routes to the correct agent based on the input action."""
    action = state.get("action")
    if action == "sync_embeddings":
        return "embedding_agent"
    
    # Future agents can be routed here
    return END

def create_orchestrator_graph() -> StateGraph:
    """Creates the main orchestrator graph linking multiple agents together."""
     
    builder = StateGraph(AgentState)
    
    # Add nodes (Agents)
    builder.add_node("embedding_agent", embedding_node)
    
    # Add conditional edges from the start
    builder.set_conditional_entry_point(
        route_action,
        {
            "embedding_agent": "embedding_agent",
            END: END
        }
    )
    
    # Currently the embedding agent just finishes after it runs
    builder.add_edge("embedding_agent", END)
    
    graph = builder.compile()
    return graph

# Expose a pre-compiled orchestrator instance
orchestrator = create_orchestrator_graph()
