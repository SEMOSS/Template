---
name: semoss-testing-ci
description: Use when the user wants to add JUnit/Mockito tests for Java reactors, set up pre-commit hooks (husky + the pre-commit framework), or wire GitHub Actions CI (lint + unit-test workflows) to a SEMOSS app. The base template ships none of this to stay lean — this skill carries the full, working setup as reference files under reference/ that you copy back in and adapt. Do not use for the deploy flow (see semoss-deploy) or routine linting, which is just `pnpm fix` (Biome) at the repo root.
---

# Testing & CI Setup

The base template intentionally ships **no** test suite, pre-commit hooks, or CI
workflows — most apps don't need them, and they add noise. This skill holds a complete,
working setup harvested from the template, ready to reintroduce when a user asks for
"tests for my reactor," "a pre-commit hook," or "CI."

Everything below lives verbatim under `reference/` in this skill directory. The workflow
is: copy the relevant reference files into the project at the paths shown, then make the
matching `pom.xml` / `package.json` edits, then install tooling.

> **Routine linting is not this skill.** Day-to-day formatting/linting is just
> `pnpm fix` (Biome) at the repo root — that stays in the base template. This skill is
> only for the heavier testing/hook/CI scaffolding.

## 1. Java reactor unit tests (JUnit 5 + Mockito)

**Files** (copy `reference/test/` → project `test/`):

- `test/reactors/BaseReactorTest.java` — base class with the common mocks: `Insight`,
  `User`, `NounStore`, `PyTranslator`, a static `AssetUtility` mock, and a `@TempDir`.
  Provides `setReactorParameter(...)` (sets the reactor's `keyValue` map via reflection),
  `setupPyTranslatorMocks(...)`, `createPythonFile(...)`, and a `configureProjectProperties`
  override hook. All reactor tests extend this.
- `test/reactors/GetWeatherReactorTest.java` — worked example: valid input, missing param
  (error path), values with spaces, and the description-method assertions. Mirror this
  shape (Arrange-Act-Assert, `@DisplayName`) for new reactors.
- `test/reactors/ReactorTestSuite.java` — `@Suite` + `@SelectClasses({...})`. Add each new
  test class here so `mvn test -Dtest=ReactorTestSuite` runs them all.
- `test/resources/log4j2-test.xml` — silences logging during tests.

**`pom.xml` edits** — under `<build>` add the test source/output/resource wiring:

```xml
<testSourceDirectory>test</testSourceDirectory>
<testOutputDirectory>test-classes</testOutputDirectory>
<testResources>
  <testResource>
    <directory>test/resources</directory>
  </testResource>
</testResources>
```

Under `<dependencies>` add the `test`-scope deps (byte-buddy/objenesis excluded from
Mockito because SEMOSS already provides them at runtime):

```xml
<dependency>
  <groupId>org.junit.jupiter</groupId>
  <artifactId>junit-jupiter</artifactId>
  <version>6.0.0</version>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.junit.platform</groupId>
  <artifactId>junit-platform-suite</artifactId>
  <version>6.0.0</version>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.mockito</groupId>
  <artifactId>mockito-core</artifactId>
  <version>5.18.0</version>
  <scope>test</scope>
  <exclusions>
    <exclusion><groupId>net.bytebuddy</groupId><artifactId>byte-buddy</artifactId></exclusion>
    <exclusion><groupId>org.objenesis</groupId><artifactId>objenesis</artifactId></exclusion>
  </exclusions>
</dependency>
```

**Run:** `mvn test` (all), `mvn test -Dtest=ReactorTestSuite`, or
`mvn test -Dtest=GetWeatherReactorTest#testGetWeather_validCity` (single method).

## 2. Pre-commit hooks (husky + pre-commit framework)

Two layers run on `git commit`:

- **Husky** (`reference/husky/` → `.husky/`) — `pre-commit` runs `lint-staged` (Biome on
  staged FE files) then the Python `pre-commit` framework on staged BE files; `commit-msg`
  runs commitizen for conventional-commit linting.
- **pre-commit framework** (`reference/.pre-commit-config.yaml` → repo root) — Java
  (`pretty-format-java`/google-java-format), Python (`black`, `isort`, `mypy`), plus
  YAML/XML/whitespace/merge-conflict hooks.

**`package.json` edits** — restore the devDeps, the `lint-staged` block, and the fuller
`fix` script (the lean template's `fix` is Biome-only):

```json
"scripts": {
  "fix": "biome check --write && pre-commit run --all-files || pre-commit run --all-files"
},
"devDependencies": {
  "husky": "^9.1.7",
  "lint-staged": "^16.4.0"
},
"lint-staged": {
  "**/*.{js,jsx,ts,tsx,json,html,css}": ["biome check --write --no-errors-on-unmatched"]
}
```

**Install:** `pnpm install`, then `pnpm exec husky` (initializes `.husky/_`), and
`pip install pre-commit` (or `uv tool install pre-commit`) for the Python framework. The
`pretty-format-java` hook needs a JDK on PATH.

## 3. GitHub Actions CI

Copy `reference/workflows/` → `.github/workflows/`. Both trigger on `pull_request` +
`workflow_dispatch`.

- `pre-commit.yml` — installs pnpm/Node, runs Biome on `client/`, then runs the
  pre-commit framework across all files (caches hook envs, uv, and a JDK).
- `unit-test.yml` — Maven container; caches `~/.m2`, runs `mvn install -DskipTests` then
  `mvn test`. Has `workflow_dispatch` inputs for the SNAPSHOT version and a clean-install
  toggle.

> **Adapt before use.** These came from the platform's own CI: they target a self-hosted
> runner (`codebuild-semoss-github-runner-...`) and a `5.3.0-SNAPSHOT` SEMOSS version. For
> an app repo on GitHub-hosted runners, swap `runs-on` to e.g. `ubuntu-latest` and set the
> snapshot to your instance's SEMOSS version. The template also kept disabled copies under
> `.github/workflows/.disabled/` as a parking spot — replicate that pattern if you want a
> workflow staged but not firing.
