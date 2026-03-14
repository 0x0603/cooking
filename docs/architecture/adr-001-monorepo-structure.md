# ADR-001: Monorepo Structure

## Status

Accepted

## Context

Need a way to organize the repository to:

- Manage multiple personal projects
- Learn and practice software architecture
- Reuse code and configurations
- Easily scale and maintain

## Decision

Use a monorepo structure with the following main directories:

- `projects/`: Contains all projects, categorized by type
- `infrastructure/`: Infrastructure as Code and DevOps configs
- `tools/`: Shared scripts and utilities
- `templates/`: Project templates for creating new projects
- `docs/`: Documentation and learnings
- `shared/`: Shared libraries and packages

## Consequences

### Advantages

- **Clear organization**: Easy to find and manage projects
- **Reusability**: Shared code and configs between projects
- **Learning**: Easy to compare and learn from different projects
- **Consistency**: Same structure and conventions
- **Version control**: One repo for everything, easy to track changes

### Disadvantages

- **Size**: Repo can grow large with many projects
- **CI/CD**: Requires more complex setup for monorepo
- **Dependencies**: Potential conflicts between projects

### Trade-offs

- Chose monorepo over multi-repo because:
  - Easier to manage for personal projects
  - No need for separate CI/CD per project
  - Easy to share code and learnings

## Alternatives Considered

1. **Multi-repo**: Each project in its own repo
   - Rejected: Hard to manage and share code

2. **Flat structure**: All projects at root level
   - Rejected: Hard to organize with many projects

3. **Technology-based structure**: Group by tech stack
   - Rejected: A single project may use multiple technologies
