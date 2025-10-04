# Development Guide

## 🚀 Quick Start

### Start the Demo/Docs Site

From the **root directory**:

```bash
bun dev
```

This will start the Next.js docs site at **http://localhost:3000** (or 3001 if 3000 is busy)

### Build the Package

```bash
bun run build
```

This builds the `@hono-analytics/dashboard-hooks` package.

---

## 📂 Project Structure

```
hono-analytics/
├── packages/
│   └── dashboard-hooks/        # The main package
│       ├── src/                # Source code
│       ├── dist/               # Built output
│       └── package.json        # v0.12.0
│
├── apps/
│   └── docs/                   # Next.js demo site
│       ├── app/
│       │   ├── page.tsx       # Homepage
│       │   └── demo/
│       │       └── page.tsx   # Live interactive demo
│       └── package.json
│
└── package.json               # Root workspace config
```

---

## 🎮 Using the Demo

1. **Start dev server**: `bun dev` from root
2. **Open browser**: http://localhost:3000
3. **Click "Live Demo"** button
4. **Interact with demos**:
   - Toggle polling
   - Test refetch with loading states
   - Adjust cache settings
   - See request deduplication in Network tab

---

## 🔧 Development Workflow

### Making Changes to the Package

1. Edit files in `packages/dashboard-hooks/src/`
2. The docs site will **hot reload** automatically (via workspace link)
3. Test changes in the `/demo` page

### Building for Production

```bash
# Build just the package
bun run build

# Build everything
bun run build:all
```

---

## 📦 Publishing

### 1. Test Locally First

```bash
cd packages/dashboard-hooks
npm publish --dry-run
```

Review the output to see what will be published.

### 2. Publish to npm

```bash
cd packages/dashboard-hooks
npm publish --access public
```

---

## 🧪 Testing Checklist

Visit http://localhost:3000/demo and verify:

- [ ] **Section 1**: Metrics cards display (will show errors - that's expected without real API)
- [ ] **Section 2**: Two components show same data (deduplication)
- [ ] **Section 3**: Date validation error displays on button click
- [ ] **Section 4**: Polling can be started/stopped
- [ ] **Section 5**: Refetch button shows loading state
- [ ] **Section 6**: Cache toggle and TTL slider work

**Note**: Errors are expected because there's no real API endpoint. The purpose is to test the **hooks behavior**, not the data itself.

---

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is busy, Next.js will automatically try 3001, 3002, etc.

To use a specific port:
```bash
cd apps/docs
PORT=4000 bun run dev
```

### Package Not Found

If you get "Cannot find module '@hono-analytics/dashboard-hooks'":

```bash
# Reinstall from root
cd /home/remco-stoeten/sandbox/ana/hono-analytics
bun install
```

### Changes Not Reflecting

1. Rebuild the package:
   ```bash
   cd packages/dashboard-hooks
   bun run build
   ```

2. Restart dev server:
   ```bash
   # Stop with Ctrl+C, then:
   bun dev
   ```

---

## 📝 Common Commands

```bash
# From root directory:
bun dev                 # Start docs/demo site
bun run build          # Build the package
bun run build:all      # Build package + docs

# From packages/dashboard-hooks:
bun run build          # Build package
bun run typecheck      # Type check only
bun run dev            # Build in watch mode

# From apps/docs:
bun run dev            # Start Next.js dev server
bun run build          # Build for production
```

---

## 🎯 Next Steps

1. ✅ Test all features in the demo
2. ✅ Take screenshots for README
3. ✅ Verify package builds correctly
4. 🚀 Publish to npm when ready!

---

Good luck! 🚀
