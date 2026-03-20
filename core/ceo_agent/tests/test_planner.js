const Planner = require('../planner');

describe('Planner', () => {
  let planner;

  beforeEach(() => {
    planner = new Planner();
  });

  test('should create a plan with goals and constraints', async () => {
    const goals = [
      { type: 'market_expansion', description: 'Expand to Europe' },
    ];
    const constraints = { budget: 100000, timeline: '6 months' };

    const plan = await planner.createPlan(goals, constraints);

    expect(plan).toBeDefined();
    expect(plan.id).toBeDefined();
    expect(plan.goals).toEqual(goals);
    expect(plan.constraints).toEqual(constraints);
    expect(plan.status).toBe('created');
  });

  test('should breakdown tasks for market expansion goal', async () => {
    const strategy = {
      id: 'test_strategy',
      goals: [{ type: 'market_expansion', description: 'Expand to Europe' }],
      constraints: {},
    };

    const tasks = await planner.breakdownTasks(strategy);

    expect(tasks).toBeDefined();
    expect(tasks.length).toBe(3);
    expect(tasks[0].name).toBe('Market entry strategy');
    expect(tasks[1].name).toBe('Competitor analysis');
    expect(tasks[2].name).toBe('Market research');
  });

  test('should breakdown tasks for product development goal', async () => {
    const strategy = {
      id: 'test_strategy',
      goals: [{ type: 'product_development', description: 'New AI feature' }],
      constraints: {},
    };

    const tasks = await planner.breakdownTasks(strategy);

    expect(tasks).toBeDefined();
    expect(tasks.length).toBe(4);
    expect(tasks[0].name).toBe('Testing phase');
    expect(tasks[1].name).toBe('Development phase');
    expect(tasks[2].name).toBe('Design phase');
    expect(tasks[3].name).toBe('Requirements gathering');
  });

  test('should generate timeline for tasks', async () => {
    const tasks = [
      { id: 'task_1', name: 'Market research', estimated_duration: 7 },
      {
        id: 'task_2',
        name: 'Competitor analysis',
        estimated_duration: 5,
        dependencies: ['task_1'],
      },
    ];

    const timeline = await planner.generateTimeline(tasks);

    expect(timeline).toBeDefined();
    expect(timeline.start_date).toBeDefined();
    expect(timeline.end_date).toBeDefined();
    expect(timeline.tasks).toHaveLength(2);
  });

  test('should update task status', async () => {
    const taskId = 'task_1';
    const status = 'in_progress';

    const result = await planner.updateTaskStatus(taskId, status);

    expect(result).toBeDefined();
    expect(result.taskId).toBe(taskId);
    expect(result.status).toBe(status);
    expect(result.updated_at).toBeDefined();
  });
});
