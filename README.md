# Canvas 2 Jimp comparison

This repo will hold some examples to replace Canvas with Jimp where we specifically focus on "performance". If Jimp performs almost equally in comparison to Canvas we will investigate replacing Canvas in [`@wdio/visual-testing|webdriver-image-comparison`](https://github.com/webdriverio/visual-testing)

## "Comparison"

I'm running this on a MacBook Pro:

- Chip: Apple M3 Pro
- Memory: 36GB
- Power adapter: charging (running on battery takes 30-40% longer)

## Testing

Each test will store data in a file

### Run Canvas tests

Run

```sh
node run.canvas.js
```

Results will be shown in the terminal but also in this file `run.canvas.txt`

### Run Jimp tests

Run

```sh
node run.jimp.cjs
```

Results will be shown in the terminal but also in this file `run.jimp.txt`

### Run Visual Tests

- Clone this rep
  go into the ` resemble`` folder with  `cd resemble`
- link the module with `npm link`
- Clone `https://github.com/webdriverio/visual-testing.git`
- Check out the branch `ws/canvas-2-jimp` with `git checkout ws/canvas-2-jimp`
- install the dependencies according to the project guidelines
- go into the `packages/webdriver-image-comparison` folder with `packages/webdriver-image-comparison`
- link the `resemble-jimp` with `npm link resemble-jimp`

Run one of the following tests and add the results in the txt files

```sh
# Local setup
pnpm test.local.init
# Run local tests
pnpm test.local.desktop

# Run Storybook and store results in `run.jimp.storybook.txt`
pnpm test.local.desktop.storybook

# Run SauceLabs web tests and store them in `run.jimp.saucelabs.web.txt`
pnpm test.saucelabs.web

# Run SauceLabs web tests and store them in `run.jimp.saucelabs.app.txt`
pnpm test.saucelabs.app
```

## Preliminary result

1. Comparing the images, without running them with WDIO, results in Jimp (pure JS dependency) being around 70% slower in comparing two images in comparison to using Canvas (a native dependency)
1. We don't see a huge difference between running WDIO tests with Jimp in comparison to using Canvas, so the 70% slowness might not be seen when running with Jimp
