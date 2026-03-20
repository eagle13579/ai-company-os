const DecisionEngine = require('../decision_engine');

describe('DecisionEngine', () => {
  let decisionEngine;

  beforeEach(() => {
    decisionEngine = new DecisionEngine();
  });

  test('should allocate resources to tasks', async () => {
    const tasks = [
      { id: 'task_1', name: 'Market research', priority: 3 },
      { id: 'task_2', name: 'Competitor analysis', priority: 2 },
    ];
    const resources = [
      {
        id: 'resource_1',
        name: 'Researcher',
        type: 'human',
        skills: ['research', 'analysis'],
        capacity: 2,
      },
      {
        id: 'resource_2',
        name: 'Analyst',
        type: 'human',
        skills: ['analysis', 'market'],
        capacity: 1,
      },
    ];

    const allocation = await decisionEngine.allocateResources(tasks, resources);

    expect(allocation).toBeDefined();
    expect(allocation.id).toBeDefined();
    expect(allocation.tasks).toBeDefined();
    expect(allocation.resources).toBeDefined();
  });

  test('should make a decision based on criteria', async () => {
    const decisionContext = {
      options: [
        { name: 'Option 1', cost: 10, benefit: 20, risk: 5 },
        { name: 'Option 2', cost: 15, benefit: 25, risk: 3 },
      ],
      criteria: { cost: 0.3, benefit: 0.5, risk: 0.2 },
    };

    const decision = await decisionEngine.makeDecision(decisionContext);

    expect(decision).toBeDefined();
    expect(decision.decision).toBeDefined();
    expect(decision.alternatives).toBeDefined();
    expect(decision.reasoning).toBeDefined();
  });

  test('should resolve resource conflicts', async () => {
    const conflicts = [
      {
        type: 'resource_conflict',
        resources: [
          { id: 'resource_1', name: 'Researcher', capacity: 1 },
          { id: 'resource_2', name: 'Analyst', capacity: 1 },
        ],
        tasks: [
          { id: 'task_1', name: 'Market research', priority: 3 },
          { id: 'task_2', name: 'Competitor analysis', priority: 2 },
        ],
      },
    ];

    const resolution = await decisionEngine.resolveConflict(conflicts);

    expect(resolution).toBeDefined();
    expect(resolution.conflicts).toEqual(conflicts);
    expect(resolution.resolutions).toBeDefined();
  });

  test('should optimize resource usage', async () => {
    const resources = [
      {
        id: 'resource_1',
        name: 'Researcher',
        type: 'human',
        skills: ['research'],
        capacity: 5,
      },
      {
        id: 'resource_2',
        name: 'Analyst',
        type: 'human',
        skills: ['analysis'],
        capacity: 3,
      },
    ];
    const tasks = [
      { id: 'task_1', name: 'Market research', priority: 3 },
      { id: 'task_2', name: 'Competitor analysis', priority: 2 },
    ];

    const optimization = await decisionEngine.optimizeResourceUsage(
      resources,
      tasks
    );

    expect(optimization).toBeDefined();
    expect(optimization.id).toBeDefined();
    expect(optimization.resources).toBeDefined();
    expect(optimization.savings).toBeDefined();
  });
});
