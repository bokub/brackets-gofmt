[![Build Status](https://travis-ci.org/bokub/brackets-gofmt.svg?branch=master)](https://travis-ci.org/bokub/brackets-gofmt)
[![Downloads](https://badges.ml/bokub.go-formatter/last-version.svg)](https://brackets-extension-badges.github.io/)
[![license](https://img.shields.io/badge/license-MIT-orange.svg)](https://raw.githubusercontent.com/bokub/brackets-gofmt/master/LICENSE)

# Improved Go Formatter for Brackets IDE

Gives you the ability to reformat the contents of a Go file using `gofmt` and `goimports`, just by pressing a shortcut of your choice.
Nice and simple.

The auto-imports feature is disabled by default, but you can enable it in the settings dialog.

## Installation
- Simple Method: Open the Brackets Extension Manager, search for "gofmt", and click install
- Alternative Method: Open the Brackets Extension Manager, click the Install from URL... button at the bottom, and paste `https://github.com/bokub/brackets-gofmt`
- Manual Method: Download the source and move the entire `brackets-gofmt` into brackets extensions folder.

## Usage
Just press the format icon in the toolbar, or press Ctrl / ⌘ + Alt + F if you haven't changed the shorcut.

<img src="https://cloud.githubusercontent.com/assets/17952318/20456536/af85085e-ae78-11e6-92ac-0a96dc674df8.png">

There's also a link in the Edit menu.

## Settings
Under the *File* menu, click *Go Formatter settings* to open the settings dialog. You will be able to toggle the usage of
goimports (disabled by default), change the Go Formatter shortcut, or set the paths for gofmt and goimports.

Please note that your GOPATH is needed in order to use goimports. A wrong GOPATH will result in some import lines being removed.

## Why?
Sometimes it's nice to be able to reformat your go files without having to save them first, drop to console, or
spend all of that that extra energy typing. Since this didn't exist, it had to be made.

## License
MIT-licensed -- see `LICENSE` for details.
This project is based on Jonathan Blake's work , AKA earthspace. The original extension is still available in Brackets extension manager.
