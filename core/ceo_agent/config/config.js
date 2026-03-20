module.exports = {
  taskTypes: {
    market_expansion: {
      tasks: [
        {
          name: 'Market research',
          description: 'Research target markets',
          priority: 1,
        },
        {
          name: 'Competitor analysis',
          description: 'Analyze competitors in target markets',
          priority: 2,
        },
        {
          name: 'Market entry strategy',
          description: 'Develop market entry plan',
          priority: 3,
        },
      ],
    },
    product_development: {
      tasks: [
        {
          name: 'Requirements gathering',
          description: 'Collect product requirements',
          priority: 1,
        },
        {
          name: 'Design phase',
          description: 'Design product features',
          priority: 2,
        },
        {
          name: 'Development phase',
          description: 'Develop product features',
          priority: 3,
        },
        {
          name: 'Testing phase',
          description: 'Test product functionality',
          priority: 4,
        },
      ],
    },
    operational_efficiency: {
      tasks: [
        {
          name: 'Process audit',
          description: 'Audit current processes',
          priority: 1,
        },
        {
          name: 'Efficiency analysis',
          description: 'Analyze process inefficiencies',
          priority: 2,
        },
        {
          name: 'Process optimization',
          description: 'Optimize identified processes',
          priority: 3,
        },
      ],
    },
  },
  taskDurations: {
    'Market research': 7,
    'Competitor analysis': 5,
    'Market entry strategy': 3,
    'Requirements gathering': 5,
    'Design phase': 7,
    'Development phase': 14,
    'Testing phase': 7,
    'Process audit': 5,
    'Efficiency analysis': 3,
    'Process optimization': 7,
  },
  taskSkills: {
    'Market research': ['research', 'analysis'],
    'Competitor analysis': ['analysis', 'market'],
    'Market entry strategy': ['strategy', 'planning'],
    'Requirements gathering': ['requirements', 'communication'],
    'Design phase': ['design', 'creativity'],
    'Development phase': ['development', 'coding'],
    'Testing phase': ['testing', 'quality'],
    'Process audit': ['audit', 'analysis'],
    'Efficiency analysis': ['analysis', 'process'],
    'Process optimization': ['optimization', 'process'],
  },
  taskResourceRequirements: {
    'Market research': 2,
    'Competitor analysis': 1,
    'Market entry strategy': 1,
    'Requirements gathering': 2,
    'Design phase': 3,
    'Development phase': 4,
    'Testing phase': 2,
    'Process audit': 2,
    'Efficiency analysis': 1,
    'Process optimization': 2,
  },
  errorTypes: {
    resource: 'resource_error',
    timeout: 'timeout_error',
    permission: 'permission_error',
    general: 'general_error',
  },
  taskTypeMap: {
    'Market research': 'research',
    'Competitor analysis': 'analysis',
    'Market entry strategy': 'strategy',
    'Requirements gathering': 'requirements',
    'Design phase': 'design',
    'Development phase': 'development',
    'Testing phase': 'testing',
    'Process audit': 'audit',
    'Efficiency analysis': 'analysis',
    'Process optimization': 'optimization',
  },
  thresholds: {
    successRate: {
      low: 70,
      high: 90,
    },
    resourceEfficiency: {
      low: 30,
    },
    taskLimit: 20,
  },
  defaults: {
    taskDuration: 2,
    resourceCount: 1,
    actionDueDays: 14,
  },
};
