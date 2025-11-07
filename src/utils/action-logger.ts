import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger.js';

interface ActionLog {
  timestamp: string;
  type: 'user_message' | 'assistant_response' | 'tool_use' | 'tool_result' | 'error';
  data: any;
}

interface LogSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  actions: ActionLog[];
}

// Configuration constants
const LOGGING_ENABLED = true; // Always enabled for agent observability
const MAX_FILE_SIZE_MB = 10;
const MAX_AGE_DAYS = 7;

export class ActionLogger {
  private logFilePath: string;
  private currentSession: LogSession | null = null;
  private enabled: boolean;
  private maxFileSizeMB: number;
  private maxAgeDays: number;

  constructor() {
    this.logFilePath = path.join(process.cwd(), 'log.json');
    this.enabled = LOGGING_ENABLED;
    this.maxFileSizeMB = MAX_FILE_SIZE_MB;
    this.maxAgeDays = MAX_AGE_DAYS;
  }

  async startSession(): Promise<void> {
    if (!this.enabled) return;

    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: new Date().toISOString(),
      actions: [],
    };

    await this.checkAndCleanup();
  }

  async endSession(): Promise<void> {
    if (!this.enabled || !this.currentSession) return;

    this.currentSession.endTime = new Date().toISOString();
    await this.writeSession();
    this.currentSession = null;
  }

  logUserMessage(message: string): void {
    if (!this.enabled || !this.currentSession) return;

    this.currentSession.actions.push({
      timestamp: new Date().toISOString(),
      type: 'user_message',
      data: { message },
    });
  }

  logAssistantResponse(content: any): void {
    if (!this.enabled || !this.currentSession) return;

    this.currentSession.actions.push({
      timestamp: new Date().toISOString(),
      type: 'assistant_response',
      data: { content },
    });
  }

  logToolUse(toolName: string, input: any): void {
    if (!this.enabled || !this.currentSession) return;

    this.currentSession.actions.push({
      timestamp: new Date().toISOString(),
      type: 'tool_use',
      data: {
        toolName,
        input,
      },
    });
  }

  logToolResult(toolName: string, result: any, success: boolean): void {
    if (!this.enabled || !this.currentSession) return;

    this.currentSession.actions.push({
      timestamp: new Date().toISOString(),
      type: 'tool_result',
      data: {
        toolName,
        result,
        success,
      },
    });
  }

  logError(error: Error, context?: string): void {
    if (!this.enabled || !this.currentSession) return;

    this.currentSession.actions.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      data: {
        message: error.message,
        stack: error.stack,
        context,
      },
    });
  }

  private async writeSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      let existingData: LogSession[] = [];

      try {
        const fileContent = await fs.readFile(this.logFilePath, 'utf-8');
        existingData = JSON.parse(fileContent);
        if (!Array.isArray(existingData)) {
          existingData = [];
        }
      } catch (error) {
        // File doesn't exist or is invalid, start fresh
        existingData = [];
      }

      existingData.push(this.currentSession);

      await fs.writeFile(
        this.logFilePath,
        JSON.stringify(existingData, null, 2),
        'utf-8'
      );

      logger.debug(`Action log written to ${this.logFilePath}`);
    } catch (error) {
      logger.error(error as Error, 'Failed to write action log');
    }
  }

  private async checkAndCleanup(): Promise<void> {
    try {
      const stats = await fs.stat(this.logFilePath);
      const fileSizeMB = stats.size / (1024 * 1024);
      const fileAgeDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);

      if (fileSizeMB > this.maxFileSizeMB) {
        logger.info(`Log file exceeds ${this.maxFileSizeMB}MB, cleaning up...`);
        await this.cleanupBySize();
      } else if (fileAgeDays > this.maxAgeDays) {
        logger.info(`Log file older than ${this.maxAgeDays} days, cleaning up...`);
        await this.cleanupByAge();
      }
    } catch (error) {
      // File doesn't exist, no cleanup needed
    }
  }

  private async cleanupBySize(): Promise<void> {
    try {
      const fileContent = await fs.readFile(this.logFilePath, 'utf-8');
      const sessions: LogSession[] = JSON.parse(fileContent);

      // Keep only the most recent 50% of sessions
      const keepCount = Math.ceil(sessions.length / 2);
      const recentSessions = sessions.slice(-keepCount);

      await fs.writeFile(
        this.logFilePath,
        JSON.stringify(recentSessions, null, 2),
        'utf-8'
      );

      logger.info(`Cleaned up log file, kept ${keepCount} most recent sessions`);
    } catch (error) {
      logger.error(error as Error, 'Failed to cleanup log by size');
    }
  }

  private async cleanupByAge(): Promise<void> {
    try {
      const fileContent = await fs.readFile(this.logFilePath, 'utf-8');
      const sessions: LogSession[] = JSON.parse(fileContent);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.maxAgeDays);

      const recentSessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate > cutoffDate;
      });

      if (recentSessions.length === 0) {
        // Delete the file if all sessions are old
        await fs.unlink(this.logFilePath);
        logger.info('Deleted old log file');
      } else {
        await fs.writeFile(
          this.logFilePath,
          JSON.stringify(recentSessions, null, 2),
          'utf-8'
        );
        logger.info(`Cleaned up log file, kept ${recentSessions.length} recent sessions`);
      }
    } catch (error) {
      logger.error(error as Error, 'Failed to cleanup log by age');
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  async forceCleanup(): Promise<void> {
    try {
      await fs.unlink(this.logFilePath);
      logger.info('Log file deleted');
    } catch (error) {
      logger.debug('No log file to delete');
    }
  }
}

export const actionLogger = new ActionLogger();
