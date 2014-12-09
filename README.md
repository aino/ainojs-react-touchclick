React TouchClick
----------------

React Component for optimizing touch clicks.

Usage:

    <TouchClick click={this.onClick} down={this.onMouseDown} up={this.onMouseUp}>
      [...]
    </TouchClick>

Props:

- **click** - click handler
- **down** -  touchdown/mousedown handler
- **up** - touchend/mouseup handler
- **nodeName** - nodeName of the surrounding node (default: DIV)
- **className** - className of the node
- **href** - href attribute