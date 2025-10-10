# API Contracts: Life Milestone Photo Generation

**Feature**: 002-12-18-ai
**Date**: 2025-10-08

## Overview

This directory contains API contracts for the Life Milestone Photo Generation system. Since this is a desktop application using localStorage and JSON configuration files, these "contracts" define the TypeScript function signatures and data flows rather than REST/GraphQL APIs.

## Configuration Loading Contracts

### `loadMilestoneConfig(): Promise<MilestoneConfig>`
Loads milestone configuration from JSON file.

**Returns**: Complete milestone configuration with all categories and milestones
**Throws**: `ConfigValidationError` if schema validation fails

### `loadStyleConfig(): Promise<StyleConfig>`
Loads style configuration from JSON file.

**Returns**: Complete style configuration with all active styles
**Throws**: `ConfigValidationError` if schema validation fails

## Data Access Contracts

### `getMilestoneById(id: string): Promise<Milestone>`
Retrieves a specific milestone by ID.

**Parameters**:
- `id`: Milestone identifier (e.g., "wedding")

**Returns**: Milestone object
**Throws**: `NotFoundError` if milestone doesn't exist

### `getStylesByIds(ids: string[]): Promise<Style[]>`
Retrieves multiple styles by their IDs.

**Parameters**:
- `ids`: Array of style identifiers

**Returns**: Array of Style objects (filters out invalid IDs)

### `getCompatibleStyles(milestoneId: string): Promise<Style[]>`
Gets all styles compatible with a specific milestone.

**Parameters**:
- `milestoneId`: Milestone identifier

**Returns**: Array of compatible Style objects

## Task Management Contracts

### `createTask(params: CreateTaskParams): Promise<GenerationTask>`
Creates a new generation task.

**Parameters**:
```typescript
interface CreateTaskParams {
  milestoneId: string
  photoIds: string[]
  mode: 'auto' | 'manual'
  styleIds?: string[]  // Required if mode is 'manual'
}
```

**Returns**: Created GenerationTask
**Throws**: `ValidationError` if parameters are invalid

### `updateTaskStatus(taskId: string, status: TaskStatus): Promise<void>`
Updates task status.

**Parameters**:
- `taskId`: Task UUID
- `status`: New status value

**Throws**: `NotFoundError` if task doesn't exist

### `addTaskResult(taskId: string, result: GenerationResult): Promise<void>`
Adds a generated image result to a task.

**Parameters**:
- `taskId`: Task UUID
- `result`: Generated image data

**Throws**: `NotFoundError` if task doesn't exist

## Image Generation Contracts

### `generateMultiStyle(params: MultiStyleParams): Promise<GenerationResult[]>`
Generates images in multiple styles sequentially.

**Parameters**:
```typescript
interface MultiStyleParams {
  photoPath: string
  styles: Style[]
  onProgress: (current: number, total: number, styleName: string) => void
  onStyleComplete: (styleId: string, results: GenerationResult[]) => void
  onStyleFailed: (styleId: string, error: Error) => void
}
```

**Returns**: Array of all successfully generated results
**Note**: Continues even if individual styles fail

## Storage Contracts

### `savePhoto(file: File, path: string): Promise<UploadedPhoto>`
Saves an uploaded photo and creates metadata.

**Parameters**:
- `file`: File object from input
- `path`: Local file path (Tauri)

**Returns**: UploadedPhoto metadata
**Throws**: `FileSystemError` if save fails

### `exportImage(dataUrl: string, filename: string): Promise<string>`
Exports a generated image to user's chosen location.

**Parameters**:
- `dataUrl`: Base64 data URL
- `filename`: Suggested filename

**Returns**: Path where file was saved
**Throws**: `FileSystemError` if export fails

## Error Types

```typescript
class ConfigValidationError extends Error {
  constructor(public errors: ZodError)
}

class NotFoundError extends Error {
  constructor(public entityType: string, public id: string)
}

class ValidationError extends Error {
  constructor(public field: string, public message: string)
}

class FileSystemError extends Error {
  constructor(public operation: string, public path: string, public cause: Error)
}

class GenerationError extends Error {
  constructor(public styleId: string, public cause: Error)
}
```

## Implementation Files

- `src/lib/configLoader.ts` - Configuration loading functions
- `src/lib/milestoneService.ts` - Milestone data access
- `src/lib/styleService.ts` - Style data access
- `src/lib/taskService.ts` - Task management
- `src/lib/multiStyleGenerator.ts` - Multi-style generation orchestration
- `src/lib/storageService.ts` - File system operations
