type Task = { title: string; task: () => unknown | Promise<unknown> };

export class MockListr {
  static lastTasks: Task[] | null = null;
  private tasks: Task[];
  constructor(tasks: Task[]) {
    MockListr.lastTasks = tasks;
    this.tasks = tasks;
  }
  async run() {
    for (const t of this.tasks) {
      await t.task();
    }
  }
}
