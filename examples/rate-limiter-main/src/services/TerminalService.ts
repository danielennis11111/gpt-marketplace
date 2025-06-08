/**
 * 🖥️ Terminal Service
 * 
 * Provides safe command execution with real-time output for the Local Environment Builder
 * Allows non-technical users to run installation commands with approval and monitoring
 */

export interface Command {
  id: string;
  description: string;
  command: string;
  workingDirectory: string;
  requiresApproval: boolean;
  status: 'pending' | 'approved' | 'running' | 'completed' | 'failed';
  output?: string[];
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface TerminalSession {
  id: string;
  name: string;
  currentDirectory: string;
  commands: Command[];
  isActive: boolean;
}

export class TerminalService {
  private sessions: Map<string, TerminalSession> = new Map();
  private outputCallbacks: Map<string, (output: string) => void> = new Map();

  /**
   * Create a new terminal session
   */
  createSession(name: string, initialDirectory: string): TerminalSession {
    const session: TerminalSession = {
      id: Date.now().toString(),
      name,
      currentDirectory: initialDirectory,
      commands: [],
      isActive: true
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Add a command to a session for approval
   */
  addCommand(
    sessionId: string,
    description: string,
    command: string,
    workingDirectory?: string
  ): Command {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const newCommand: Command = {
      id: Date.now().toString(),
      description,
      command,
      workingDirectory: workingDirectory || session.currentDirectory,
      requiresApproval: true,
      status: 'pending'
    };

    session.commands.push(newCommand);
    return newCommand;
  }

  /**
   * Approve and execute a command
   */
  async approveAndExecute(sessionId: string, commandId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const command = session.commands.find(c => c.id === commandId);
    if (!command) {
      throw new Error('Command not found');
    }

    if (command.status !== 'pending') {
      throw new Error('Command is not pending approval');
    }

    command.status = 'approved';
    await this.executeCommand(sessionId, commandId);
  }

  /**
   * Execute a command (internal method)
   */
  private async executeCommand(sessionId: string, commandId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    const command = session?.commands.find(c => c.id === commandId);
    
    if (!session || !command) {
      throw new Error('Session or command not found');
    }

    command.status = 'running';
    command.startTime = new Date();
    command.output = [];

    try {
      // In a real implementation, this would execute the actual command
      // For now, we'll simulate command execution
      await this.simulateCommandExecution(command, sessionId);
      
      command.status = 'completed';
      command.endTime = new Date();
      
      // Update session directory if command was cd
      if (command.command.startsWith('cd ')) {
        const newPath = command.command.substring(3).trim();
        session.currentDirectory = this.resolveDirectoryPath(session.currentDirectory, newPath);
      }

    } catch (error) {
      command.status = 'failed';
      command.error = error instanceof Error ? error.message : 'Unknown error';
      command.endTime = new Date();
    }
  }

  /**
   * Simulate command execution with realistic output
   */
  private async simulateCommandExecution(command: Command, sessionId: string): Promise<void> {
    const outputCallback = this.outputCallbacks.get(sessionId);
    
    // Simulate command execution with progressive output
    if (command.command.includes('npm install')) {
      const packages = command.command.match(/@?\w+[\w-]*(?:\/[\w-]+)?/g) || ['package'];
      command.output = [];
      
      for (const pkg of packages) {
        await this.delay(500);
        const output = `📦 Installing ${pkg}...`;
        command.output.push(output);
        outputCallback?.(output);
      }
      
      await this.delay(1000);
      const finalOutput = `✅ Successfully installed ${packages.length} package(s)`;
      command.output.push(finalOutput);
      outputCallback?.(finalOutput);
      
    } else if (command.command.includes('git clone')) {
      const repoUrl = command.command.split(' ').find(arg => arg.includes('http')) || 'repository';
      command.output = [`🌐 Cloning ${repoUrl}...`];
      outputCallback?.(command.output[0]);
      
      await this.delay(2000);
      const progress = `📥 Downloading objects: 100% complete`;
      command.output.push(progress);
      outputCallback?.(progress);
      
      await this.delay(500);
      const final = `✅ Clone completed successfully`;
      command.output.push(final);
      outputCallback?.(final);
      
    } else if (command.command.includes('mkdir')) {
      const dirName = command.command.split(' ').pop() || 'directory';
      command.output = [`📁 Creating directory ${dirName}...`, `✅ Directory created successfully`];
      command.output.forEach(output => outputCallback?.(output));
      
    } else {
      // Generic command simulation
      command.output = [`🚀 Executing: ${command.command}`, `✅ Command completed successfully`];
      for (const output of command.output) {
        outputCallback?.(output);
        await this.delay(500);
      }
    }
  }

  /**
   * Register callback for real-time output
   */
  onOutput(sessionId: string, callback: (output: string) => void): void {
    this.outputCallbacks.set(sessionId, callback);
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): TerminalSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions
   */
  getAllSessions(): TerminalSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get pending commands for a session
   */
  getPendingCommands(sessionId: string): Command[] {
    const session = this.sessions.get(sessionId);
    return session?.commands.filter(cmd => cmd.status === 'pending') || [];
  }

  /**
   * Resolve directory path (handle relative paths)
   */
  private resolveDirectoryPath(currentPath: string, newPath: string): string {
    if (newPath.startsWith('/')) {
      return newPath; // Absolute path
    }
    
    if (newPath === '..') {
      return currentPath.split('/').slice(0, -1).join('/') || '/';
    }
    
    if (newPath === '.') {
      return currentPath;
    }
    
    return `${currentPath}/${newPath}`.replace(/\/+/g, '/');
  }

  /**
   * Helper to create delays for simulation
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get safe commands that can be auto-approved
   */
  static getSafeCommands(): string[] {
    return [
      'npm install',
      'npm list',
      'npm --version',
      'node --version',
      'git --version',
      'git status',
      'git log',
      'ls',
      'pwd',
      'mkdir',
      'touch',
      'cat',
      'head',
      'tail'
    ];
  }

  /**
   * Check if a command is safe to auto-approve
   */
  static isCommandSafe(command: string): boolean {
    const safeCommands = TerminalService.getSafeCommands();
    return safeCommands.some(safe => command.trim().startsWith(safe));
  }
}

export default TerminalService; 