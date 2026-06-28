/**
 * Typed error classes for plugin development.
 */

export class PluginError extends Error {
  constructor(message: string, public pluginName?: string) {
    super(pluginName ? `[${pluginName}] ${message}` : `[Plugin] ${message}`);
    this.name = "PluginError";
  }
}

export class PluginRegistrationError extends PluginError {
  constructor(pluginName: string, reason: string) {
    super(`Failed to register "${pluginName}": ${reason}`, pluginName);
    this.name = "PluginRegistrationError";
  }
}

export class PluginDependencyError extends PluginError {
  constructor(pluginName: string, dependency: string) {
    super(
      `Plugin "${pluginName}" requires "${dependency}" which is not enabled`,
      pluginName
    );
    this.name = "PluginDependencyError";
  }
}
