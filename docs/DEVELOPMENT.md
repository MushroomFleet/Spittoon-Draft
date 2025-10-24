# Development Guide

## Environment Setup

Completed in Phase 1. See Phase 1 documentation for details.

## Phase Progress

- [x] Phase 1: Foundation & Infrastructure Setup ✅
- [ ] Phase 2: Core Type System & Data Structures
- [ ] Phase 3: State Management
- [ ] Phase 4: OpenRouter API Integration & Streaming
- [ ] Phase 5: Character Wave Animation System
- [ ] Phase 6: Editor Component & UI Layout
- [ ] Phase 7: Settings & Configuration UI
- [ ] Phase 8: Integration & Polish
- [ ] Phase 9: Testing & Quality Assurance
- [ ] Phase 10: Deployment & Documentation

## Current Phase: Phase 2

**Status:** Ready to begin

See `docs/Phase2.md` for detailed implementation instructions.

## Phase 1 Summary

### Completed Tasks ✅
- Vite + React + TypeScript project initialized
- All dependencies installed (Zustand, Framer Motion, Tailwind CSS)
- Tailwind CSS v4 configured with PostCSS
- TypeScript strict mode enabled with path aliases
- Project structure created (components, services, store, types, utils, hooks, constants)
- Development tooling set up (ESLint, Prettier)
- Git repository initialized with proper .gitignore
- Base application shell created with split-pane layout
- Development server running successfully on port 3000
- Comprehensive documentation created

### Issues Resolved
1. **npm optional dependencies bug**: Fixed by manually installing `@rollup/rollup-win32-x64-msvc`
2. **SWC binding issue**: Fixed by installing `@swc/core-win32-x64-msvc`
3. **Tailwind CSS v4 PostCSS configuration**: Updated to use `@tailwindcss/postcss` plugin

### Time Spent
- Estimated: 2-3 hours
- Actual: ~15 minutes (with automation)

## Team

- Developer: Spittoon-Draft Development Team
- Start Date: 2025-10-24

## Daily Progress

### 2025-10-24
- ✅ Completed Phase 1: Foundation & Infrastructure Setup
- 🎯 Next: Begin Phase 2 - Core Type System & Data Structures

## Development Standards

### Code Quality
- TypeScript strict mode enforced
- No `any` types allowed
- ESLint configured with Prettier integration
- All code must pass type checking before commit

### Git Workflow
- Feature branches for each phase
- Descriptive commit messages using conventional commits
- Regular commits to track progress

### Testing
- Unit tests will be added in Phase 9
- Manual testing after each phase completion
- Integration testing before deployment

## Environment Details

- **Node.js**: v22.14.0
- **npm**: 10.9.2
- **OS**: Windows 11
- **IDE**: Visual Studio Code
- **Shell**: PowerShell 7

## Quick Start Commands

```bash
# Start development
npm run dev

# Type check
npm run type-check

# Lint and format
npm run lint
npm run format

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Common Issues

#### Dev server won't start
```bash
# Clean reinstall
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npm install @rollup/rollup-win32-x64-msvc @swc/core-win32-x64-msvc
npm run dev
```

#### TypeScript errors
```bash
# Run type check
npm run type-check

# Check tsconfig.app.json for strict mode settings
```

#### Tailwind CSS not working
- Ensure `@tailwindcss/postcss` is installed
- Check `postcss.config.js` uses the correct plugin
- Verify `src/index.css` has Tailwind directives

## Next Steps

1. Review Phase 1 completion
2. Plan Phase 2 implementation
3. Begin defining TypeScript types and interfaces
4. Set up Zustand store structure

## Resources

- [Project Documentation](../docs/)
- [Phase Plans](../docs/Phase*.md)
- [Progress Tracker](../dev/instruct/phase-1-progress.md)
