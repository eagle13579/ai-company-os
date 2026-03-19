class AgentRouter {
  constructor() {
    this.agents = new Map();
    this.rules = [];
  }

  registerAgent(agentId, agent) {
    this.agents.set(agentId, agent);
  }

  registerRule(rule) {
    this.rules.push(rule);
  }

  async routeRequest(request) {
    try {
      const agentId = this.selectAgent(request);
      if (!agentId) {
        throw new Error('No suitable agent found for the request');
      }

      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      const response = await agent.execute(request);
      return {
        success: true,
        agentId,
        response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  selectAgent(request) {
    for (const rule of this.rules) {
      if (rule.matches(request)) {
        return rule.agentId;
      }
    }
    return null;
  }

  getAvailableAgents() {
    return Array.from(this.agents.keys());
  }

  getAgent(agentId) {
    return this.agents.get(agentId);
  }
}

class RouteRule {
  constructor(agentId, condition) {
    this.agentId = agentId;
    this.condition = condition;
  }

  matches(request) {
    return this.condition(request);
  }
}

module.exports = {
  AgentRouter,
  RouteRule
};