# Go Formatter Plugin for Brackets IDE

Adds a shortcut as well as a one-touch icon in the Brackets Toolbar to immediately reformat the contents of a file using `gofmt`.
That's all it does - nice and simple.

## Installation 
- Simple Method: Open the Brackets Extension Manager, search for "gofmt", and click install
- Manual Method: Download the source and move the entire `brackets-gofmt` into brackets extensions folder.

## Usage
Just press the format icon in the toolbar, or press Ctrl / ⌘ + Alt + F

<img src="https://cloud.githubusercontent.com/assets/17952318/20456536/af85085e-ae78-11e6-92ac-0a96dc674df8.png">

There's also a link in the Edit menu.

## Finding `gofmt`
Depending on your OS (looking at you, OSX) gofmt may not be found, and you'll need to point to the correct 
path for gofmt. The easiest way to solve this is to create a symlink to wherever gofmt is missing. For example:

* sudo ln -s /usr/local/go/bin/gofmt /usr/bin/gofmt

## Why?
Sometimes it's nice to be able to reformat your go files without having to save them first, drop to console, or 
spend all of that that extra energy typing. Since this didn't exist, it had to be made.


## License
MIT-licensed -- see `LICENSE` for details.
This project is based on Jonathan Blake's work , AKA earthspace.
