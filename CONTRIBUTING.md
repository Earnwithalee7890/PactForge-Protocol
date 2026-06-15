# Contributing to PactForge

Thank you for contributing to PactForge! This guide outlines our development workflow, coding standards, and commit conventions.

## 🛠️ Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open local server**:
   Go to `http://localhost:3000` to preview the interface.

## 🌿 Git Workflow

We use structured branch names and commit messages to maintain a clean project history.

### Branch Conventions
* `feat/` - for new features
* `fix/` - for bug fixes
* `docs/` - for documentation
* `refactor/` - for code refactorings
* `style/` - for styling changes or animations
* `test/` - for unit or integration tests

### Commit Conventions
We follow the **Conventional Commits** specification:
* `feat`: A new feature
* `fix`: A bug fix
* `docs`: Documentation changes
* `style`: Styling, layout, or design updates
* `refactor`: Code changes that neither fix a bug nor add a feature
* `test`: Adding or modifying tests
* `chore`: Maintenance tasks or config updates

## 🧪 Testing

* Run ESLint to verify code quality:
  ```bash
  npm run lint
  ```
* Ensure all TypeScript files compile successfully without syntax or type errors:
  ```bash
  npm run build
  ```
