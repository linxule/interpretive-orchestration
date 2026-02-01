#!/usr/bin/env node
/**
 * validate-config.js
 * Validates configuration against the JSON schema using Ajv
 *
 * Usage:
 *   node validate-config.js --project-path /path/to/project
 *   node validate-config.js --config '{"project_info": {...}}'
 *
 * Returns:
 *   {
 *     "valid": true/false,
 *     "errors": [...] // if invalid
 *   }
 *
 * Can also be required as a module:
 *   const { validateConfig, loadSchema } = require('./validate-config.js');
 */

const fs = require('fs');
const path = require('path');

// Schema path relative to this script
const SCHEMA_PATH = path.join(__dirname, '../../project-setup/templates/config.schema.json');

function loadSchema() {
  if (!fs.existsSync(SCHEMA_PATH)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  } catch (error) {
    return null;
  }
}

/**
 * Simple JSON Schema validator (no external dependencies)
 * Validates basic structure, required fields, enums, and types
 */
function validateAgainstSchema(config, schema, path = '') {
  const errors = [];

  if (!schema || typeof schema !== 'object') {
    return errors;
  }

  // Check type
  if (schema.type) {
    const actualType = Array.isArray(config) ? 'array' : typeof config;
    const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];

    if (config === null && expectedTypes.includes('null')) {
      // null is valid
    } else if (!expectedTypes.includes(actualType)) {
      errors.push({
        path: path || 'root',
        message: `Expected type ${expectedTypes.join(' or ')}, got ${actualType}`,
        keyword: 'type'
      });
      return errors; // Type mismatch, can't validate further
    }
  }

  // Check enum
  if (schema.enum && !schema.enum.includes(config)) {
    errors.push({
      path: path || 'root',
      message: `Value must be one of: ${schema.enum.join(', ')}`,
      keyword: 'enum',
      allowedValues: schema.enum,
      actualValue: config
    });
  }

  // Check const
  if (schema.const !== undefined && config !== schema.const) {
    errors.push({
      path: path || 'root',
      message: `Value must be: ${schema.const}`,
      keyword: 'const'
    });
  }

  // Check minimum (for numbers)
  if (schema.minimum !== undefined && typeof config === 'number') {
    if (config < schema.minimum) {
      errors.push({
        path: path || 'root',
        message: `Value must be >= ${schema.minimum}`,
        keyword: 'minimum'
      });
    }
  }

  // Check required properties
  if (schema.type === 'object' && schema.required && typeof config === 'object' && config !== null) {
    for (const reqProp of schema.required) {
      if (config[reqProp] === undefined) {
        errors.push({
          path: path ? `${path}.${reqProp}` : reqProp,
          message: `Missing required property: ${reqProp}`,
          keyword: 'required'
        });
      }
    }
  }

  // Validate object properties
  if (schema.type === 'object' && schema.properties && typeof config === 'object' && config !== null) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      if (config[propName] !== undefined) {
        const propPath = path ? `${path}.${propName}` : propName;
        const propErrors = validateAgainstSchema(config[propName], propSchema, propPath);
        errors.push(...propErrors);
      }
    }
  }

  // Validate array items
  if (schema.type === 'array' && schema.items && Array.isArray(config)) {
    for (let i = 0; i < config.length; i++) {
      const itemPath = `${path}[${i}]`;
      const itemErrors = validateAgainstSchema(config[i], schema.items, itemPath);
      errors.push(...itemErrors);
    }
  }

  return errors;
}

function validateConfig(config, schema = null) {
  if (!schema) {
    schema = loadSchema();
  }

  if (!schema) {
    return {
      valid: true,
      warning: 'Schema not found - validation skipped',
      schemaPath: SCHEMA_PATH
    };
  }

  const errors = validateAgainstSchema(config, schema);

  if (errors.length === 0) {
    return {
      valid: true,
      message: 'Configuration is valid'
    };
  }

  return {
    valid: false,
    errors: errors,
    errorCount: errors.length,
    message: `Configuration has ${errors.length} validation error(s)`
  };
}

function readConfig(projectPath) {
  const configPath = path.join(projectPath, '.interpretive-orchestration', 'config.json');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    return { parseError: error.message };
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace('--', '');
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        parsed[key] = nextArg;
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }

  return parsed;
}

// Export for use as module
module.exports = { validateConfig, loadSchema, validateAgainstSchema };

// Main execution (only when run directly)
if (require.main === module) {
  const args = parseArgs();

  let config;

  if (args['project-path']) {
    // Path traversal protection
    const resolvedPath = path.resolve(args['project-path']);
    const configTarget = path.join(resolvedPath, '.interpretive-orchestration', 'config.json');
    if (!configTarget.startsWith(resolvedPath + path.sep) && configTarget !== resolvedPath) {
      console.error(JSON.stringify({
        success: false,
        error: 'Path traversal detected - invalid project path'
      }));
      process.exit(1);
    }

    config = readConfig(resolvedPath);
    if (!config) {
      console.error(JSON.stringify({
        success: false,
        error: 'Config file not found',
        suggestion: 'Run /qual-init to create a project'
      }));
      process.exit(1);
    }
    if (config.parseError) {
      console.error(JSON.stringify({
        success: false,
        error: `Failed to parse config: ${config.parseError}`
      }));
      process.exit(1);
    }
  } else if (args.config) {
    try {
      config = JSON.parse(args.config);
    } catch (error) {
      console.error(JSON.stringify({
        success: false,
        error: `Failed to parse config JSON: ${error.message}`
      }));
      process.exit(1);
    }
  } else {
    console.error(JSON.stringify({
      success: false,
      error: 'Missing required argument: --project-path or --config'
    }));
    process.exit(1);
  }

  const result = validateConfig(config);
  console.log(JSON.stringify({
    success: true,
    ...result
  }, null, 2));

  process.exit(result.valid ? 0 : 1);
}
